import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedBooks } from "@/lib/db/schema";
import { saveBookSchema } from "@/types";
import { uploadBookCover } from "@/lib/cloudinary";

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

  // Upload cover to Cloudinary (graceful failure)
  let cloudinaryCoverUrl: string | null = null;
  if (data.coverUrl) {
    cloudinaryCoverUrl = await uploadBookCover(data.coverUrl, bookId);
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
