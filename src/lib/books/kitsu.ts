export async function searchKitsu(title: string): Promise<string | null> {
  try {
    const url = `https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(title)}&page[limit]=3`;
    const res = await fetch(url, {
      headers: { Accept: "application/vnd.api+json" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      data?: Array<{
        attributes?: {
          posterImage?: { large?: string; medium?: string; original?: string };
          coverImage?: { large?: string; medium?: string; original?: string };
        };
      }>;
    };

    const first = data?.data?.[0]?.attributes;
    if (!first) return null;

    return (
      first.posterImage?.large ??
      first.posterImage?.medium ??
      first.coverImage?.large ??
      first.coverImage?.medium ??
      null
    );
  } catch {
    return null;
  }
}
