"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { BookSearchModal } from "@/components/BookSearchModal";
import { AnimatedBookshelf } from "@/components/AnimatedBookshelf";

export default function Home() {
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)]">
        {/* Animated bookshelf background */}
        <AnimatedBookshelf />

        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          {/* Top vignette ornament */}
          <div className="divider-ornament text-gold mb-6">
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
