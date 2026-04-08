"use client";

import Image from "next/image";
import type { BookRecommendation, SavedBook } from "@/types";

// ── Highlight helper ────────────────────────────────────────────────

function extractKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,;.!?]+/)
    .filter((w) => w.length > 3)
    .filter((w) => !["этот","этой","этим","это","меня","тебя","себя","мной","буду","есть","была","были","было","когда","если","чтобы","того","тому","than","that","with","from","have","this","they","will","been","were","your","their","what","about","which","just","some","more","than","than","into","also"].includes(w));
}

function HighlightedText({ text, keywords }: { text: string; keywords: string[] }) {
  if (!keywords.length) return <>{text}</>;

  const pattern = new RegExp(`(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) =>
        keywords.some((k) => k.toLowerCase() === part.toLowerCase()) ? (
          <mark
            key={i}
            style={{
              background: "none",
              borderBottom: "2px solid #c5a55a",
              color: "inherit",
              fontStyle: "inherit",
              paddingBottom: 1,
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ── Recommendation variant ──────────────────────────────────────────

interface RecommendationProps {
  variant: "recommendation";
  book: BookRecommendation;
  onSave: () => void;
  onReject: () => void;
  isSaving?: boolean;
  userQuery?: string;
}

// ── Collection variant ──────────────────────────────────────────────

interface CollectionProps {
  variant: "collection";
  book: SavedBook;
  onDelete: (id: string) => void;
  onFindSimilar?: (book: SavedBook) => void;
  onReviewClick?: (book: SavedBook) => void;
}

function CollectionStars({ value, count }: { value: number; count: number }) {
  const filled = Math.round(value);
  return (
    <div className="flex items-center gap-1 mt-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill={i <= filled ? "#c5a55a" : "none"}
            stroke={i <= filled ? "#c5a55a" : "#c8bfa0"}
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] text-sepia/50">
        {count === 0 ? "нет отзывов" : `${value.toFixed(1)} (${count})`}
      </span>
    </div>
  );
}

type BookCardProps = RecommendationProps | CollectionProps;

export function BookCard(props: BookCardProps) {
  if (props.variant === "recommendation") return <RecommendationCard {...props} />;
  return <CollectionCard {...props} />;
}

function RecommendationCard({ book, onSave, onReject, isSaving, userQuery = "" }: RecommendationProps) {
  const keywords = extractKeywords(userQuery);

  return (
    <div className="animate-fade-in-up bg-cream border border-gold/30 rounded-lg overflow-hidden book-shadow">
      <div className="flex gap-0">
        {/* Cover — fixed width, no extra padding */}
        <div className="flex-shrink-0 w-32 sm:w-40">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              width={160}
              height={240}
              className="w-full h-full object-cover"
              style={{ maxHeight: 240 }}
            />
          ) : (
            <div
              className="w-full h-full min-h-[180px] flex items-center justify-center p-3"
              style={{ background: "linear-gradient(135deg, var(--leather), var(--burgundy))" }}
            >
              <span
                className="text-gold text-center text-sm leading-tight"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {book.title}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-3 flex flex-col min-w-0">
          {/* Title + author */}
          <h3
            className="text-base font-semibold text-leather-dark leading-tight"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {book.title}
          </h3>
          <p className="text-sepia/60 text-xs mt-0.5">{book.author}</p>

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mt-2">
            {book.genres.map((genre) => (
              <span
                key={genre}
                className={`genre-tag text-[10px] py-0.5 px-2 ${
                  book.matchingGenres.includes(genre) ? "genre-tag-match" : ""
                }`}
              >
                {book.matchingGenres.includes(genre) && (
                  <span className="mr-1">★</span>
                )}
                {genre}
              </span>
            ))}
          </div>

          {/* AI Summary with keyword highlights */}
          <div className="mt-2.5 border-l-2 border-gold/50 pl-2.5 flex-1">
            <p className="text-xs text-sepia/80 italic leading-relaxed">
              <HighlightedText text={book.aiSummary} keywords={keywords} />
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3 pt-2.5 border-t border-gold/20">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 py-2 bg-leather text-parchment-light rounded text-xs tracking-wide hover:bg-leather-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" opacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Сохраняю...
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/>
                  </svg>
                  Сохранить
                </>
              )}
            </button>
            <button
              onClick={onReject}
              disabled={isSaving}
              className="flex-1 py-2 border border-burgundy/40 text-burgundy rounded text-xs tracking-wide hover:bg-burgundy hover:text-parchment transition-colors disabled:opacity-50"
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

function CollectionCard({ book, onDelete, onFindSimilar, onReviewClick }: CollectionProps) {
  return (
    <div className="group bg-cream border border-gold/20 rounded-lg overflow-hidden book-shadow hover:book-shadow-hover transition-all duration-300">
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
            style={{ background: "linear-gradient(135deg, var(--leather), var(--burgundy))" }}
          >
            <span
              className="text-gold text-center px-4 text-base leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {book.title}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-ink/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          {book.aiSummary && (
            <p className="text-parchment/90 text-xs italic leading-relaxed line-clamp-3 mb-3">
              {book.aiSummary}
            </p>
          )}
          {onReviewClick && (
            <button
              onClick={() => onReviewClick(book)}
              className="w-full py-1.5 text-[11px] tracking-wide bg-parchment-light/10 border border-gold/40 text-gold/90 rounded hover:bg-gold/20 transition-colors"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Посмотреть отзывы
            </button>
          )}
        </div>
      </div>

      <div className="p-3">
        <h4
          className="text-sm text-leather-dark font-semibold leading-tight line-clamp-2"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {book.title}
        </h4>
        <p className="text-xs text-sepia/60 mt-0.5 truncate">{book.author}</p>
        <CollectionStars value={book.avgRating ?? 0} count={book.reviewCount ?? 0} />
        <div className="flex flex-wrap gap-1 mt-2">
          {book.genres.slice(0, 2).map((genre) => (
            <span key={genre} className="genre-tag text-[10px]">
              {genre}
            </span>
          ))}
        </div>

        <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-gold/20">
          {onFindSimilar && (
            <button
              onClick={() => onFindSimilar(book)}
              className="flex-1 py-1.5 text-[10px] tracking-wide bg-leather/10 border border-leather/30 text-leather-dark rounded hover:bg-leather hover:text-parchment-light transition-colors"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Найти похожее
            </button>
          )}
          <button
            onClick={() => onDelete(book.id)}
            className="py-1.5 px-2.5 text-[10px] tracking-wide border border-burgundy/30 text-burgundy/70 rounded hover:bg-burgundy hover:text-parchment-light transition-colors"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
