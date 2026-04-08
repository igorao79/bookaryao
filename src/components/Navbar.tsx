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
              width="38"
              height="34"
              viewBox="0 0 38 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-300 group-hover:scale-105"
            >
              {/* ── Left page (sepia-light face) ── */}
              <path d="M19 4 L2 7.5 L2 27 L19 24.5 Z" fill="#8b5e34"/>
              {/* Left page top edge highlight */}
              <path d="M19 4 L2 7.5 L2 9.5 L19 6 Z" fill="#a06a3c" opacity="0.55"/>

              {/* ── Right page (darker leather face) ── */}
              <path d="M19 4 L36 7.5 L36 27 L19 24.5 Z" fill="#5c3317"/>
              {/* Right page top edge highlight */}
              <path d="M19 4 L36 7.5 L36 9.5 L19 6 Z" fill="#704214" opacity="0.45"/>

              {/* ── Book bottom depth ── */}
              <path d="M2 27 L2 28.8 L19 26.3 L19 24.5 Z" fill="#2a1508"/>
              <path d="M19 24.5 L19 26.3 L36 28.8 L36 27 Z" fill="#1e0e06"/>

              {/* ── Gold spine ── */}
              <rect x="17.8" y="4" width="2.4" height="20.5" rx="0.6" fill="#c5a55a"/>
              {/* Spine inner shimmer */}
              <rect x="18.2" y="4.5" width="0.7" height="19.5" rx="0.3" fill="#d4b96e" opacity="0.55"/>

              {/* ── Left page text lines ── */}
              <path d="M5.5 12.5 L15.5 11.7" stroke="#faf7f0" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
              <path d="M5.5 16 L15.5 15.2" stroke="#faf7f0" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
              <path d="M5.5 19.5 L12 19" stroke="#faf7f0" strokeWidth="1.1" strokeLinecap="round" opacity="0.35"/>

              {/* ── Right page text lines ── */}
              <path d="M22.5 11.7 L32.5 12.5" stroke="#faf7f0" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
              <path d="M22.5 15.2 L32.5 16" stroke="#faf7f0" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
              <path d="M22.5 19 L29 19.5" stroke="#faf7f0" strokeWidth="1.1" strokeLinecap="round" opacity="0.35"/>

              {/* ── 4-point sparkle (AI / magic) ── */}
              <path
                d="M31.5 4 L32.5 1.2 L33.5 4 L36.3 5 L33.5 6 L32.5 8.8 L31.5 6 L28.7 5 Z"
                fill="#c5a55a"
              />
              {/* Sparkle center dot */}
              <circle cx="32.5" cy="5" r="0.9" fill="#faf7f0" opacity="0.65"/>

              {/* ── Small dot accent on left (mirror balance) ── */}
              <circle cx="4" cy="5.5" r="1" fill="#c5a55a" opacity="0.4"/>
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
