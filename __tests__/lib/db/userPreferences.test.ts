import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));

import { mergeRejection } from "@/lib/db/userPreferences";

describe("mergeRejection", () => {
  it("appends a new rejection to an empty history", () => {
    const result = mergeRejection([], { title: "Dune", author: "Herbert", reason: "Too long", rejectedAt: "2026-04-09T00:00:00.000Z" }, 50);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Dune");
  });

  it("appends to existing history", () => {
    const existing = [
      { title: "1984", author: "Orwell", reason: "Depressing", rejectedAt: "2026-04-08T00:00:00.000Z" },
    ];
    const result = mergeRejection(existing, { title: "Dune", author: "Herbert", reason: "Too long", rejectedAt: "2026-04-09T00:00:00.000Z" }, 50);
    expect(result).toHaveLength(2);
    expect(result[1].title).toBe("Dune");
  });

  it("trims history to maxHistory entries, keeping newest", () => {
    const existing = Array.from({ length: 50 }, (_, i) => ({
      title: `Book ${i}`,
      author: "Author",
      reason: "reason",
      rejectedAt: "2026-04-01T00:00:00.000Z",
    }));
    const result = mergeRejection(existing, { title: "New Book", author: "Author", reason: "reason", rejectedAt: "2026-04-09T00:00:00.000Z" }, 50);
    expect(result).toHaveLength(50);
    expect(result[49].title).toBe("New Book");
    expect(result[0].title).toBe("Book 1"); // Book 0 was dropped
  });

  it("keeps the last maxHistory entries after trim", () => {
    const existing = [
      { title: "Old", author: "A", reason: "r", rejectedAt: "2026-01-01T00:00:00.000Z" },
      { title: "Middle", author: "A", reason: "r", rejectedAt: "2026-02-01T00:00:00.000Z" },
    ];
    const result = mergeRejection(existing, { title: "New", author: "A", reason: "r", rejectedAt: "2026-04-09T00:00:00.000Z" }, 2);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Middle");
    expect(result[1].title).toBe("New");
  });
});
