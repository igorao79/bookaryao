import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const createReviewSchema = z.object({
  bookKey: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().max(1000).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookKey = searchParams.get("bookKey");
  if (!bookKey) {
    return NextResponse.json({ error: "bookKey required" }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.bookKey, bookKey))
    .orderBy(desc(reviews.createdAt));

  const avgRating =
    rows.length > 0
      ? Math.round((rows.reduce((s, r) => s + r.rating, 0) / rows.length) * 10) / 10
      : 0;

  return NextResponse.json({ reviews: rows, avgRating, reviewCount: rows.length });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { bookKey, rating, reviewText } = parsed.data;

  // Upsert: delete existing review from this user for this book, then insert
  await db
    .delete(reviews)
    .where(and(eq(reviews.userId, session.user.id), eq(reviews.bookKey, bookKey)));

  const [review] = await db
    .insert(reviews)
    .values({
      userId: session.user.id,
      bookKey,
      rating,
      reviewText: reviewText ?? null,
      userName: session.user.name ?? null,
      userImage: session.user.image ?? null,
    })
    .returning();

  return NextResponse.json(review);
}
