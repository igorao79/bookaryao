"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const GENRES = [
  "Фэнтези",
  "Детектив",
  "Sci-Fi",
  "Романтика",
  "Триллер",
  "Ужасы",
  "Приключения",
  "Философия",
  "Поэзия",
  "Психология",
  "Драма",
  "Мистика",
];

interface BookDef {
  widthFr: number; // flex fraction
  height: number;
  color: string;
  accent: string;
  hasStripes: boolean;
}

const PALETTE = [
  { color: "#704214", accent: "#c5a55a" },
  { color: "#722f37", accent: "#d4a0a7" },
  { color: "#5c3317", accent: "#b89a4a" },
  { color: "#8b5e34", accent: "#f5efe0" },
  { color: "#3e1f0d", accent: "#c5a55a" },
  { color: "#8c3a44", accent: "#f0d0d4" },
  { color: "#1a1a2e", accent: "#b89a4a" },
  { color: "#2d4a3e", accent: "#a8c5b0" },
  { color: "#4a2d5e", accent: "#c5a0d4" },
  { color: "#b89a4a", accent: "#3e1f0d" },
  { color: "#5e3a2d", accent: "#d4b896" },
  { color: "#2d3a5e", accent: "#a0b4d4" },
];

function generateBooks(count: number, seed: number): BookDef[] {
  const books: BookDef[] = [];
  for (let i = 0; i < count; i++) {
    const ci = (i + seed) % PALETTE.length;
    const fr = 3 + ((i * 7 + seed * 3) % 5); // flex: 3-7
    const h = 55 + ((i * 5 + seed) % 25);
    books.push({
      widthFr: fr,
      height: h,
      color: PALETTE[ci].color,
      accent: PALETTE[ci].accent,
      hasStripes: i % 3 === 0,
    });
  }
  return books;
}

const ROWS = 6;
const BOOKS_PER_ROW = 40;

export function AnimatedBookshelf() {
  const [activeBook, setActiveBook] = useState<{ row: number; col: number } | null>(null);
  const [genre, setGenre] = useState("");
  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState<"idle" | "rising" | "typing" | "holding" | "falling">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bookRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [rows] = useState(() =>
    Array.from({ length: ROWS }, (_, i) => generateBooks(BOOKS_PER_ROW, i * 7))
  );

  const pickRandom = useCallback(() => {
    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * BOOKS_PER_ROW);
    const g = GENRES[Math.floor(Math.random() * GENRES.length)];
    setActiveBook({ row, col });
    setGenre(g);
    setTypedText("");
    setPhase("rising");

    timeoutRef.current = setTimeout(() => {
      setPhase("typing");
    }, 700);
  }, []);

  // Typing
  useEffect(() => {
    if (phase !== "typing") return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(genre.slice(0, i));
      if (i >= genre.length) {
        clearInterval(interval);
        setPhase("holding");
        timeoutRef.current = setTimeout(() => {
          setPhase("falling");
          timeoutRef.current = setTimeout(() => {
            setActiveBook(null);
            setPhase("idle");
          }, 700);
        }, 1800);
      }
    }, 90);
    return () => clearInterval(interval);
  }, [phase, genre]);

  // Cycle
  useEffect(() => {
    if (phase !== "idle") return;
    const t = setTimeout(pickRandom, 1500);
    return () => clearTimeout(t);
  }, [phase, pickRandom]);

  // Initial
  useEffect(() => {
    const t = setTimeout(pickRandom, 800);
    return () => {
      clearTimeout(t);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Genre bubble - rendered as portal-like at top level so it's not clipped */}
      {activeBook && (phase === "typing" || phase === "holding") && (() => {
        const el = bookRefs.current.get(`${activeBook.row}-${activeBook.col}`);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const parentRect = el.closest("[data-shelf]")?.getBoundingClientRect();
        if (!parentRect) return null;
        const left = rect.left - parentRect.left + rect.width / 2;
        const top = rect.top - parentRect.top - 12;
        const book = rows[activeBook.row][activeBook.col];

        return (
          <div
            className="absolute z-30 whitespace-nowrap"
            style={{
              left,
              top,
              transform: "translate(-50%, -100%)",
              animation: "bubbleIn 0.3s ease-out both",
            }}
          >
            <div
              className="relative px-3 py-1.5 rounded-lg shadow-lg"
              style={{
                background: "#faf7f0",
                border: "1px solid rgba(197,165,90,0.4)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
            >
              <span
                className="text-xs font-medium tracking-wide"
                style={{
                  color: book.color,
                  fontFamily: "var(--font-playfair), serif",
                }}
              >
                {typedText}
                {phase === "typing" && (
                  <span
                    className="inline-block w-[1.5px] h-3 ml-0.5 -mb-0.5"
                    style={{
                      background: book.color,
                      animation: "cursorBlink 0.7s step-end infinite",
                    }}
                  />
                )}
              </span>
              <div
                className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-3 h-3 rotate-45"
                style={{
                  background: "#faf7f0",
                  borderRight: "1px solid rgba(197,165,90,0.4)",
                  borderBottom: "1px solid rgba(197,165,90,0.4)",
                }}
              />
            </div>
          </div>
        );
      })()}

      <div className="w-full h-full flex flex-col" data-shelf>
        {rows.map((books, rowIdx) => (
          <div
            key={rowIdx}
            className="flex items-end w-full"
            style={{
              flex: 1,
              borderBottom: "2px solid rgba(92,51,23,0.08)",
            }}
          >
            {books.map((book, colIdx) => {
              const isActive =
                activeBook?.row === rowIdx && activeBook?.col === colIdx;
              const isRising = isActive && (phase === "rising" || phase === "typing" || phase === "holding");
              const isFalling = isActive && phase === "falling";

              return (
                <div
                  key={colIdx}
                  ref={(el) => {
                    if (el) bookRefs.current.set(`${rowIdx}-${colIdx}`, el);
                  }}
                  style={{ flex: book.widthFr }}
                >
                  <div
                    className="mx-[1px] rounded-t-sm"
                    style={{
                      height: book.height,
                      background: `linear-gradient(to right, ${book.color}dd, ${book.color}, ${book.color}cc)`,
                      opacity: isActive ? 0.45 : 0.07,
                      transform: isRising
                        ? "translateY(-24px)"
                        : "translateY(0)",
                      transition: isRising
                        ? "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s"
                        : isFalling
                          ? "transform 0.7s ease-in, opacity 0.7s"
                          : "opacity 0.5s",
                      boxShadow: isActive
                        ? `0 -4px 12px ${book.color}44, inset -2px 0 4px rgba(0,0,0,0.2)`
                        : "none",
                    }}
                  >
                    {book.hasStripes && (
                      <>
                        <div
                          className="mx-auto mt-[15%] rounded-full"
                          style={{
                            width: "60%",
                            height: 1,
                            background: `${book.accent}66`,
                          }}
                        />
                        <div
                          className="mx-auto mt-1 rounded-full"
                          style={{
                            width: "40%",
                            height: 1,
                            background: `${book.accent}44`,
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes bubbleIn {
          from {
            opacity: 0;
            transform: translate(-50%, -100%) translateY(8px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%) translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
