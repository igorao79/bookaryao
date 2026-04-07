import type { BookResult } from "@/types";

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

interface GoogleBooksResponse {
  totalItems: number;
  items?: GoogleBooksVolume[];
}

export async function searchGoogleBooks(
  query: string,
  maxResults = 5
): Promise<BookResult[]> {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
    printType: "books",
    langRestrict: "en",
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) return [];

  const data: GoogleBooksResponse = await res.json();
  if (!data.items) return [];

  return data.items.map(normalizeGoogleBook);
}

export async function getGoogleBookById(
  volumeId: string
): Promise<BookResult | null> {
  const res = await fetch(`${BASE_URL}/${volumeId}`);
  if (!res.ok) return null;

  const data: GoogleBooksVolume = await res.json();
  return normalizeGoogleBook(data);
}

function normalizeGoogleBook(volume: GoogleBooksVolume): BookResult {
  const info = volume.volumeInfo;
  let coverUrl = info.imageLinks?.thumbnail ?? null;
  // upgrade to higher quality by removing edge/zoom params
  if (coverUrl) {
    coverUrl = coverUrl.replace("&edge=curl", "").replace("zoom=1", "zoom=2");
    coverUrl = coverUrl.replace("http://", "https://");
  }

  return {
    title: info.title,
    author: info.authors?.join(", ") ?? "Unknown Author",
    description: info.description ?? "",
    genres: info.categories ?? [],
    coverUrl,
    googleBooksId: volume.id,
    openLibraryKey: null,
  };
}
