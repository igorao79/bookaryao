"use client";

import { useState, useEffect, useCallback } from "react";
import { SearchFromScratch } from "./SearchFromScratch";
import { SearchBySimilar } from "./SearchBySimilar";

export interface SearchPrefill {
  bookTitle: string;
  author: string;
  genres: string[];
}

interface BookSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefill?: SearchPrefill;
  initialMode?: "similar" | "scratch";
}

type SearchMode = "choose" | "scratch" | "similar";

export function BookSearchModal({ isOpen, onClose, prefill, initialMode }: BookSearchModalProps) {
  const [mode, setMode] = useState<SearchMode>(initialMode ?? "choose");

  // Re-sync mode when modal opens with a new initialMode
  useEffect(() => {
    if (isOpen) setMode(initialMode ?? "choose");
  }, [isOpen, initialMode]);

  const handleClose = useCallback(() => {
    setMode("choose");
    onClose();
  }, [onClose]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Найти книгу"
    >
      <div className="bg-parchment-light border border-gold/30 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gold/20">
          <div>
            <h2
              className="text-2xl text-leather-dark"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {mode === "choose" && "Найди свою следующую книгу"}
              {mode === "scratch" && "Открой что-то новое"}
              {mode === "similar" && "Найди похожую книгу"}
            </h2>
            {mode !== "choose" && !prefill && (
              <button
                onClick={() => setMode("choose")}
                className="text-xs text-sepia/60 hover:text-burgundy mt-1 flex items-center gap-1 transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                >
                  <path d="M8 2L4 6l4 4" />
                </svg>
                Назад к выбору
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-sepia/40 hover:text-burgundy transition-colors p-1"
            aria-label="Закрыть"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {mode === "choose" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => setMode("scratch")}
                className="group p-6 border border-gold/30 rounded-lg hover:border-sepia/50 hover:bg-cream transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full bg-sepia/10 flex items-center justify-center mb-4 group-hover:bg-sepia/20 transition-colors">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-sepia"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <h3
                  className="text-lg text-leather-dark mb-2"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  С нуля
                </h3>
                <p className="text-sm text-sepia/60 leading-relaxed">
                  Опишите, что хотите почитать, и наш ИИ подберёт
                  идеальную книгу.
                </p>
              </button>

              <button
                onClick={() => setMode("similar")}
                className="group p-6 border border-gold/30 rounded-lg hover:border-sepia/50 hover:bg-cream transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center mb-4 group-hover:bg-burgundy/20 transition-colors">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-burgundy"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                    <path d="M12 6v7l3-2 3 2V6" />
                  </svg>
                </div>
                <h3
                  className="text-lg text-leather-dark mb-2"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  По похожей&hellip;
                </h3>
                <p className="text-sm text-sepia/60 leading-relaxed">
                  Расскажите о книге, которая вам понравилась, и мы найдём
                  что-то похожее.
                </p>
              </button>
            </div>
          )}

          {mode === "scratch" && <SearchFromScratch onClose={handleClose} />}
          {mode === "similar" && <SearchBySimilar onClose={handleClose} prefill={prefill} />}
        </div>
      </div>
    </div>
  );
}
