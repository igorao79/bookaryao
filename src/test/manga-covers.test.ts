/**
 * Integration tests — hit real APIs, no mocks.
 * Verify that at least one source returns a cover URL for known manga titles.
 *
 * Run: npx vitest run src/test/manga-covers.test.ts
 */

import { describe, it, expect } from "vitest";
import { searchAniList } from "@/lib/books/anilist";
import { searchJikan } from "@/lib/books/jikan";
import { searchKitsu } from "@/lib/books/kitsu";
import { searchMangaDex } from "@/lib/books/mangadex";
import { findBook, enrichBookWithCover } from "@/lib/books/search";

// These titles are universally indexed across all manga databases
const WELL_KNOWN = "Death Note";
const DETECTIVE = "Moriarty the Patriot"; // detective + superpowers — exactly the user's query

const TIMEOUT = 20_000;

// ── Individual API sources ───────────────────────────────────────────

describe("AniList", () => {
  it("returns a cover URL for a well-known manga", async () => {
    const result = await searchAniList(WELL_KNOWN);
    console.log("AniList result:", result?.title, result?.coverUrl);
    expect(result).not.toBeNull();
    expect(result?.coverUrl).toBeTruthy();
    expect(result?.coverUrl).toMatch(/^https:\/\//);
  }, TIMEOUT);

  it("returns a result for a detective manga", async () => {
    const result = await searchAniList(DETECTIVE);
    console.log("AniList detective:", result?.title, result?.coverUrl);
    expect(result).not.toBeNull();
  }, TIMEOUT);
});

describe("Jikan (MyAnimeList)", () => {
  it("returns a cover URL for a well-known manga", async () => {
    const result = await searchJikan(WELL_KNOWN);
    console.log("Jikan result:", result?.title, result?.coverUrl);
    expect(result).not.toBeNull();
    expect(result?.coverUrl).toBeTruthy();
    expect(result?.coverUrl).toMatch(/^https:\/\//);
  }, TIMEOUT);
});

describe("Kitsu", () => {
  it("returns a cover URL for a well-known manga", async () => {
    const result = await searchKitsu(WELL_KNOWN);
    console.log("Kitsu result:", result?.title, result?.coverUrl);
    expect(result).not.toBeNull();
    expect(result?.coverUrl).toBeTruthy();
    expect(result?.coverUrl).toMatch(/^https:\/\//);
  }, TIMEOUT);
});

describe("MangaDex (cover-only)", () => {
  it("returns a cover URL for a well-known manga", async () => {
    const coverUrl = await searchMangaDex(WELL_KNOWN);
    console.log("MangaDex cover:", coverUrl);
    expect(coverUrl).toBeTruthy();
    expect(coverUrl).toMatch(/^https:\/\/uploads\.mangadex\.org/);
  }, TIMEOUT);
});

// ── Full findBook flow ───────────────────────────────────────────────

describe("findBook — manga fallback", () => {
  it("finds a well-known manga even if not on Google Books", async () => {
    const book = await findBook("Death Note manga Tsugumi Ohba", "Death Note");
    console.log("findBook result:", book?.title, book?.coverUrl);
    expect(book).not.toBeNull();
    expect(book?.title).toBeTruthy();
  }, TIMEOUT);

  it("finds a detective manga with superpowers (user's real query)", async () => {
    const book = await findBook("Moriarty the Patriot manga", "Moriarty the Patriot");
    console.log("findBook detective:", book?.title, book?.coverUrl);
    expect(book).not.toBeNull();
  }, TIMEOUT);

  it("enriches Moriarty the Patriot cover after findBook", async () => {
    const book = await findBook("Moriarty the Patriot manga", "Moriarty the Patriot");
    expect(book).not.toBeNull();
    const enriched = await enrichBookWithCover(book!);
    console.log("Moriarty enriched cover:", enriched.coverUrl);
    expect(enriched.coverUrl).toBeTruthy();
    expect(enriched.coverUrl).toMatch(/^https:\/\//);
  }, TIMEOUT);
});

// ── enrichBookWithCover ──────────────────────────────────────────────

describe("enrichBookWithCover", () => {
  it("adds a cover to a manga that has none from Google Books", async () => {
    const bare = {
      title: "Toradora",
      author: "Yuyuko Takemiya",
      description: "",
      genres: ["Романтика", "Манга"],
      coverUrl: null,
      googleBooksId: null,
      openLibraryKey: null,
    };
    const enriched = await enrichBookWithCover(bare);
    console.log("enriched cover:", enriched.coverUrl);
    expect(enriched.coverUrl).toBeTruthy();
    expect(enriched.coverUrl).toMatch(/^https:\/\//);
  }, TIMEOUT);
});
