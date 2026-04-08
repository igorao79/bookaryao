import type { RejectedBook, RejectedBookWithDate } from "@/types";

const SYSTEM_BASE = `You are an expert book recommendation assistant. You have deep knowledge of world literature across all genres, time periods, and cultures. Your goal is to recommend real, published books that genuinely exist.

CRITICAL RULES:
1. Only recommend REAL books that have been published and can be found on Google Books or Open Library.
2. Never invent or hallucinate book titles.
3. Prefer well-known, widely available books.
4. Always respond with valid JSON.
5. In the "whyItMatches" field, use CORRECT and CANONICAL character/author names — double-check spellings before writing them. For example: Saitama (not Saitaku), Light Yagami (not Light Yagami), etc.

Your response MUST be a JSON object with exactly these fields:
{
  "title": "exact book title",
  "author": "full author name",
  "genres": ["genre1", "genre2"],
  "whyItMatches": "2-3 sentence explanation IN RUSSIAN of why this book matches the user's request",
  "searchQuery": "optimized search query for finding this book on Google Books API — use romanized/Latin characters only, include title and author name"
}`;

function formatRejectedBooks(rejected: RejectedBook[]): string {
  if (rejected.length === 0) return "";

  const lines = rejected.map(
    (b) => `- "${b.title}" by ${b.author} (Reason: ${b.reason})`
  );
  return `\n\nDO NOT recommend these books (they were already rejected):\n${lines.join("\n")}`;
}

function formatPastPreferences(past: RejectedBookWithDate[]): string {
  if (past.length === 0) return "";

  const lines = past.map(
    (b) => `- "${b.title}" by ${b.author} (Reason: ${b.reason})`
  );
  return `\n\nUSER'S PAST PREFERENCES (rejected in previous sessions — avoid similar books):\n${lines.join("\n")}`;
}

function formatSavedBooks(saved: { title: string; author: string }[]): string {
  if (saved.length === 0) return "";

  const lines = saved.map((b) => `- "${b.title}" by ${b.author}`);
  return `\n\nDO NOT recommend these books (user already has them in their library):\n${lines.join("\n")}`;
}

export function buildSearchFromScratchPrompt(
  genre: string,
  description: string,
  rejectedBooks: RejectedBook[] = [],
  pastRejections: RejectedBookWithDate[] = [],
  savedBooks: { title: string; author: string }[] = []
): { system: string; user: string } {
  const system =
    SYSTEM_BASE +
    `\n\nThe user is looking for a book from scratch based on their preferred genre and description. Find the BEST single book that matches their preferences.` +
    formatRejectedBooks(rejectedBooks) +
    formatPastPreferences(pastRejections) +
    formatSavedBooks(savedBooks);

  const user = `Genre: ${genre}\n\nWhat I'm looking for: ${description}`;

  return { system, user };
}

export function buildSearchBySimilarPrompt(
  bookTitle: string,
  author: string | undefined,
  whatTheyLiked: string,
  rejectedBooks: RejectedBook[] = [],
  pastRejections: RejectedBookWithDate[] = [],
  savedBooks: { title: string; author: string }[] = []
): { system: string; user: string } {
  const system =
    SYSTEM_BASE +
    `\n\nThe user wants a book similar to one they've already read. Find a DIFFERENT book that shares qualities they enjoyed. DO NOT recommend the same book they mentioned.` +
    formatRejectedBooks(rejectedBooks) +
    formatPastPreferences(pastRejections) +
    formatSavedBooks(savedBooks);

  const authorLine = author ? ` by ${author}` : "";
  const user = `Book I liked: "${bookTitle}"${authorLine}\n\nWhat I enjoyed about it: ${whatTheyLiked}`;

  return { system, user };
}
