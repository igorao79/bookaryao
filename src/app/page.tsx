"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { BookSearchModal } from "@/components/BookSearchModal";

export default function Home() {
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative bookshelf background with colored books */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="bookshelf"
                x="0"
                y="0"
                width="180"
                height="90"
                patternUnits="userSpaceOnUse"
              >
                <rect x="5" y="10" width="15" height="65" rx="1" fill="#704214" />
                <rect x="24" y="18" width="12" height="57" rx="1" fill="#722f37" />
                <rect x="40" y="5" width="18" height="70" rx="1" fill="#5c3317" />
                <rect x="62" y="14" width="14" height="61" rx="1" fill="#c5a55a" />
                <rect x="80" y="8" width="16" height="67" rx="1" fill="#8b5e34" />
                <rect x="100" y="20" width="11" height="55" rx="1" fill="#3e1f0d" />
                <rect x="115" y="12" width="17" height="63" rx="1" fill="#8c3a44" />
                <rect x="136" y="6" width="13" height="69" rx="1" fill="#b89a4a" />
                <rect x="153" y="16" width="15" height="59" rx="1" fill="#704214" />
                <line
                  x1="0"
                  y1="77"
                  x2="180"
                  y2="77"
                  stroke="#5c3317"
                  strokeWidth="2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bookshelf)" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          {/* Top vignette ornament */}
          <div className="divider-ornament text-gold mb-8">
            <svg width="60" height="20" viewBox="0 0 60 20" fill="currentColor" opacity="0.7">
              <path d="M30 0C25 0 22 4 18 6C14 8 8 8 4 6C2 5 0 6 0 8C0 12 6 14 10 14C14 14 18 12 22 10C26 8 28 6 30 6C32 6 34 8 38 10C42 12 46 14 50 14C54 14 60 12 60 8C60 6 58 5 56 6C52 8 46 8 42 6C38 4 35 0 30 0Z" />
            </svg>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl text-leather-dark leading-tight animate-fade-in-up"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Истории
            <br />
            <span className="text-burgundy italic">находят тебя</span>
          </h1>

          <p
            className="mt-6 text-lg text-sepia/70 max-w-xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Опишите своё настроение, книгу, которая вам понравилась, или мир,
            в который хотите погрузиться &mdash; а наш ИИ подберёт идеальное чтение.
          </p>

          <div
            className="mt-10 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            {session ? (
              <button
                onClick={() => setModalOpen(true)}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-leather text-parchment-light rounded-lg text-lg tracking-wide hover:bg-leather-dark transition-all shadow-lg hover:shadow-xl"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="group-hover:rotate-12 transition-transform"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Найти книгу
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sepia/50 text-sm italic">
                  Войдите, чтобы начать открывать книги
                </p>
                <a
                  href="/api/auth/signin"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-leather text-parchment-light rounded-lg text-lg tracking-wide hover:bg-leather-dark transition-all shadow-lg"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Начать
                </a>
              </div>
            )}
          </div>

          {/* Bottom vignette ornament */}
          <div className="divider-ornament text-gold mt-16 mb-0">
            <svg width="60" height="20" viewBox="0 0 60 20" fill="currentColor" opacity="0.7">
              <path d="M30 20C25 20 22 16 18 14C14 12 8 12 4 14C2 15 0 14 0 12C0 8 6 6 10 6C14 6 18 8 22 10C26 12 28 14 30 14C32 14 34 12 38 10C42 8 46 6 50 6C54 6 60 8 60 12C60 14 58 15 56 14C52 12 46 12 42 14C38 16 35 20 30 20Z" />
            </svg>
          </div>
        </div>
      </section>

      <BookSearchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
