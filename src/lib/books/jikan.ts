export async function searchJikan(title: string): Promise<string | null> {
  try {
    const url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(title)}&limit=3`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as {
      data?: Array<{
        images?: {
          jpg?: { large_image_url?: string; image_url?: string };
          webp?: { large_image_url?: string; image_url?: string };
        };
      }>;
    };

    const first = data?.data?.[0]?.images;
    if (!first) return null;

    return (
      first.jpg?.large_image_url ??
      first.webp?.large_image_url ??
      first.jpg?.image_url ??
      null
    );
  } catch {
    return null;
  }
}
