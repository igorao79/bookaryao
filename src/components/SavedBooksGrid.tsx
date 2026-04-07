"use client";

import { useState, useEffect, useCallback } from "react";
import { BookCard } from "./BookCard";
import type { SavedBook } from "@/types";

export function SavedBooksGrid() {
  const [books, setBooks] = useState<SavedBook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch("/api/books/user");
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch {
      console.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  async function handleDelete(id: string) {
    if (!confirm("Удалить эту книгу из коллекции?")) return;

    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-cream border border-gold/20 rounded-lg overflow-hidden">
            <div className="skeleton aspect-[2/3]" />
            <div className="p-3 space-y-2">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="mx-auto text-sepia/30 mb-4"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
        <p
          className="text-sepia/50 text-lg"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Ваша коллекция пуста
        </p>
        <p className="text-sepia/40 text-sm mt-1">
          Начните открывать книги, чтобы собрать свою библиотеку
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
      {books.map((book) => (
        <BookCard
          key={book.id}
          variant="collection"
          book={book}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
