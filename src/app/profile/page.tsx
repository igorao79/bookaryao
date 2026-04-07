"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { SavedBooksGrid } from "@/components/SavedBooksGrid";
import { BookSearchModal } from "@/components/BookSearchModal";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [modalOpen, setModalOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="skeleton w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton h-6 w-40" />
            <div className="skeleton h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* User info */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt=""
              width={64}
              height={64}
              className="rounded-full border-2 border-gold/40"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-sepia/20 flex items-center justify-center text-sepia text-2xl font-bold">
              {session.user?.name?.[0] ?? "?"}
            </div>
          )}
          <div>
            <h1
              className="text-2xl text-leather-dark"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {session.user?.name}
            </h1>
            <p className="text-sm text-sepia/50">{session.user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-leather text-parchment-light rounded text-sm tracking-wide hover:bg-leather-dark transition-colors"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Найти книгу
        </button>
      </div>

      {/* Divider */}
      <div className="divider-ornament text-gold mb-8">
        <span
          className="text-sm text-sepia/40 tracking-widest uppercase"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Моя библиотека
        </span>
      </div>

      <SavedBooksGrid />

      <BookSearchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
