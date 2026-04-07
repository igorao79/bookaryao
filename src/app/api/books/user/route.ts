import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedBooks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
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

  const parsed: SavedBook[] = books.map((b) => ({
    ...b,
    genres: JSON.parse(b.genres ?? "[]"),
  }));

  return NextResponse.json(parsed);
}
