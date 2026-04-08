import type { BookResult } from "@/types";

const ANILIST_URL = "https://graphql.anilist.co";

const SEARCH_QUERY = `
query ($search: String) {
  Media(search: $search, type: MANGA, sort: SEARCH_MATCH) {
    title {
      romaji
      english
    }
    coverImage {
      extraLarge
      large
    }
    description(asHtml: false)
    genres
    staff(perPage: 3) {
      edges {
        node {
          name { full }
        }
      }
    }
  }
}
`;

interface AniListMedia {
  title?: { romaji?: string; english?: string };
  coverImage?: { extraLarge?: string; large?: string };
  description?: string;
  genres?: string[];
  staff?: { edges?: Array<{ node?: { name?: { full?: string } } }> };
}

export async function searchAniList(title: string): Promise<BookResult | null> {
  try {
    const res = await fetch(ANILIST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: SEARCH_QUERY, variables: { search: title } }),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { data?: { Media?: AniListMedia } };
    const media = data?.data?.Media;
    if (!media) return null;

    const bookTitle = media.title?.english ?? media.title?.romaji ?? title;
    const coverUrl = media.coverImage?.extraLarge ?? media.coverImage?.large ?? null;
    const author =
      media.staff?.edges
        ?.map((e) => e.node?.name?.full)
        .filter(Boolean)
        .join(", ") ?? "Unknown";
    const description = media.description?.replace(/<[^>]*>/g, "").trim() ?? "";
    const genres = media.genres ?? ["Манга"];

    return {
      title: bookTitle,
      author,
      description,
      genres,
      coverUrl,
      googleBooksId: null,
      openLibraryKey: null,
    };
  } catch {
    return null;
  }
}
