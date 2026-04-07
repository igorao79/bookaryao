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
          <Link href="/" className="flex items-center gap-2 group">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-sepia group-hover:text-burgundy transition-colors"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="M8 7h6" />
              <path d="M8 11h4" />
            </svg>
            <span
              className="text-xl tracking-wide text-leather hover:text-burgundy transition-colors"
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
