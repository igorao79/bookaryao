import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedBooks, reviews } from "@/lib/db/schema";
import { eq, desc, inArray, sql } from "drizzle-orm";
import type { SavedBook } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const books = await db
    .select()
    .from(savedBooks)
    .where(eq(savedBooks.userId, session.user.id))
    .orderBy(desc(savedBooks.createdAt));

  // Gather bookKeys to fetch review aggregates
  const bookKeys = books
    .map((b) => b.googleBooksId ?? b.openLibraryKey)
    .filter((k): k is string => Boolean(k));

  const ratingMap = new Map<string, { avgRating: number; reviewCount: number }>();

  if (bookKeys.length > 0) {
    const aggregates = await db
      .select({
        bookKey: reviews.bookKey,
        avgRating: sql<number>`ROUND(AVG(${reviews.rating}), 1)`,
        reviewCount: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(inArray(reviews.bookKey, bookKeys))
      .groupBy(reviews.bookKey);

    for (const row of aggregates) {
      ratingMap.set(row.bookKey, {
        avgRating: Number(row.avgRating),
        reviewCount: Number(row.reviewCount),
      });
    }
  }

  const parsed: SavedBook[] = books.map((b) => {
    const bookKey = b.googleBooksId ?? b.openLibraryKey;
    const ratingData = bookKey ? ratingMap.get(bookKey) : undefined;
    return {
      ...b,
      genres: JSON.parse(b.genres ?? "[]"),
      avgRating: ratingData?.avgRating ?? 0,
      reviewCount: ratingData?.reviewCount ?? 0,
    };
  });

  return NextResponse.json(parsed);
}
