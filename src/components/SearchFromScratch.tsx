"use client";

import { useState, useRef, useEffect } from "react";
import { useBookSearch } from "@/hooks/useBookSearch";
import { BookCard } from "./BookCard";
import { RejectFeedback } from "./RejectFeedback";
import { Toast } from "./Toast";
import type { ToastType } from "./Toast";

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

interface SearchFromScratchProps {
  onClose: () => void;
  onBookSaved?: () => void;
}

export function SearchFromScratch({ onClose, onBookSaved }: SearchFromScratchProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customGenres, setCustomGenres] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [customInput, setCustomInput] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (addingCustom) customInputRef.current?.focus();
  }, [addingCustom]);

  const allGenres = [...GENRES, ...customGenres];
  const charCount = description.length;
  const isValid = selectedGenres.length > 0 && charCount >= 50;

  function toggleGenre(g: string) {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  function handleAddCustom() {
    const val = customInput.trim();
    if (!val) return setAddingCustom(false);
    if (!customGenres.includes(val) && !GENRES.includes(val)) {
      setCustomGenres((prev) => [...prev, val]);
      setSelectedGenres((prev) => [...prev, val]);
    }
    setCustomInput("");
    setAddingCustom(false);
  }

  function handleCustomKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAddCustom();
    if (e.key === "Escape") { setAddingCustom(false); setCustomInput(""); }
  }

  function removeCustomGenre(g: string) {
    setCustomGenres((prev) => prev.filter((x) => x !== g));
    setSelectedGenres((prev) => prev.filter((x) => x !== g));
  }

  async function handleSearch() {
    await search({
      type: "scratch",
      genre: selectedGenres.join(", "),
      description,
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
    await reject(reason);
  }

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
          userQuery={`${selectedGenres.join(" ")} ${description}`}
        />
        {showReject && (
          <RejectFeedback
            onSubmit={handleRejectSubmit}
            onCancel={() => setShowReject(false)}
          />
        )}
        {error && <p className="text-burgundy text-sm mt-3 text-center">{error}</p>}
      </div>
    );
  }

  if (isSearching) return <LoadingSkeleton />;

  return (
    <div className="space-y-5">
      {/* Genre */}
      <div>
        <label
          className="block text-sm text-leather-dark mb-2 tracking-wide"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Жанры
          {selectedGenres.length > 0 && (
            <span className="ml-2 text-xs text-sepia/50">
              выбрано: {selectedGenres.length}
            </span>
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
                className={`group relative px-3 py-1.5 text-xs rounded border transition-all ${
                  selected
                    ? "bg-sepia text-parchment border-sepia"
                    : "border-gold/40 text-sepia/70 hover:border-sepia/50"
                }`}
              >
                {selected && (
                  <span className="mr-1 opacity-70">✓</span>
                )}
                {g}
                {/* Remove button for custom genres */}
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

          {/* Add custom genre */}
          {addingCustom ? (
            <div className="flex items-center gap-1">
              <input
                ref={customInputRef}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={handleCustomKeyDown}
                onBlur={handleAddCustom}
                placeholder="Свой жанр..."
                className="px-3 py-1.5 text-xs border border-sepia/50 rounded bg-cream text-ink focus:outline-none focus:border-sepia w-32"
                maxLength={30}
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingCustom(true)}
              className="px-3 py-1.5 text-xs rounded border border-dashed border-gold/50 text-gold/70 hover:border-gold hover:text-gold transition-all flex items-center gap-1"
              title="Добавить свой жанр"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M4 0h2v4h4v2H6v4H4V6H0V4h4V0z" />
              </svg>
              Свой жанр
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          className="block text-sm text-leather-dark mb-2 tracking-wide"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Что вы хотите найти?
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опишите, какую книгу вы хотите прочитать. Какие темы, атмосфера или стиль вас привлекают?..."
          className="w-full p-3 text-sm bg-cream border border-gold/30 rounded resize-none focus:outline-none focus:border-sepia/50 text-ink leading-relaxed"
          rows={4}
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          <span className={`text-xs ${charCount < 50 ? "text-burgundy" : "text-sepia/50"}`}>
            {charCount < 50 ? `Ещё ${50 - charCount} символов` : "Отлично!"}
          </span>
          <span className="text-xs text-sepia/40">{charCount}/500</span>
        </div>
      </div>

      {error && <p className="text-burgundy text-sm">{error}</p>}

      <button
        onClick={handleSearch}
        disabled={!isValid}
        className="w-full py-3 bg-leather text-parchment-light rounded text-sm tracking-wide hover:bg-leather-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        Найти книгу
      </button>
    </div>
  );
}

function LoadingSkeleton() {
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
        Ищем книгу для вас...
      </p>
    </div>
  );
}
