"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export function AuthButton() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") {
    return (
      <div className="skeleton h-8 w-20 rounded" />
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="inline-flex items-center gap-2 px-4 py-1.5 text-sm border border-sepia/40 text-sepia rounded hover:bg-sepia hover:text-parchment transition-all tracking-wide"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        Войти
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 group"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt=""
            width={32}
            height={32}
            className="rounded-full border border-gold/40"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-sepia/20 flex items-center justify-center text-sepia text-sm font-bold">
            {session.user?.name?.[0] ?? "?"}
          </div>
        )}
        <span className="text-sm text-sepia/80 hidden sm:inline">
          {session.user?.name}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className={`text-sepia/50 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-cream border border-gold/30 rounded shadow-lg animate-fade-in py-1">
          <a
            href="/profile"
            className="block px-4 py-2 text-sm text-sepia hover:bg-parchment-dark/30 transition-colors"
          >
            Мои книги
          </a>
          <hr className="border-gold/20 my-1" />
          <button
            onClick={() => signOut()}
            className="block w-full text-left px-4 py-2 text-sm text-burgundy hover:bg-parchment-dark/30 transition-colors"
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
