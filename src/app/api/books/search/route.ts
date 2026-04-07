import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { searchHistory } from "@/lib/db/schema";
import { searchRequestSchema } from "@/types";
import type { BookRecommendation, RejectedBook } from "@/types";
import { getBookRecommendation } from "@/lib/ai/groq";
import {
  buildSearchFromScratchPrompt,
  buildSearchBySimilarPrompt,
} from "@/lib/ai/prompts";
import { findBook, enrichBookWithCover } from "@/lib/books/search";

const MAX_AI_RETRIES = 3;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = searchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  let userGenres: string[] = [];

  // Build prompt based on search type
  let prompts: { system: string; user: string };
  if (data.type === "scratch") {
    userGenres = [data.genre];
    prompts = buildSearchFromScratchPrompt(
      data.genre,
      data.description,
      data.rejectedBooks as RejectedBook[]
    );
  } else {
    prompts = buildSearchBySimilarPrompt(
      data.bookTitle,
      data.author || undefined,
      data.whatYouLiked,
      data.rejectedBooks as RejectedBook[]
    );
  }

  // Try to get a valid recommendation
  for (let attempt = 0; attempt < MAX_AI_RETRIES; attempt++) {
    try {
      const aiSuggestion = await getBookRecommendation(
        prompts.system,
        prompts.user +
          (attempt > 0
            ? "\n\nIMPORTANT: Previous suggestion could not be found. Please suggest a more well-known, popular book."
            : "")
      );

      // Validate the book exists via real APIs
      const book = await findBook(
        aiSuggestion.searchQuery,
        aiSuggestion.title
      );
      if (!book) continue;

      // Enrich with cover if missing
      const enrichedBook = await enrichBookWithCover(book);

      // Determine matching genres
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

      // Save search history
      const [historyRecord] = await db
        .insert(searchHistory)
        .values({
          userId: session.user.id,
          query: data.type === "scratch" ? data.description : data.bookTitle,
          searchType: data.type,
          rejectedBooks: JSON.stringify(data.rejectedBooks ?? []),
        })
        .returning();

      return NextResponse.json({
        recommendation,
        searchHistoryId: historyRecord.id,
      });
    } catch (error) {
      console.error(`Search attempt ${attempt + 1} failed:`, error);
      if (attempt === MAX_AI_RETRIES - 1) {
        return NextResponse.json(
          { error: "Failed to find a book recommendation. Please try again." },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json(
    { error: "No matching book found after multiple attempts." },
    { status: 404 }
  );
}
