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
  widthFr: number;
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
    const fr = 3 + ((i * 7 + seed * 3) % 5);
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
const SAFE_MIN = Math.floor(BOOKS_PER_ROW * 0.25);
const SAFE_MAX = Math.floor(BOOKS_PER_ROW * 0.75);
const SAFE_ROW_MIN = 4;

function pickSafeBook(): { row: number; col: number } {
  const row =
    SAFE_ROW_MIN + Math.floor(Math.random() * (ROWS - SAFE_ROW_MIN));
  const side = Math.random() < 0.5 ? "left" : "right";
  const col =
    side === "left"
      ? Math.floor(Math.random() * SAFE_MIN)
      : SAFE_MAX + Math.floor(Math.random() * (BOOKS_PER_ROW - SAFE_MAX));
  return { row, col };
}

export function AnimatedBookshelf() {
  const [activeBook, setActiveBook] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [genre, setGenre] = useState("");
  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState<
    "idle" | "rising" | "typing" | "holding" | "falling"
  >("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const [rows] = useState(() =>
    Array.from({ length: ROWS }, (_, i) => generateBooks(BOOKS_PER_ROW, i * 7))
  );

  const pickRandom = useCallback(() => {
    const { row, col } = pickSafeBook();
    const g = GENRES[Math.floor(Math.random() * GENRES.length)];
    setActiveBook({ row, col });
    setGenre(g);
    setTypedText("");
    setPhase("rising");

    timeoutRef.current = setTimeout(() => {
      setPhase("typing");
    }, 700);
  }, []);

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

  useEffect(() => {
    if (phase !== "idle") return;
    const t = setTimeout(pickRandom, 1500);
    return () => clearTimeout(t);
  }, [phase, pickRandom]);

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
      <div className="w-full h-full flex flex-col">
        {rows.map((books, rowIdx) => (
          <div
            key={rowIdx}
            className="flex items-end w-full"
            style={{
              flex: 1,
              borderBottom: "2px solid rgba(92,51,23,0.08)",
              overflow: "visible",
              position: "relative",
              zIndex: activeBook?.row === rowIdx ? 20 : 1,
            }}
          >
            {books.map((book, colIdx) => {
              const isActive =
                activeBook?.row === rowIdx && activeBook?.col === colIdx;
              const isUp =
                isActive &&
                (phase === "rising" ||
                  phase === "typing" ||
                  phase === "holding");
              const isFalling = isActive && phase === "falling";
              const showBubble =
                isActive && (phase === "typing" || phase === "holding");

              return (
                <div
                  key={colIdx}
                  style={{
                    flex: book.widthFr,
                    overflow: "visible",
                    position: "relative",
                  }}
                >
                  {/* Bubble: positioned via wrapper that matches book position */}
                  {showBubble && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: book.height + 30,
                        left: 0,
                        right: 0,
                        display: "flex",
                        justifyContent: "center",
                        zIndex: 30,
                      }}
                    >
                      <div
                        style={{
                          background: "#faf7f0",
                          border: "1px solid rgba(197,165,90,0.4)",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                          borderRadius: 8,
                          padding: "6px 12px",
                          whiteSpace: "nowrap",
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.05em",
                            color: book.color,
                            fontFamily: "var(--font-playfair), serif",
                          }}
                        >
                          {typedText}
                          {phase === "typing" && (
                            <span
                              style={{
                                display: "inline-block",
                                width: 1.5,
                                height: 12,
                                marginLeft: 2,
                                marginBottom: -2,
                                background: book.color,
                                animation:
                                  "shelf-cursor 0.7s step-end infinite",
                              }}
                            />
                          )}
                        </span>
                        {/* Arrow */}
                        <div
                          style={{
                            position: "absolute",
                            left: "50%",
                            bottom: -6,
                            width: 10,
                            height: 10,
                            background: "#faf7f0",
                            borderRight: "1px solid rgba(197,165,90,0.4)",
                            borderBottom: "1px solid rgba(197,165,90,0.4)",
                            transform: "translateX(-50%) rotate(45deg)",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Book spine */}
                  <div
                    style={{
                      height: book.height,
                      margin: "0 1px",
                      borderRadius: "2px 2px 0 0",
                      background: `linear-gradient(to right, ${book.color}dd, ${book.color}, ${book.color}cc)`,
                      opacity: isActive ? 0.45 : 0.07,
                      transform: isUp
                        ? "translateY(-24px)"
                        : "translateY(0)",
                      transition: isUp
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
                          style={{
                            width: "60%",
                            height: 1,
                            margin: "0 auto",
                            marginTop: "15%",
                            borderRadius: 9999,
                            background: `${book.accent}66`,
                          }}
                        />
                        <div
                          style={{
                            width: "40%",
                            height: 1,
                            margin: "4px auto 0",
                            borderRadius: 9999,
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
        @keyframes shelf-cursor {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
