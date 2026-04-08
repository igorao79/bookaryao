"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthButton } from "./AuthButton";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gold/20 bg-parchment/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <svg
              width="40"
              height="36"
              viewBox="0 0 40 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-300 group-hover:scale-105"
            >
              {/* ── Dark book shell (gives the shape a solid border/depth) ── */}
              <path
                d="M20 3 C14 2.5, 2 5, 2 7 L2 27 L2 29 C2 30.5, 14 29, 20 28 C26 29, 38 30.5, 38 29 L38 27 L38 7 C38 5, 26 2.5, 20 3 Z"
                fill="#2a1508"
              />

              {/* ── Left page face ── */}
              <path
                d="M20 5 C15 4.5, 4.5 6.5, 4.5 8 L4.5 26 C4.5 27, 15 26.5, 20 26 Z"
                fill="#8b5e34"
              />
              {/* Left page top gleam */}
              <path
                d="M20 5 C15 4.5, 4.5 6.5, 4.5 8 L4.5 9.5 C4.5 8, 15 6, 20 6.5 Z"
                fill="#a67c52"
                opacity="0.5"
              />

              {/* ── Right page face (darker) ── */}
              <path
                d="M20 5 C25 4.5, 35.5 6.5, 35.5 8 L35.5 26 C35.5 27, 25 26.5, 20 26 Z"
                fill="#704214"
              />
              {/* Right page top gleam */}
              <path
                d="M20 5 C25 4.5, 35.5 6.5, 35.5 8 L35.5 9.5 C35.5 8, 25 6, 20 6.5 Z"
                fill="#8b5e34"
                opacity="0.45"
              />

              {/* ── Gold spine ── */}
              <rect x="18.8" y="3.5" width="2.4" height="24.5" rx="0.6" fill="#c5a55a"/>
              {/* Spine shimmer line */}
              <rect x="19.3" y="4" width="0.8" height="23.5" rx="0.3" fill="#dcc580" opacity="0.5"/>
              {/* Spine diamond ornament */}
              <path d="M20 14 L21.3 16 L20 18 L18.7 16 Z" fill="#b89a4a"/>
              <circle cx="20" cy="11" r="0.7" fill="#dcc580" opacity="0.7"/>
              <circle cx="20" cy="21" r="0.7" fill="#dcc580" opacity="0.7"/>

              {/* ── Left page text lines ── */}
              <path d="M7 12 Q13 11.3, 17 11.6" stroke="#faf7f0" strokeWidth="1" strokeLinecap="round" opacity="0.45"/>
              <path d="M7 15 Q13 14.3, 17 14.6" stroke="#faf7f0" strokeWidth="1" strokeLinecap="round" opacity="0.45"/>
              <path d="M7 18 Q11 17.5, 14 17.7" stroke="#faf7f0" strokeWidth="0.8" strokeLinecap="round" opacity="0.3"/>
              <path d="M7 21 Q12 20.5, 16 20.7" stroke="#faf7f0" strokeWidth="0.8" strokeLinecap="round" opacity="0.25"/>

              {/* ── Right page text lines ── */}
              <path d="M23 11.6 Q27 11.3, 33 12" stroke="#faf7f0" strokeWidth="1" strokeLinecap="round" opacity="0.45"/>
              <path d="M23 14.6 Q27 14.3, 33 15" stroke="#faf7f0" strokeWidth="1" strokeLinecap="round" opacity="0.45"/>
              <path d="M23 17.7 Q27 17.5, 30 18" stroke="#faf7f0" strokeWidth="0.8" strokeLinecap="round" opacity="0.3"/>
              <path d="M23 20.7 Q27 20.5, 32 21" stroke="#faf7f0" strokeWidth="0.8" strokeLinecap="round" opacity="0.25"/>

              {/* ── Sparkle star (AI) ── */}
              <path
                d="M34 4.5 L35 2 L36 4.5 L38.5 5.5 L36 6.5 L35 9 L34 6.5 L31.5 5.5 Z"
                fill="#c5a55a"
              />
              <circle cx="35" cy="5.5" r="0.8" fill="#faf7f0" opacity="0.55"/>
              {/* Companion dot */}
              <circle cx="32" cy="2.5" r="0.9" fill="#c5a55a" opacity="0.45"/>
            </svg>

            <span
              className="text-xl tracking-wide text-leather group-hover:text-burgundy transition-colors"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Bookaryao
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-sepia/80 hover:text-burgundy tracking-wide transition-colors uppercase"
              style={{ letterSpacing: "0.1em" }}
            >
              Главная
            </Link>
            <Link
              href="/profile"
              className="text-sm text-sepia/80 hover:text-burgundy tracking-wide transition-colors uppercase"
              style={{ letterSpacing: "0.1em" }}
            >
              Мои книги
            </Link>
            <div className="w-px h-5 bg-gold/30" />
            <AuthButton />
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 text-sepia"
            aria-label="Меню"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              {menuOpen ? (
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 border-t border-gold/20 pt-3 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-sepia/80 uppercase tracking-widest"
              >
                Главная
              </Link>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-sepia/80 uppercase tracking-widest"
              >
                Мои книги
              </Link>
              <div className="pt-2 border-t border-gold/20">
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
