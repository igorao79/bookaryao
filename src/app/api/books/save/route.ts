import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedBooks } from "@/lib/db/schema";
import { saveBookSchema } from "@/types";
import { uploadBookCover } from "@/lib/cloudinary";
import { or, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = saveBookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const bookId = crypto.randomUUID();

  // Reuse existing Cloudinary cover if this book was already saved by anyone
  let cloudinaryCoverUrl: string | null = null;
  if (data.coverUrl) {
    if (data.googleBooksId || data.openLibraryKey) {
      const conditions = [];
      if (data.googleBooksId) conditions.push(eq(savedBooks.googleBooksId, data.googleBooksId));
      if (data.openLibraryKey) conditions.push(eq(savedBooks.openLibraryKey, data.openLibraryKey));

      const existing = await db
        .select({ coverUrl: savedBooks.coverUrl })
        .from(savedBooks)
        .where(or(...conditions))
        .limit(1);

      if (existing[0]?.coverUrl?.includes("cloudinary.com")) {
        cloudinaryCoverUrl = existing[0].coverUrl;
      }
    }

    if (!cloudinaryCoverUrl) {
      cloudinaryCoverUrl = await uploadBookCover(data.coverUrl, bookId);
    }
  }

  const [saved] = await db
    .insert(savedBooks)
    .values({
      id: bookId,
      userId: session.user.id,
      title: data.title,
      author: data.author,
      description: data.description ?? null,
      genres: JSON.stringify(data.genres),
      coverUrl: cloudinaryCoverUrl ?? data.coverUrl,
      aiSummary: data.aiSummary,
      googleBooksId: data.googleBooksId,
      openLibraryKey: data.openLibraryKey,
    })
    .returning();

  return NextResponse.json(saved);
}
