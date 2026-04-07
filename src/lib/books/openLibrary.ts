import type { BookResult } from "@/types";

const SEARCH_URL = "https://openlibrary.org/search.json";

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_sentence?: { value: string }[];
  subject?: string[];
  cover_i?: number;
}

interface OpenLibraryResponse {
  numFound: number;
  docs: OpenLibraryDoc[];
}

export async function searchOpenLibrary(
  query: string,
  limit = 5
): Promise<BookResult[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    language: "eng",
  });

  const res = await fetch(`${SEARCH_URL}?${params}`);
  if (!res.ok) return [];

  const data: OpenLibraryResponse = await res.json();
  return data.docs.map(normalizeOpenLibraryDoc);
}

export function getOpenLibraryCoverUrl(
  coverId: number,
  size: "S" | "M" | "L" = "L"
): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

function normalizeOpenLibraryDoc(doc: OpenLibraryDoc): BookResult {
  return {
    title: doc.title,
    author: doc.author_name?.join(", ") ?? "Unknown Author",
    description: doc.first_sentence?.[0]?.value ?? "",
    genres: (doc.subject ?? []).slice(0, 5),
    coverUrl: doc.cover_i ? getOpenLibraryCoverUrl(doc.cover_i) : null,
    googleBooksId: null,
    openLibraryKey: doc.key,
  };
}
