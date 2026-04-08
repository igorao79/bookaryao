"use client";

import { useState } from "react";
import { useBookSearch } from "@/hooks/useBookSearch";
import { BookCard } from "./BookCard";
import { RejectFeedback } from "./RejectFeedback";
import { Toast } from "./Toast";
import type { ToastType } from "./Toast";
import type { SearchPrefill } from "./BookSearchModal";

const GENRES = [
  "Художественная литература",
  "Фэнтези",
  "Научная фантастика",
  "Детектив",
  "Триллер",
  "Романтика",
  "Ужасы",
  "Историческая проза",
  "Современная проза",
  "Приключения",
  "Философия",
  "Психология",
  "Саморазвитие",
  "Биография",
  "Наука",
  "Поэзия",
];

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
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Genre state (only used in prefill mode)
  const prefillGenres = prefill?.genres ?? [];
  const extraPrefillGenres = prefillGenres.filter((g) => !GENRES.includes(g));
  const [selectedGenres, setSelectedGenres] = useState<string[]>(prefillGenres);
  const [customGenres, setCustomGenres] = useState<string[]>(extraPrefillGenres);

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

  function toggleGenre(g: string) {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  function addCustomGenre(val: string) {
    if (!val) return;
    if (!customGenres.includes(val) && !GENRES.includes(val)) {
      setCustomGenres((prev) => [...prev, val]);
    }
    if (!selectedGenres.includes(val)) {
      setSelectedGenres((prev) => [...prev, val]);
    }
  }

  function removeCustomGenre(g: string) {
    setCustomGenres((prev) => prev.filter((x) => x !== g));
    setSelectedGenres((prev) => prev.filter((x) => x !== g));
  }

  async function handleSearch() {
    await search({
      type: "similar",
      bookTitle,
      author,
      whatYouLiked: isPrefill && selectedGenres.length > 0
        ? `Жанры: ${selectedGenres.join(", ")}. ${whatYouLiked}`
        : whatYouLiked,
      rejectedBooks: [],
    });
  }

  async function handleSave() {
    const success = await save();
    if (success) {
      setToast({ message: "Книга сохранена в коллекцию!", type: "success" });
      onBookSaved?.();
      setTimeout(() => { reset(); onClose(); }, 1200);
    } else {
      setToast({ message: "Не удалось сохранить. Попробуйте ещё раз.", type: "error" });
    }
  }

  async function handleRejectSubmit(reason: string) {
    setShowReject(false);
    await reject(reason);
  }

  // Show result
  if (recommendation) {
    return (
      <div>
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

  const allGenres = [...GENRES, ...customGenres.filter((g) => !GENRES.includes(g))];

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
        {isPrefill ? (
          <div className="w-full p-3 text-sm bg-parchment-dark/40 border border-gold/20 rounded text-ink/70 cursor-default select-none">
            {bookTitle}
          </div>
        ) : (
          <input
            type="text"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="напр. Мастер и Маргарита"
            className="w-full p-3 text-sm bg-cream border border-gold/30 rounded focus:outline-none focus:border-sepia/50 text-ink"
          />
        )}
      </div>

      {/* Author */}
      <div>
        <label
          className="block text-sm text-leather-dark mb-2 tracking-wide"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Автор{" "}
          {!isPrefill && <span className="text-sepia/40 text-xs">(необязательно)</span>}
        </label>
        {isPrefill ? (
          <div className="w-full p-3 text-sm bg-parchment-dark/40 border border-gold/20 rounded text-ink/70 cursor-default select-none">
            {author || <span className="text-sepia/40 italic">не указан</span>}
          </div>
        ) : (
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="напр. Михаил Булгаков"
            className="w-full p-3 text-sm bg-cream border border-gold/30 rounded focus:outline-none focus:border-sepia/50 text-ink"
          />
        )}
      </div>

      {/* Genre picker — only in prefill mode */}
      {isPrefill && (
        <div>
          <label
            className="block text-sm text-leather-dark mb-2 tracking-wide"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Жанры
            {selectedGenres.length > 0 && (
              <span className="ml-2 text-xs text-sepia/50">выбрано: {selectedGenres.length}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {allGenres.map((g) => {
              const selected = selectedGenres.includes(g);
              const isCustom = customGenres.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1.5 text-xs rounded border transition-all ${
                    selected
                      ? "bg-sepia text-parchment border-sepia"
                      : "border-gold/40 text-sepia/70 hover:border-sepia/50"
                  }`}
                >
                  {selected && <span className="mr-1 opacity-70">✓</span>}
                  {g}
                  {isCustom && !selected && (
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); removeCustomGenre(g); }}
                      className="ml-1.5 opacity-40 hover:opacity-80 transition-opacity"
                    >
                      ×
                    </span>
                  )}
                </button>
              );
            })}
            <AddCustomGenreButton onAdd={addCustomGenre} />
          </div>
        </div>
      )}

      {/* What you liked */}
      <div>
        <label
          className="block text-sm text-leather-dark mb-2 tracking-wide"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {isPrefill ? "Что вы хотите найти?" : "Что вам понравилось?"}{" "}
          <span className="text-burgundy">*</span>
        </label>
        <textarea
          value={whatYouLiked}
          onChange={(e) => setWhatYouLiked(e.target.value)}
          placeholder={
            isPrefill
              ? "Опишите, какую книгу вы хотите найти. Какие темы, атмосфера или стиль вас привлекают?..."
              : "Что вас зацепило? Стиль письма, персонажи, темы, атмосфера?..."
          }
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

function AddCustomGenreButton({ onAdd }: { onAdd: (val: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");

  function commit() {
    onAdd(value.trim());
    setValue("");
    setAdding(false);
  }

  if (adding) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setAdding(false); setValue(""); }
        }}
        onBlur={commit}
        placeholder="Свой жанр..."
        className="px-3 py-1.5 text-xs border border-sepia/50 rounded bg-cream text-ink focus:outline-none focus:border-sepia w-32"
        maxLength={30}
      />
    );
  }

  return (
    <button
      onClick={() => setAdding(true)}
      className="px-3 py-1.5 text-xs rounded border border-dashed border-gold/50 text-gold/70 hover:border-gold hover:text-gold transition-all flex items-center gap-1"
      title="Добавить свой жанр"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <path d="M4 0h2v4h4v2H6v4H4V6H0V4h4V0z" />
      </svg>
      Свой жанр
    </button>
  );
}
