import type { BookResult } from "@/types";

interface KitsuAttributes {
  canonicalTitle?: string;
  synopsis?: string;
  genres?: string[];
  posterImage?: { large?: string; medium?: string; original?: string };
  coverImage?: { large?: string; medium?: string; original?: string };
}

export async function searchKitsu(title: string): Promise<BookResult | null> {
  try {
    const url = `https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(title)}&page[limit]=3`;
    const res = await fetch(url, {
      headers: { Accept: "application/vnd.api+json" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      data?: Array<{ attributes?: KitsuAttributes }>;
    };

    const attrs = data?.data?.[0]?.attributes;
    if (!attrs) return null;

    const coverUrl =
      attrs.posterImage?.large ??
      attrs.posterImage?.medium ??
      attrs.coverImage?.large ??
      null;

    return {
      title: attrs.canonicalTitle ?? title,
      author: "Unknown",
      description: attrs.synopsis ?? "",
      genres: attrs.genres ?? ["Манга"],
      coverUrl,
      googleBooksId: null,
      openLibraryKey: null,
    };
  } catch {
    return null;
  }
}
