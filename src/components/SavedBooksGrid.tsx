"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { BookCard } from "./BookCard";
import { BookSearchModal } from "./BookSearchModal";
import { ReviewModal } from "./ReviewModal";
import type { SavedBook } from "@/types";
import type { SearchPrefill } from "./BookSearchModal";

export function SavedBooksGrid({ refreshKey }: { refreshKey?: number }) {
  const { data: session, status } = useSession();
  const [books, setBooks] = useState<SavedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalPrefill, setModalPrefill] = useState<SearchPrefill | null>(null);
  const [reviewBook, setReviewBook] = useState<SavedBook | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SavedBook | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }
    fetchBooks();
  }, [fetchBooks, refreshKey, status]);

  function handleDelete(id: string) {
    const book = books.find((b) => b.id === id);
    if (book) setConfirmDelete(book);
  }

  async function executeDelete() {
    if (!confirmDelete) return;
    const id = confirmDelete.id;
    setConfirmDelete(null);

    // Play exit animation, then remove
    setDeletingId(id);
    await new Promise((r) => setTimeout(r, 360));

    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (res.ok) setBooks((prev) => prev.filter((b) => b.id !== id));
    setDeletingId(null);
  }

  function handleFindSimilar(book: SavedBook) {
    setModalPrefill({
      bookTitle: book.title,
      author: book.author,
      genres: book.genres,
    });
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
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
        {books.map((book) => (
          <BookCard
            key={book.id}
            variant="collection"
            book={book}
            onDelete={handleDelete}
            onFindSimilar={handleFindSimilar}
            onReviewClick={setReviewBook}
            isDeleting={deletingId === book.id}
          />
        ))}
      </div>

      <BookSearchModal
        isOpen={Boolean(modalPrefill)}
        onClose={() => setModalPrefill(null)}
        prefill={modalPrefill ?? undefined}
        initialMode="similar"
        onBookSaved={fetchBooks}
      />

      {reviewBook && (
        <ReviewModal
          isOpen={Boolean(reviewBook)}
          onClose={() => setReviewBook(null)}
          bookKey={reviewBook.googleBooksId ?? reviewBook.openLibraryKey ?? reviewBook.id}
          bookTitle={reviewBook.title}
          currentUserId={session?.user?.id}
        />
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}
        >
          <div className="bg-parchment-light border border-gold/30 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-fade-in-up">
            <h3
              className="text-lg text-leather-dark mb-2"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Удалить книгу?
            </h3>
            <p className="text-sm text-sepia/70 mb-5 leading-relaxed">
              «{confirmDelete.title}» будет удалена из вашей коллекции.
            </p>
            <div className="flex gap-3">
              <button
                onClick={executeDelete}
                className="flex-1 py-2 bg-burgundy text-parchment-light rounded text-sm tracking-wide hover:bg-burgundy-light transition-colors"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Удалить
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 border border-gold/40 text-sepia rounded text-sm tracking-wide hover:bg-parchment-dark transition-colors"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
