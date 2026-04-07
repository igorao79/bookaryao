"use client";

import { useState } from "react";

const QUICK_REASONS = [
  "Слишком похоже на то, что я читал",
  "Не то настроение",
  "Не нравится этот жанр",
  "Слишком длинная / короткая",
  "Не интересен этот автор",
];

interface RejectFeedbackProps {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}

export function RejectFeedback({ onSubmit, onCancel }: RejectFeedbackProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const reason = selected === "other" ? custom : selected;

  return (
    <div className="animate-fade-in-up mt-4">
      <p
        className="text-sm text-leather-dark mb-3"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        Что вам не понравилось в этой книге?
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_REASONS.map((r) => (
          <button
            key={r}
            onClick={() => {
              setSelected(r);
              setCustom("");
            }}
            className={`px-3 py-1.5 text-xs rounded border transition-all ${
              selected === r
                ? "bg-sepia text-parchment border-sepia"
                : "border-gold/40 text-sepia/70 hover:border-sepia/50"
            }`}
          >
            {r}
          </button>
        ))}
        <button
          onClick={() => setSelected("other")}
          className={`px-3 py-1.5 text-xs rounded border transition-all ${
            selected === "other"
              ? "bg-sepia text-parchment border-sepia"
              : "border-gold/40 text-sepia/70 hover:border-sepia/50"
          }`}
        >
          Другое...
        </button>
      </div>

      {selected === "other" && (
        <textarea
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Расскажите подробнее..."
          className="w-full p-3 text-sm bg-cream border border-gold/30 rounded resize-none focus:outline-none focus:border-sepia/50 text-ink"
          rows={2}
          autoFocus
        />
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => reason && onSubmit(reason)}
          disabled={!reason || (selected === "other" && !custom.trim())}
          className="px-4 py-2 text-sm bg-burgundy text-parchment rounded hover:bg-burgundy-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Найти другую книгу
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-sepia/60 hover:text-sepia transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
