import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedBooks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { deleteBookCover } from "@/lib/cloudinary";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const book = await db.query.savedBooks.findFirst({
    where: and(
      eq(savedBooks.id, id),
      eq(savedBooks.userId, session.user.id)
    ),
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  // Delete from Cloudinary
  await deleteBookCover(id);

  // Delete from database
  await db
    .delete(savedBooks)
    .where(
      and(eq(savedBooks.id, id), eq(savedBooks.userId, session.user.id))
    );

  return new Response(null, { status: 204 });
}
