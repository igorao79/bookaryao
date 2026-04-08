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
  }
}
`;

export interface AniListResult {
  coverUrl: string | null;
  title: string | null;
}

export async function searchAniList(title: string): Promise<AniListResult> {
  try {
    const res = await fetch(ANILIST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query: SEARCH_QUERY, variables: { search: title } }),
    });
    if (!res.ok) return { coverUrl: null, title: null };

    const data = (await res.json()) as {
      data?: { Media?: { title?: { romaji?: string; english?: string }; coverImage?: { extraLarge?: string; large?: string } } };
    };
    const media = data?.data?.Media;
    if (!media) return { coverUrl: null, title: null };

    return {
      coverUrl: media.coverImage?.extraLarge ?? media.coverImage?.large ?? null,
      title: media.title?.english ?? media.title?.romaji ?? null,
    };
  } catch {
    return { coverUrl: null, title: null };
  }
}
