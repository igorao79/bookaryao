"use client";

import Image from "next/image";
import type { BookRecommendation, SavedBook } from "@/types";

// ── Recommendation variant (in search modal) ───────────────────────

interface RecommendationProps {
  variant: "recommendation";
  book: BookRecommendation;
  onSave: () => void;
  onReject: () => void;
  isSaving?: boolean;
}

// ── Collection variant (in profile grid) ────────────────────────────

interface CollectionProps {
  variant: "collection";
  book: SavedBook;
  onDelete: (id: string) => void;
}

type BookCardProps = RecommendationProps | CollectionProps;

export function BookCard(props: BookCardProps) {
  if (props.variant === "recommendation") {
    return <RecommendationCard {...props} />;
  }
  return <CollectionCard {...props} />;
}

function RecommendationCard({
  book,
  onSave,
  onReject,
  isSaving,
}: RecommendationProps) {
  return (
    <div className="animate-fade-in-up bg-cream border border-gold/30 rounded-lg overflow-hidden book-shadow max-w-lg mx-auto">
      <div className="flex flex-col sm:flex-row">
        {/* Cover */}
        <div className="sm:w-48 flex-shrink-0 p-4 flex justify-center">
          <div className="book-cover-edge">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                width={180}
                height={270}
                className="rounded shadow-md object-cover"
                style={{ maxHeight: 270 }}
              />
            ) : (
              <div
                className="w-[180px] h-[270px] rounded flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, var(--leather), var(--burgundy))",
                }}
              >
                <span
                  className="text-gold text-center px-4 text-lg leading-tight"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {book.title}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 p-4 sm:pl-0 flex flex-col">
          <h3
            className="text-xl text-leather-dark leading-tight"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {book.title}
          </h3>
          <p className="text-sepia/70 text-sm mt-1">{book.author}</p>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {book.genres.map((genre) => (
              <span
                key={genre}
                className={`genre-tag ${
                  book.matchingGenres.includes(genre) ? "genre-tag-match" : ""
                }`}
              >
                {genre}
              </span>
            ))}
          </div>

          {/* AI Summary */}
          <div className="mt-4 border-l-2 border-gold/40 pl-3">
            <p className="text-sm text-sepia/80 italic leading-relaxed">
              {book.aiSummary}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5 pt-4 border-t border-gold/20">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-leather text-parchment-light rounded text-sm tracking-wide hover:bg-leather-dark transition-colors disabled:opacity-50"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" opacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Сохраняю...
                </span>
              ) : (
                "Сохранить в коллекцию"
              )}
            </button>
            <button
              onClick={onReject}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 border border-burgundy/40 text-burgundy rounded text-sm tracking-wide hover:bg-burgundy hover:text-parchment transition-colors disabled:opacity-50"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Не подходит
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollectionCard({ book, onDelete }: CollectionProps) {
  return (
    <div className="group bg-cream border border-gold/20 rounded-lg overflow-hidden book-shadow hover:book-shadow-hover transition-all duration-300">
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--leather), var(--burgundy))",
            }}
          >
            <span
              className="text-gold text-center px-4 text-base leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {book.title}
            </span>
          </div>
        )}

        {/* Hover overlay with AI summary */}
        <div className="absolute inset-0 bg-ink/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          {book.aiSummary && (
            <p className="text-parchment/90 text-xs italic leading-relaxed line-clamp-4">
              {book.aiSummary}
            </p>
          )}
          <button
            onClick={() => onDelete(book.id)}
            className="mt-3 text-xs text-burgundy-light hover:text-red-400 transition-colors self-end"
          >
            Удалить
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h4
          className="text-sm text-leather-dark font-semibold leading-tight line-clamp-2"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {book.title}
        </h4>
        <p className="text-xs text-sepia/60 mt-1 truncate">{book.author}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {book.genres.slice(0, 2).map((genre) => (
            <span key={genre} className="genre-tag text-[10px]">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
