"use client";

import { useState } from "react";
import { useBookSearch } from "@/hooks/useBookSearch";
import { BookCard } from "./BookCard";
import { RejectFeedback } from "./RejectFeedback";

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
}

export function SearchFromScratch({ onClose }: SearchFromScratchProps) {
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
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

  const charCount = description.length;
  const isValid = genre && charCount >= 50;

  async function handleSearch() {
    await search({
      type: "scratch",
      genre,
      description,
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
    return <LoadingSkeleton />;
  }

  // Show form
  return (
    <div className="space-y-5">
      {/* Genre */}
      <div>
        <label
          className="block text-sm text-leather-dark mb-2 tracking-wide"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Жанр
        </label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-3 py-1.5 text-xs rounded border transition-all ${
                genre === g
                  ? "bg-sepia text-parchment border-sepia"
                  : "border-gold/40 text-sepia/70 hover:border-sepia/50"
              }`}
            >
              {g}
            </button>
          ))}
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
          <span
            className={`text-xs ${
              charCount < 50 ? "text-burgundy" : "text-sepia/50"
            }`}
          >
            {charCount < 50
              ? `Ещё ${50 - charCount} символов`
              : "Отлично!"}
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
