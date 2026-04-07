import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchGoogleBooks, getGoogleBookById } from "@/lib/books/googleBooks";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("searchGoogleBooks", () => {
  it("returns normalized book results", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          totalItems: 1,
          items: [
            {
              id: "vol-1",
              volumeInfo: {
                title: "Test Book",
                authors: ["Author One", "Author Two"],
                description: "A test description",
                categories: ["Fiction", "Adventure"],
                imageLinks: {
                  thumbnail: "http://books.google.com/thumb?zoom=1",
                },
              },
            },
          ],
        }),
    });

    const results = await searchGoogleBooks("test query");

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      title: "Test Book",
      author: "Author One, Author Two",
      description: "A test description",
      genres: ["Fiction", "Adventure"],
      coverUrl: expect.stringContaining("https://"),
      googleBooksId: "vol-1",
      openLibraryKey: null,
    });
  });

  it("upgrades HTTP cover URLs to HTTPS", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          totalItems: 1,
          items: [
            {
              id: "vol-1",
              volumeInfo: {
                title: "Test",
                imageLinks: {
                  thumbnail: "http://books.google.com/thumb",
                },
              },
            },
          ],
        }),
    });

    const results = await searchGoogleBooks("test");
    expect(results[0].coverUrl).toMatch(/^https:\/\//);
  });

  it("returns empty array on API error", async () => {
    mockFetch.mockResolvedValue({ ok: false });

    const results = await searchGoogleBooks("test");
    expect(results).toEqual([]);
  });

  it("returns empty array when no items", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ totalItems: 0 }),
    });

    const results = await searchGoogleBooks("test");
    expect(results).toEqual([]);
  });

  it("handles missing fields gracefully", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          totalItems: 1,
          items: [
            {
              id: "vol-1",
              volumeInfo: {
                title: "Minimal Book",
              },
            },
          ],
        }),
    });

    const results = await searchGoogleBooks("minimal");
    expect(results[0].author).toBe("Unknown Author");
    expect(results[0].description).toBe("");
    expect(results[0].genres).toEqual([]);
    expect(results[0].coverUrl).toBeNull();
  });
});

describe("getGoogleBookById", () => {
  it("returns a normalized book", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "vol-99",
          volumeInfo: {
            title: "Specific Book",
            authors: ["Someone"],
            description: "Description here",
            categories: ["Mystery"],
          },
        }),
    });

    const result = await getGoogleBookById("vol-99");
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Specific Book");
    expect(result!.googleBooksId).toBe("vol-99");
  });

  it("returns null on API error", async () => {
    mockFetch.mockResolvedValue({ ok: false });

    const result = await getGoogleBookById("bad-id");
    expect(result).toBeNull();
  });
});
