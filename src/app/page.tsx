"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { BookSearchModal } from "@/components/BookSearchModal";
import { AnimatedBookshelf } from "@/components/AnimatedBookshelf";

export default function Home() {
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden h-[calc(100vh-4rem)]">
        {/* Animated bookshelf background */}
        <AnimatedBookshelf />

        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 sm:pt-32 pb-16 text-center">
          {/* Top vignette ornament */}
          <div className="divider-ornament mb-8">
            <svg width="280" height="36" viewBox="0 0 280 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Center floral */}
              <path d="M140 8c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7z" fill="#c5a55a" opacity="0.7" />
              <path d="M140 11c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="#faf7f0" opacity="0.5" />
              {/* Left petals */}
              <ellipse cx="129" cy="13" rx="4" ry="2" transform="rotate(-20 129 13)" fill="#c5a55a" opacity="0.4" />
              <ellipse cx="133" cy="8" rx="3" ry="1.5" transform="rotate(-50 133 8)" fill="#c5a55a" opacity="0.3" />
              {/* Right petals */}
              <ellipse cx="151" cy="13" rx="4" ry="2" transform="rotate(20 151 13)" fill="#c5a55a" opacity="0.4" />
              <ellipse cx="147" cy="8" rx="3" ry="1.5" transform="rotate(50 147 8)" fill="#c5a55a" opacity="0.3" />
              {/* Left main scroll */}
              <path d="M125 15c-8 0-16-2-24-6-10-4-22-4-32-1-8 2.5-16 2-22-1" stroke="#c5a55a" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
              <path d="M125 15c-6 2-14 5-24 5-12 0-22-4-32-7-8-2.5-16-1.5-22 2" stroke="#c5a55a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
              <path d="M69 14c-8-2-18 0-26 3-8 3-18 3-26 0" stroke="#c5a55a" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
              {/* Left curls */}
              <path d="M80 8c-3-4-9-5-13-3" stroke="#c5a55a" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
              <path d="M52 11c-3-4-8-5-12-3" stroke="#c5a55a" strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
              {/* Left leaf */}
              <path d="M30 17c4-2 7-6 5-10" stroke="#c5a55a" strokeWidth="1.1" strokeLinecap="round" opacity="0.35" />
              <path d="M18 14c3-1 5-4 4-7" stroke="#c5a55a" strokeWidth="0.9" strokeLinecap="round" opacity="0.25" />
              {/* Left tip dots */}
              <circle cx="10" cy="16" r="1.5" fill="#c5a55a" opacity="0.3" />
              {/* Right main scroll */}
              <path d="M155 15c8 0 16-2 24-6 10-4 22-4 32-1 8 2.5 16 2 22-1" stroke="#c5a55a" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
              <path d="M155 15c6 2 14 5 24 5 12 0 22-4 32-7 8-2.5 16-1.5 22 2" stroke="#c5a55a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
              <path d="M211 14c8-2 18 0 26 3 8 3 18 3 26 0" stroke="#c5a55a" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
              {/* Right curls */}
              <path d="M200 8c3-4 9-5 13-3" stroke="#c5a55a" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
              <path d="M228 11c3-4 8-5 12-3" stroke="#c5a55a" strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
              {/* Right leaf */}
              <path d="M250 17c-4-2-7-6-5-10" stroke="#c5a55a" strokeWidth="1.1" strokeLinecap="round" opacity="0.35" />
              <path d="M262 14c-3-1-5-4-4-7" stroke="#c5a55a" strokeWidth="0.9" strokeLinecap="round" opacity="0.25" />
              {/* Right tip dots */}
              <circle cx="270" cy="16" r="1.5" fill="#c5a55a" opacity="0.3" />
              {/* Center dots */}
              <circle cx="120" cy="15" r="1.5" fill="#c5a55a" opacity="0.5" />
              <circle cx="160" cy="15" r="1.5" fill="#c5a55a" opacity="0.5" />
              {/* Bottom wave */}
              <path d="M80 28c18-6 36-6 60 0 24 6 42 6 60 0" stroke="#c5a55a" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
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

          {/* Bottom vignette ornament (flipped copy) */}
          <div className="divider-ornament mt-16 mb-0">
            <svg width="280" height="36" viewBox="0 0 280 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleY(-1)" }}>
              <path d="M140 8c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7z" fill="#c5a55a" opacity="0.7" />
              <path d="M140 11c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="#faf7f0" opacity="0.5" />
              <ellipse cx="129" cy="13" rx="4" ry="2" transform="rotate(-20 129 13)" fill="#c5a55a" opacity="0.4" />
              <ellipse cx="133" cy="8" rx="3" ry="1.5" transform="rotate(-50 133 8)" fill="#c5a55a" opacity="0.3" />
              <ellipse cx="151" cy="13" rx="4" ry="2" transform="rotate(20 151 13)" fill="#c5a55a" opacity="0.4" />
              <ellipse cx="147" cy="8" rx="3" ry="1.5" transform="rotate(50 147 8)" fill="#c5a55a" opacity="0.3" />
              <path d="M125 15c-8 0-16-2-24-6-10-4-22-4-32-1-8 2.5-16 2-22-1" stroke="#c5a55a" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
              <path d="M125 15c-6 2-14 5-24 5-12 0-22-4-32-7-8-2.5-16-1.5-22 2" stroke="#c5a55a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
              <path d="M69 14c-8-2-18 0-26 3-8 3-18 3-26 0" stroke="#c5a55a" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
              <path d="M80 8c-3-4-9-5-13-3" stroke="#c5a55a" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
              <path d="M52 11c-3-4-8-5-12-3" stroke="#c5a55a" strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
              <path d="M30 17c4-2 7-6 5-10" stroke="#c5a55a" strokeWidth="1.1" strokeLinecap="round" opacity="0.35" />
              <path d="M18 14c3-1 5-4 4-7" stroke="#c5a55a" strokeWidth="0.9" strokeLinecap="round" opacity="0.25" />
              <circle cx="10" cy="16" r="1.5" fill="#c5a55a" opacity="0.3" />
              <path d="M155 15c8 0 16-2 24-6 10-4 22-4 32-1 8 2.5 16 2 22-1" stroke="#c5a55a" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
              <path d="M155 15c6 2 14 5 24 5 12 0 22-4 32-7 8-2.5 16-1.5 22 2" stroke="#c5a55a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
              <path d="M211 14c8-2 18 0 26 3 8 3 18 3 26 0" stroke="#c5a55a" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
              <path d="M200 8c3-4 9-5 13-3" stroke="#c5a55a" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
              <path d="M228 11c3-4 8-5 12-3" stroke="#c5a55a" strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
              <path d="M250 17c-4-2-7-6-5-10" stroke="#c5a55a" strokeWidth="1.1" strokeLinecap="round" opacity="0.35" />
              <path d="M262 14c-3-1-5-4-4-7" stroke="#c5a55a" strokeWidth="0.9" strokeLinecap="round" opacity="0.25" />
              <circle cx="270" cy="16" r="1.5" fill="#c5a55a" opacity="0.3" />
              <circle cx="120" cy="15" r="1.5" fill="#c5a55a" opacity="0.5" />
              <circle cx="160" cy="15" r="1.5" fill="#c5a55a" opacity="0.5" />
              <path d="M80 28c18-6 36-6 60 0 24 6 42 6 60 0" stroke="#c5a55a" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
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
