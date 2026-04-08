import type { BookResult } from "@/types";
import { searchGoogleBooks, getGoogleBookById } from "./googleBooks";
import { searchOpenLibrary } from "./openLibrary";
import { searchAniList } from "./anilist";
import { searchKitsu } from "./kitsu";
import { searchJikan } from "./jikan";
import { searchMangaDex } from "./mangadex";

/**
 * Search for a book by query. Tries Google Books → Open Library → Manga APIs.
 */
export async function findBook(
  searchQuery: string,
  expectedTitle?: string
): Promise<BookResult | null> {
  // 1. Try Google Books
  const googleResults = await searchGoogleBooks(searchQuery, 5);
  const googleMatch = findBestMatch(googleResults, expectedTitle);
  if (googleMatch) return googleMatch;

  // 2. Try Open Library
  const olResults = await searchOpenLibrary(searchQuery, 5);
  const olMatch = findBestMatch(olResults, expectedTitle);
  if (olMatch) return olMatch;

  // 3. Any result from western APIs (even without title match)
  if (googleResults.length > 0) return googleResults[0];
  if (olResults.length > 0) return olResults[0];

  // 4. Fall back to manga-specific APIs (great for titles not on Google Books)
  return findMangaBook(expectedTitle ?? searchQuery);
}

/**
 * Query AniList, Jikan, Kitsu, MangaDex in parallel and return the first hit.
 */
async function findMangaBook(title: string): Promise<BookResult | null> {
  const [anilist, jikan, kitsu, mangadex] = await Promise.all([
    searchAniList(title),
    searchJikan(title),
    searchKitsu(title),
    searchMangaDexBook(title),
  ]);
  return anilist ?? jikan ?? kitsu ?? mangadex ?? null;
}

/**
 * MangaDex: search and return a full BookResult (including cover URL).
 */
async function searchMangaDexBook(title: string): Promise<BookResult | null> {
  try {
    const url = `https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=3&includes[]=cover_art&includes[]=author`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as {
      data?: Array<{
        id: string;
        attributes?: {
          title?: Record<string, string>;
          description?: Record<string, string>;
          tags?: Array<{ attributes?: { name?: Record<string, string> } }>;
        };
        relationships?: Array<{
          type: string;
          attributes?: { fileName?: string; name?: string };
        }>;
      }>;
    };

    const manga = data?.data?.[0];
    if (!manga) return null;

    const attrs = manga.attributes;
    const titleStr =
      attrs?.title?.en ??
      Object.values(attrs?.title ?? {})[0] ??
      title;

    const coverRel = manga.relationships?.find((r) => r.type === "cover_art");
    const authorRel = manga.relationships?.find((r) => r.type === "author");
    const fileName = coverRel?.attributes?.fileName;
    const coverUrl = fileName
      ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.512.jpg`
      : null;

    const genres =
      manga.attributes?.tags
        ?.map((t) => t.attributes?.name?.en)
        .filter((n): n is string => Boolean(n)) ?? ["Манга"];

    return {
      title: titleStr,
      author: authorRel?.attributes?.name ?? "Unknown",
      description: attrs?.description?.en ?? Object.values(attrs?.description ?? {})[0] ?? "",
      genres,
      coverUrl,
      googleBooksId: null,
      openLibraryKey: null,
    };
  } catch {
    return null;
  }
}

/**
 * Enrich a BookResult with a cover if it's missing.
 * Google Books by ID → Open Library → all manga APIs in parallel.
 */
export async function enrichBookWithCover(
  book: BookResult
): Promise<BookResult> {
  if (book.coverUrl) return book;

  // List results often omit imageLinks even when the book has a cover.
  if (book.googleBooksId) {
    const full = await getGoogleBookById(book.googleBooksId);
    if (full?.coverUrl) return { ...book, coverUrl: full.coverUrl };
  }

  // Try Open Library
  const olResults = await searchOpenLibrary(`${book.title} ${book.author}`, 1);
  if (olResults[0]?.coverUrl) {
    return { ...book, coverUrl: olResults[0].coverUrl };
  }

  // Fan out to all manga cover APIs in parallel
  const [anilist, jikan, kitsu, mangadex] = await Promise.all([
    searchAniList(book.title),
    searchJikan(book.title),
    searchKitsu(book.title),
    searchMangaDex(book.title),
  ]);

  // searchMangaDex (cover-only helper in mangadex.ts) still returns string | null
  // the others now return BookResult | null
  const mangaCover =
    anilist?.coverUrl ?? jikan?.coverUrl ?? kitsu?.coverUrl ?? mangadex ?? null;

  if (mangaCover) return { ...book, coverUrl: mangaCover };
  return book;
}

function findBestMatch(
  results: BookResult[],
  expectedTitle?: string
): BookResult | null {
  if (results.length === 0) return null;
  if (!expectedTitle) return results[0];

  const normalizedExpected = normalize(expectedTitle);

  const exactMatch = results.find(
    (r) => normalize(r.title) === normalizedExpected
  );
  if (exactMatch) return exactMatch;

  const partialMatch = results.find(
    (r) =>
      normalize(r.title).includes(normalizedExpected) ||
      normalizedExpected.includes(normalize(r.title))
  );
  if (partialMatch) return partialMatch;

  return results[0];
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}
