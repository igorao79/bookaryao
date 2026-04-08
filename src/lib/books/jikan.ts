import type { BookResult } from "@/types";

interface JikanEntry {
  title: string;
  title_english?: string;
  images?: {
    jpg?: { large_image_url?: string; image_url?: string };
    webp?: { large_image_url?: string; image_url?: string };
  };
  synopsis?: string;
  genres?: Array<{ name: string }>;
  authors?: Array<{ name: string }>;
}

export async function searchJikan(title: string): Promise<BookResult | null> {
  try {
    const url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(title)}&limit=3`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as { data?: JikanEntry[] };
    const first = data?.data?.[0];
    if (!first) return null;

    const coverUrl =
      first.images?.jpg?.large_image_url ??
      first.images?.webp?.large_image_url ??
      first.images?.jpg?.image_url ??
      null;

    return {
      title: first.title_english ?? first.title,
      author: first.authors?.map((a) => a.name).join(", ") ?? "Unknown",
      description: first.synopsis ?? "",
      genres: first.genres?.map((g) => g.name) ?? ["Манга"],
      coverUrl,
      googleBooksId: null,
      openLibraryKey: null,
    };
  } catch {
    return null;
  }
}
