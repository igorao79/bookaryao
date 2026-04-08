import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { searchHistory } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { rejectRequestSchema } from "@/types";
import type { RejectedBook, BookRecommendation } from "@/types";
import { getBookRecommendation } from "@/lib/ai/groq";
import {
  buildSearchFromScratchPrompt,
  buildSearchBySimilarPrompt,
} from "@/lib/ai/prompts";
import { findBook, enrichBookWithCover } from "@/lib/books/search";
import { appendRejection, getUserPreferences } from "@/lib/db/userPreferences";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = rejectRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { searchHistoryId, rejectedBook, reason, originalRequest } =
    parsed.data;

  // Update search history with the rejected book
  const history = await db.query.searchHistory.findFirst({
    where: and(
      eq(searchHistory.id, searchHistoryId),
      eq(searchHistory.userId, session.user.id)
    ),
  });

  if (!history) {
    return NextResponse.json(
      { error: "Search history not found" },
      { status: 404 }
    );
  }

  const existingRejected: RejectedBook[] = JSON.parse(
    history.rejectedBooks ?? "[]"
  );
  const updatedRejected: RejectedBook[] = [
    ...existingRejected,
    { title: rejectedBook.title, author: rejectedBook.author, reason },
  ];

  await db
    .update(searchHistory)
    .set({ rejectedBooks: JSON.stringify(updatedRejected) })
    .where(eq(searchHistory.id, searchHistoryId));

  // Persist rejection to cross-session user preferences
  await appendRejection(session.user.id, {
    title: rejectedBook.title,
    author: rejectedBook.author,
    reason,
  });

  const pastRejections = await getUserPreferences(session.user.id);

  // Build new prompt with updated rejected books
  let prompts: { system: string; user: string };
  let userGenres: string[] = [];

  if (originalRequest.type === "scratch") {
    userGenres = [originalRequest.genre];
    prompts = buildSearchFromScratchPrompt(
      originalRequest.genre,
      originalRequest.description,
      updatedRejected,
      pastRejections
    );
  } else {
    prompts = buildSearchBySimilarPrompt(
      originalRequest.bookTitle,
      originalRequest.author || undefined,
      originalRequest.whatYouLiked,
      updatedRejected,
      pastRejections
    );
  }

  // Get new recommendation
  try {
    const aiSuggestion = await getBookRecommendation(
      prompts.system,
      prompts.user
    );
    const book = await findBook(aiSuggestion.searchQuery, aiSuggestion.title);
    if (!book) {
      return NextResponse.json(
        { error: "Could not find an alternative recommendation." },
        { status: 404 }
      );
    }

    const enrichedBook = await enrichBookWithCover(book);
    const matchingGenres = enrichedBook.genres.filter((g) =>
      userGenres.some(
        (ug) =>
          g.toLowerCase().includes(ug.toLowerCase()) ||
          ug.toLowerCase().includes(g.toLowerCase())
      )
    );

    const recommendation: BookRecommendation = {
      ...enrichedBook,
      aiSummary: aiSuggestion.whyItMatches,
      matchingGenres,
    };

    return NextResponse.json({
      recommendation,
      searchHistoryId,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to find an alternative. Please try again." },
      { status: 500 }
    );
  }
}
