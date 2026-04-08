import { describe, it, expect } from "vitest";
import {
  buildSearchFromScratchPrompt,
  buildSearchBySimilarPrompt,
} from "@/lib/ai/prompts";

describe("buildSearchFromScratchPrompt", () => {
  it("includes genre and description in user prompt", () => {
    const { user } = buildSearchFromScratchPrompt(
      "Fantasy",
      "I want a book with magic and dragons"
    );
    expect(user).toContain("Fantasy");
    expect(user).toContain("magic and dragons");
  });

  it("includes system prompt with JSON format instructions", () => {
    const { system } = buildSearchFromScratchPrompt(
      "Mystery",
      "A detective story set in Victorian London"
    );
    expect(system).toContain("JSON");
    expect(system).toContain("title");
    expect(system).toContain("searchQuery");
    expect(system).toContain("whyItMatches");
  });

  it("includes rejected books in system prompt when provided", () => {
    const { system } = buildSearchFromScratchPrompt(
      "Sci-Fi",
      "Space opera with deep characters",
      [
        { title: "Dune", author: "Frank Herbert", reason: "Too long" },
        {
          title: "Foundation",
          author: "Isaac Asimov",
          reason: "Too dry",
        },
      ]
    );
    expect(system).toContain("Dune");
    expect(system).toContain("Frank Herbert");
    expect(system).toContain("Too long");
    expect(system).toContain("Foundation");
    expect(system).toContain("Too dry");
    expect(system).toContain("DO NOT recommend");
  });

  it("does not include rejection section when no rejected books", () => {
    const { system } = buildSearchFromScratchPrompt(
      "Romance",
      "A sweet love story set in a small town"
    );
    expect(system).not.toContain("DO NOT recommend");
  });
});

describe("buildSearchBySimilarPrompt", () => {
  it("includes book title in user prompt", () => {
    const { user } = buildSearchBySimilarPrompt(
      "The Great Gatsby",
      "F. Scott Fitzgerald",
      "The beautiful prose and Jazz Age atmosphere"
    );
    expect(user).toContain("The Great Gatsby");
    expect(user).toContain("F. Scott Fitzgerald");
    expect(user).toContain("beautiful prose");
  });

  it("works without author", () => {
    const { user } = buildSearchBySimilarPrompt(
      "1984",
      undefined,
      "The dystopian world-building"
    );
    expect(user).toContain("1984");
    expect(user).not.toContain("by undefined");
  });

  it("instructs AI not to recommend the same book", () => {
    const { system } = buildSearchBySimilarPrompt(
      "Sapiens",
      "Yuval Noah Harari",
      "The broad perspective on human history"
    );
    expect(system).toContain("DIFFERENT book");
    expect(system).toContain("DO NOT recommend the same book");
  });

  it("includes rejected books with reasons", () => {
    const { system } = buildSearchBySimilarPrompt(
      "Harry Potter",
      "J.K. Rowling",
      "The magical school setting",
      [
        {
          title: "The Name of the Wind",
          author: "Patrick Rothfuss",
          reason: "Too complex",
        },
      ]
    );
    expect(system).toContain("The Name of the Wind");
    expect(system).toContain("Too complex");
  });

  it("instructs to return only real books", () => {
    const { system } = buildSearchBySimilarPrompt(
      "Lord of the Rings",
      "Tolkien",
      "Epic world-building"
    );
    expect(system).toContain("REAL books");
    expect(system).toContain("Never invent");
  });
});

describe("past preferences in prompts", () => {
  it("buildSearchFromScratchPrompt includes past rejection history when provided", () => {
    const { system } = buildSearchFromScratchPrompt(
      "Fantasy",
      "I want an epic adventure",
      [],
      [
        { title: "The Hobbit", author: "Tolkien", reason: "Too childish", rejectedAt: "2026-04-01T00:00:00.000Z" },
      ]
    );
    expect(system).toContain("The Hobbit");
    expect(system).toContain("Too childish");
    expect(system).toContain("previous sessions");
  });

  it("buildSearchFromScratchPrompt omits past preferences section when list is empty", () => {
    const { system } = buildSearchFromScratchPrompt("Fantasy", "Adventure", [], []);
    expect(system).not.toContain("previous sessions");
  });

  it("buildSearchBySimilarPrompt includes past rejection history when provided", () => {
    const { system } = buildSearchBySimilarPrompt(
      "1984",
      "Orwell",
      "Dystopian atmosphere",
      [],
      [
        { title: "Brave New World", author: "Huxley", reason: "Too scientific", rejectedAt: "2026-04-01T00:00:00.000Z" },
      ]
    );
    expect(system).toContain("Brave New World");
    expect(system).toContain("Too scientific");
    expect(system).toContain("previous sessions");
  });

  it("past preferences section is separate from current session DO NOT recommend", () => {
    const { system } = buildSearchFromScratchPrompt(
      "Fantasy",
      "Adventure",
      [{ title: "Dune", author: "Herbert", reason: "Too long" }],
      [{ title: "Foundation", author: "Asimov", reason: "Too dry", rejectedAt: "2026-04-01T00:00:00.000Z" }]
    );
    expect(system).toContain("DO NOT recommend");
    expect(system).toContain("Dune");
    expect(system).toContain("previous sessions");
    expect(system).toContain("Foundation");
  });
});
