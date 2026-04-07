import { describe, it, expect, vi, beforeEach } from "vitest";
import { findBook, enrichBookWithCover } from "@/lib/books/search";
import * as googleBooks from "@/lib/books/googleBooks";
import * as openLibrary from "@/lib/books/openLibrary";
import type { BookResult } from "@/types";

vi.mock("@/lib/books/googleBooks");
vi.mock("@/lib/books/openLibrary");

const mockGoogleBook: BookResult = {
  title: "Dune",
  author: "Frank Herbert",
  description: "A science fiction epic",
  genres: ["Science Fiction"],
  coverUrl: "https://books.google.com/cover.jpg",
  googleBooksId: "google-123",
  openLibraryKey: null,
};

const mockOLBook: BookResult = {
  title: "Dune",
  author: "Frank Herbert",
  description: "Desert planet story",
  genres: ["Science Fiction", "Adventure"],
  coverUrl: "https://covers.openlibrary.org/b/id/123-L.jpg",
  googleBooksId: null,
  openLibraryKey: "/works/OL123",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("findBook", () => {
  it("returns Google Books result when available", async () => {
    vi.mocked(googleBooks.searchGoogleBooks).mockResolvedValue([mockGoogleBook]);
    vi.mocked(openLibrary.searchOpenLibrary).mockResolvedValue([]);

    const result = await findBook("Dune Frank Herbert", "Dune");

    expect(result).toEqual(mockGoogleBook);
    expect(googleBooks.searchGoogleBooks).toHaveBeenCalledWith(
      "Dune Frank Herbert",
      5
    );
  });

  it("falls back to Open Library when Google Books returns nothing", async () => {
    vi.mocked(googleBooks.searchGoogleBooks).mockResolvedValue([]);
    vi.mocked(openLibrary.searchOpenLibrary).mockResolvedValue([mockOLBook]);

    const result = await findBook("Dune", "Dune");

    expect(result).toEqual(mockOLBook);
    expect(openLibrary.searchOpenLibrary).toHaveBeenCalled();
  });

  it("returns null when no results from any API", async () => {
    vi.mocked(googleBooks.searchGoogleBooks).mockResolvedValue([]);
    vi.mocked(openLibrary.searchOpenLibrary).mockResolvedValue([]);

    const result = await findBook("nonexistent book xyz123");

    expect(result).toBeNull();
  });

  it("finds best match by title similarity", async () => {
    const otherBook: BookResult = {
      ...mockGoogleBook,
      title: "Dune Messiah",
      googleBooksId: "google-456",
    };

    vi.mocked(googleBooks.searchGoogleBooks).mockResolvedValue([
      otherBook,
      mockGoogleBook,
    ]);
    vi.mocked(openLibrary.searchOpenLibrary).mockResolvedValue([]);

    const result = await findBook("Dune Frank Herbert", "Dune");

    expect(result?.title).toBe("Dune");
  });

  it("returns first result when no expected title provided", async () => {
    const firstBook: BookResult = {
      ...mockGoogleBook,
      title: "First Book",
    };
    vi.mocked(googleBooks.searchGoogleBooks).mockResolvedValue([
      firstBook,
      mockGoogleBook,
    ]);
    vi.mocked(openLibrary.searchOpenLibrary).mockResolvedValue([]);

    const result = await findBook("some query");

    expect(result?.title).toBe("First Book");
  });
});

describe("enrichBookWithCover", () => {
  it("returns book as-is if it already has a cover", async () => {
    const result = await enrichBookWithCover(mockGoogleBook);

    expect(result).toEqual(mockGoogleBook);
    expect(openLibrary.searchOpenLibrary).not.toHaveBeenCalled();
  });

  it("tries Open Library for cover when book has none", async () => {
    const noCoverBook: BookResult = { ...mockGoogleBook, coverUrl: null };
    vi.mocked(openLibrary.searchOpenLibrary).mockResolvedValue([mockOLBook]);

    const result = await enrichBookWithCover(noCoverBook);

    expect(result.coverUrl).toBe(mockOLBook.coverUrl);
  });

  it("returns book without cover if Open Library also has none", async () => {
    const noCoverBook: BookResult = { ...mockGoogleBook, coverUrl: null };
    const noCoverOL: BookResult = { ...mockOLBook, coverUrl: null };
    vi.mocked(openLibrary.searchOpenLibrary).mockResolvedValue([noCoverOL]);

    const result = await enrichBookWithCover(noCoverBook);

    expect(result.coverUrl).toBeNull();
  });
});
