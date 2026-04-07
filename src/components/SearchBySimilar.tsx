"use client";

import { useState } from "react";
import { useBookSearch } from "@/hooks/useBookSearch";
import { BookCard } from "./BookCard";
import { RejectFeedback } from "./RejectFeedback";

interface SearchBySimilarProps {
  onClose: () => void;
}

export function SearchBySimilar({ onClose }: SearchBySimilarProps) {
  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [whatYouLiked, setWhatYouLiked] = useState("");
  const [showReject, setShowReject] = useState(false);

  const {
    recommendation,
    isSearching,
    isSaving,
    error,
    search,
    reject,
    save,
    reset,
  } = useBookSearch();

  const isValid = bookTitle.trim() && whatYouLiked.trim();

  async function handleSearch() {
    await search({
      type: "similar",
      bookTitle,
      author,
      whatYouLiked,
      rejectedBooks: [],
    });
  }

  async function handleSave() {
    const success = await save();
    if (success) {
      reset();
      onClose();
    }
  }

  function handleRejectClick() {
    setShowReject(true);
  }

  async function handleRejectSubmit(reason: string) {
    setShowReject(false);
    await reject(reason);
  }

  // Show result
  if (recommendation) {
    return (
      <div>
        <BookCard
          variant="recommendation"
          book={recommendation}
          onSave={handleSave}
          onReject={handleRejectClick}
          isSaving={isSaving}
        />

        {showReject && (
          <RejectFeedback
            onSubmit={handleRejectSubmit}
            onCancel={() => setShowReject(false)}
          />
        )}

        {error && (
          <p className="text-burgundy text-sm mt-3 text-center">{error}</p>
        )}
      </div>
    );
  }

  // Show loading
  if (isSearching) {
    return (
      <div className="bg-cream border border-gold/30 rounded-lg overflow-hidden max-w-lg mx-auto p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="skeleton w-[180px] h-[270px] mx-auto sm:mx-0 flex-shrink-0 rounded" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-6 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
            <div className="flex gap-2">
              <div className="skeleton h-5 w-16 rounded" />
              <div className="skeleton h-5 w-20 rounded" />
            </div>
            <div className="space-y-2 mt-4">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-5/6 rounded" />
              <div className="skeleton h-3 w-4/6 rounded" />
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-sepia/60 mt-6 italic">
          Ищем то, что вам понравится...
        </p>
      </div>
    );
  }

  // Show form
  return (
    <div className="space-y-5">
      {/* Book title */}
      <div>
        <label
          className="block text-sm text-leather-dark mb-2 tracking-wide"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Название книги <span className="text-burgundy">*</span>
        </label>
        <input
          type="text"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          placeholder="напр. Мастер и Маргарита"
          className="w-full p-3 text-sm bg-cream border border-gold/30 rounded focus:outline-none focus:border-sepia/50 text-ink"
        />
      </div>

      {/* Author */}
      <div>
        <label
          className="block text-sm text-leather-dark mb-2 tracking-wide"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Автор <span className="text-sepia/40 text-xs">(необязательно)</span>
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="напр. Михаил Булгаков"
          className="w-full p-3 text-sm bg-cream border border-gold/30 rounded focus:outline-none focus:border-sepia/50 text-ink"
        />
      </div>

      {/* What you liked */}
      <div>
        <label
          className="block text-sm text-leather-dark mb-2 tracking-wide"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Что вам понравилось? <span className="text-burgundy">*</span>
        </label>
        <textarea
          value={whatYouLiked}
          onChange={(e) => setWhatYouLiked(e.target.value)}
          placeholder="Что вас зацепило? Стиль письма, персонажи, темы, атмосфера?..."
          className="w-full p-3 text-sm bg-cream border border-gold/30 rounded resize-none focus:outline-none focus:border-sepia/50 text-ink leading-relaxed"
          rows={3}
        />
      </div>

      {error && <p className="text-burgundy text-sm">{error}</p>}

      <button
        onClick={handleSearch}
        disabled={!isValid}
        className="w-full py-3 bg-leather text-parchment-light rounded text-sm tracking-wide hover:bg-leather-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        Найти похожую книгу
      </button>
    </div>
  );
}
