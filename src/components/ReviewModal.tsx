"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { Review } from "@/types";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookKey: string;
  bookTitle: string;
  currentUserId?: string;
}

function Stars({
  value,
  interactive = false,
  onChange,
  size = 18,
}: {
  value: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= display ? "#c5a55a" : "none"}
          stroke={i <= display ? "#c5a55a" : "#b0a080"}
          strokeWidth="1.5"
          style={{ cursor: interactive ? "pointer" : "default", flexShrink: 0 }}
          onMouseEnter={() => interactive && setHovered(i)}
          onClick={() => interactive && onChange?.(i)}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ image, name }: { image?: string | null; name?: string | null }) {
  if (image) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5">
        <Image
          src={image}
          alt={name ?? ""}
          width={32}
          height={32}
          className="object-cover w-full h-full"
          unoptimized
        />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-sepia/20 flex items-center justify-center shrink-0 mt-0.5 text-sepia/60 text-xs font-semibold">
      {(name ?? "?")[0]?.toUpperCase()}
    </div>
  );
}

export function ReviewModal({
  isOpen,
  onClose,
  bookKey,
  bookTitle,
  currentUserId,
}: ReviewModalProps) {
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !bookKey) return;
    setLoading(true);
    fetch(`/api/reviews?bookKey=${encodeURIComponent(bookKey)}`)
      .then((r) => r.json())
      .then((data) => {
        setReviewList(data.reviews ?? []);
        setAvgRating(data.avgRating ?? 0);
        if (currentUserId) {
          const mine = (data.reviews ?? []).find((r: Review) => r.userId === currentUserId);
          if (mine) {
            setMyRating(mine.rating);
            setMyText(mine.reviewText ?? "");
            setSubmitted(true);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, bookKey, currentUserId]);

  useEffect(() => {
    if (!isOpen) {
      setMyRating(0);
      setMyText("");
      setSubmitted(false);
      setIsEdited(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  async function handleSubmit() {
    if (!myRating) return;
    const wasSubmitted = submitted;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookKey, rating: myRating, reviewText: myText || undefined }),
      });
      if (res.ok) {
        const newReview: Review = await res.json();
        setReviewList((prev) => {
          const filtered = prev.filter((r) => r.userId !== currentUserId);
          return [newReview, ...filtered];
        });
        const all = [newReview, ...reviewList.filter((r) => r.userId !== currentUserId)];
        setAvgRating(Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10) / 10);
        setSubmitted(true);
        if (wasSubmitted) setIsEdited(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setConfirmDelete(true);
  }

  async function executeDelete() {
    setConfirmDelete(false);
    setDeleting(true);
    try {
      const res = await fetch(`/api/reviews?bookKey=${encodeURIComponent(bookKey)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReviewList((prev) => prev.filter((r) => r.userId !== currentUserId));
        const remaining = reviewList.filter((r) => r.userId !== currentUserId);
        setAvgRating(
          remaining.length > 0
            ? Math.round((remaining.reduce((s, r) => s + r.rating, 0) / remaining.length) * 10) / 10
            : 0
        );
        setMyRating(0);
        setMyText("");
        setSubmitted(false);
        setIsEdited(false);
      }
    } finally {
      setDeleting(false);
    }
  }

  function handleEdit() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!isOpen) return null;

  const myExistingReview = reviewList.find((r) => r.userId === currentUserId);
  const otherReviews = reviewList.filter((r) => r.userId !== currentUserId);

  return (
    <>
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-parchment-light border border-gold/30 rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gold/20 shrink-0">
          <div>
            <h2
              className="text-xl text-leather-dark leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Отзывы
            </h2>
            <p className="text-xs text-sepia/60 mt-0.5 line-clamp-1">{bookTitle}</p>
            {reviewList.length > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <Stars value={Math.round(avgRating)} size={14} />
                <span className="text-xs text-sepia/70">
                  {avgRating.toFixed(1)} · {reviewList.length}{" "}
                  {reviewList.length === 1 ? "отзыв" : reviewList.length < 5 ? "отзыва" : "отзывов"}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-sepia/40 hover:text-burgundy transition-colors p-1 shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {/* Write / edit review form */}
          {currentUserId && (
            <div ref={formRef} className="p-5 border-b border-gold/15">
              <p
                className="text-sm text-leather-dark mb-3"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {submitted ? "Ваш отзыв" : "Оставить отзыв"}
              </p>
              <Stars value={myRating} interactive={!submitting} onChange={setMyRating} size={24} />
              <textarea
                value={myText}
                onChange={(e) => setMyText(e.target.value)}
                placeholder="Поделитесь мнением о книге (необязательно)..."
                className="w-full mt-3 p-3 text-sm bg-cream border border-gold/30 rounded resize-none focus:outline-none focus:border-sepia/50 text-ink leading-relaxed"
                rows={3}
                maxLength={1000}
                disabled={submitting}
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleSubmit}
                  disabled={!myRating || submitting}
                  className="px-5 py-2 bg-leather text-parchment-light rounded text-xs tracking-wide hover:bg-leather-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {submitting ? "Сохраняю..." : submitted ? "Обновить отзыв" : "Опубликовать"}
                </button>
                {submitted && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 text-xs text-burgundy/70 hover:text-burgundy border border-burgundy/20 hover:border-burgundy/40 rounded transition-colors disabled:opacity-40"
                  >
                    {deleting ? "Удаляю..." : "Удалить"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Reviews list */}
          <div className="p-5 space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="skeleton h-3 w-1/3 rounded" />
                    <div className="skeleton h-3 w-2/3 rounded" />
                  </div>
                ))}
              </div>
            ) : reviewList.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="mx-auto text-gold/40 mb-3"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <p
                  className="text-leather-dark text-base"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Оставь отзыв первым
                </p>
                <p className="text-sepia/50 text-xs mt-1">
                  Поделись своим мнением о книге
                </p>
              </div>
            ) : (
              <>
                {myExistingReview && (
                  <ReviewItem
                    review={myExistingReview}
                    isOwn
                    isEdited={isEdited}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    deleting={deleting}
                  />
                )}
                {otherReviews.map((r) => (
                  <ReviewItem key={r.id} review={r} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Delete review confirmation modal */}
    {confirmDelete && (
      <div
        className="fixed inset-0 z-[60] modal-backdrop flex items-center justify-center p-4 animate-fade-in"
        onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(false); }}
      >
        <div className="bg-parchment-light border border-gold/30 rounded-xl shadow-2xl w-full max-w-xs p-6 animate-fade-in-up">
          <h3
            className="text-base text-leather-dark mb-2"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Удалить отзыв?
          </h3>
          <p className="text-sm text-sepia/60 mb-5">Отзыв будет удалён без возможности восстановления.</p>
          <div className="flex gap-3">
            <button
              onClick={executeDelete}
              className="flex-1 py-2 bg-burgundy text-parchment-light rounded text-sm tracking-wide hover:bg-burgundy-light transition-colors"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Удалить
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
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

function ReviewItem({
  review,
  isOwn,
  isEdited,
  onEdit,
  onDelete,
  deleting,
}: {
  review: Review;
  isOwn?: boolean;
  isEdited?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  return (
    <div className={`flex gap-3 ${isOwn ? "bg-gold/5 -mx-2 px-2 py-2 rounded-lg" : ""}`}>
      <Avatar image={review.userImage} name={review.userName} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-leather-dark">
            {review.userName ?? "Пользователь"}
            {isOwn && <span className="ml-1 text-sepia/40 font-normal">(вы)</span>}
            {isEdited && <span className="ml-1 text-sepia/40 font-normal">(ред)</span>}
          </span>
          <Stars value={review.rating} size={12} />
          {isOwn && (
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={onEdit}
                className="text-[10px] text-sepia/50 hover:text-sepia transition-colors"
              >
                Изменить
              </button>
              <span className="text-sepia/20 text-[10px]">·</span>
              <button
                onClick={onDelete}
                disabled={deleting}
                className="text-[10px] text-burgundy/50 hover:text-burgundy transition-colors disabled:opacity-40"
              >
                Удалить
              </button>
            </div>
          )}
        </div>
        {review.reviewText && (
          <p className="text-xs text-sepia/80 mt-1 leading-relaxed">{review.reviewText}</p>
        )}
        {review.createdAt && (
          <p className="text-[10px] text-sepia/40 mt-1">
            {new Date(review.createdAt).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
