export async function searchMangaDex(title: string): Promise<string | null> {
  try {
    // Search manga with cover_art relationship included
    const searchUrl = `https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=3&includes[]=cover_art`;
    const res = await fetch(searchUrl);
    if (!res.ok) return null;

    const data = (await res.json()) as {
      data?: Array<{
        id: string;
        relationships?: Array<{
          type: string;
          attributes?: { fileName?: string };
        }>;
      }>;
    };

    const manga = data?.data?.[0];
    if (!manga) return null;

    const coverRel = manga.relationships?.find((r) => r.type === "cover_art");
    const fileName = coverRel?.attributes?.fileName;
    if (!fileName) return null;

    return `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.512.jpg`;
  } catch {
    return null;
  }
}
