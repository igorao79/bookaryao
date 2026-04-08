"use client";

import { useState } from "react";
import { useBookSearch } from "@/hooks/useBookSearch";
import { BookCard } from "./BookCard";
import { RejectFeedback } from "./RejectFeedback";
import { Toast } from "./Toast";
import type { ToastType } from "./Toast";
import type { SearchPrefill } from "./BookSearchModal";


interface SearchBySimilarProps {
  onClose: () => void;
  prefill?: SearchPrefill;
  onBookSaved?: () => void;
}

export function SearchBySimilar({ onClose, prefill, onBookSaved }: SearchBySimilarProps) {
  const [bookTitle, setBookTitle] = useState(prefill?.bookTitle ?? "");
  const [author, setAuthor] = useState(prefill?.author ?? "");
  const [whatYouLiked, setWhatYouLiked] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Genres passed from prefill (sent straight to the search query, no picker shown)
  const prefillGenres = prefill?.genres ?? [];

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

  const isPrefill = Boolean(prefill);
  const isValid = isPrefill
    ? bookTitle.trim() && whatYouLiked.trim()
    : bookTitle.trim() && whatYouLiked.trim();

  async function handleSearch() {
    await search({
      type: "similar",
      bookTitle,
      author,
      whatYouLiked: isPrefill && prefillGenres.length > 0
        ? `Жанры: ${prefillGenres.join(", ")}. ${whatYouLiked}`
        : whatYouLiked,
      rejectedBooks: [],
    });
  }

  async function handleSave() {
    const success = await save();
    if (success) {
      setToast({ message: "Книга сохранена в коллекцию!", type: "success" });
      onBookSaved?.();
      setTimeout(() => onClose(), 900);
    } else {
      setToast({ message: "Не удалось сохранить. Попробуйте ещё раз.", type: "error" });
    }
  }

  async function handleRejectSubmit(reason: string) {
    setShowReject(false);
    setIsExiting(true);
    await new Promise((r) => setTimeout(r, 320));
    setIsExiting(false);
    await reject(reason);
  }

  // Show result
  if (recommendation) {
    return (
      <div className={isExiting ? "animate-fade-out-down pointer-events-none" : "animate-fade-in-up"}>
        {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
        <BookCard
          variant="recommendation"
          book={recommendation}
          onSave={handleSave}
          onReject={() => setShowReject(true)}
          isSaving={isSaving}
          userQuery={`${bookTitle} ${whatYouLiked}`}
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
      {/* Book reference block (prefill) or editable fields */}
      {isPrefill ? (
        <div className="flex items-start gap-3 p-3 bg-cream/60 border border-gold/20 rounded-lg">
          <div className="flex-shrink-0 mt-0.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sepia/50">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-leather-dark leading-tight truncate" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {bookTitle}
            </p>
            {author && <p className="text-xs text-sepia/60 mt-0.5 truncate">{author}</p>}
            {prefillGenres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {prefillGenres.slice(0, 4).map((g) => (
                  <span key={g} className="genre-tag text-[10px] py-0.5 px-1.5">{g}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Book title */}
          <div>
            <label className="block text-sm text-leather-dark mb-2 tracking-wide" style={{ fontFamily: "var(--font-playfair), serif" }}>
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
            <label className="block text-sm text-leather-dark mb-2 tracking-wide" style={{ fontFamily: "var(--font-playfair), serif" }}>
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
        </>
      )}

      {/* What you liked / want */}
      <div>
        <label
          className="block text-sm text-leather-dark mb-2 tracking-wide"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {isPrefill ? "Что вам в ней понравилось?" : "Что вам понравилось?"}{" "}
          <span className="text-burgundy">*</span>
        </label>
        <textarea
          value={whatYouLiked}
          onChange={(e) => setWhatYouLiked(e.target.value)}
          placeholder="Стиль, атмосфера, персонажи, темы — что зацепило больше всего?..."
          className="w-full p-3 text-sm bg-cream border border-gold/30 rounded resize-none focus:outline-none focus:border-sepia/50 text-ink leading-relaxed"
          rows={4}
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
