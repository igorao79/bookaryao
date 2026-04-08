import type { BookResult } from "@/types";
import { searchGoogleBooks, getGoogleBookById } from "./googleBooks";
import { searchOpenLibrary } from "./openLibrary";

/**
 * Search for a book by query. Tries Google Books first, falls back to Open Library.
 * Picks the best match by title similarity.
 */
export async function findBook(
  searchQuery: string,
  expectedTitle?: string
): Promise<BookResult | null> {
  // Try Google Books first
  const googleResults = await searchGoogleBooks(searchQuery, 5);
  const googleMatch = findBestMatch(googleResults, expectedTitle);
  if (googleMatch) return googleMatch;

  // Fall back to Open Library
  const olResults = await searchOpenLibrary(searchQuery, 5);
  const olMatch = findBestMatch(olResults, expectedTitle);
  if (olMatch) return olMatch;

  // If we have any results at all, return the first one
  if (googleResults.length > 0) return googleResults[0];
  if (olResults.length > 0) return olResults[0];

  return null;
}

/**
 * Merge cover data: if Google result has no cover, try fetching by ID,
 * then fall back to Open Library.
 */
export async function enrichBookWithCover(
  book: BookResult
): Promise<BookResult> {
  if (book.coverUrl) return book;

  // List results often omit imageLinks even when the book has a cover.
  // Fetch the individual volume for a more complete response.
  if (book.googleBooksId) {
    const full = await getGoogleBookById(book.googleBooksId);
    if (full?.coverUrl) return { ...book, coverUrl: full.coverUrl };
  }

  // Try Open Library for cover
  const olResults = await searchOpenLibrary(
    `${book.title} ${book.author}`,
    1
  );
  if (olResults[0]?.coverUrl) {
    return { ...book, coverUrl: olResults[0].coverUrl };
  }

  return book;
}

function findBestMatch(
  results: BookResult[],
  expectedTitle?: string
): BookResult | null {
  if (results.length === 0) return null;
  if (!expectedTitle) return results[0];

  const normalizedExpected = normalize(expectedTitle);

  // Exact or close match
  const exactMatch = results.find(
    (r) => normalize(r.title) === normalizedExpected
  );
  if (exactMatch) return exactMatch;

  // Partial match
  const partialMatch = results.find(
    (r) =>
      normalize(r.title).includes(normalizedExpected) ||
      normalizedExpected.includes(normalize(r.title))
  );
  if (partialMatch) return partialMatch;

  // Return first result as fallback
  return results[0];
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}
