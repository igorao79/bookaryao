"use client";

import { useState, useCallback } from "react";
import type {
  BookRecommendation,
  RejectedBook,
  SearchRequest,
} from "@/types";

async function safeJson(res: Response): Promise<Record<string, unknown>> {
  try {
    const text = await res.text();
    if (!text) return {};
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

interface UseBookSearchReturn {
  recommendation: BookRecommendation | null;
  searchHistoryId: string | null;
  rejectedBooks: RejectedBook[];
  isSearching: boolean;
  isSaving: boolean;
  error: string | null;
  search: (request: SearchRequest) => Promise<void>;
  reject: (reason: string) => Promise<void>;
  save: () => Promise<boolean>;
  reset: () => void;
  originalRequest: SearchRequest | null;
}

export function useBookSearch(): UseBookSearchReturn {
  const [recommendation, setRecommendation] =
    useState<BookRecommendation | null>(null);
  const [searchHistoryId, setSearchHistoryId] = useState<string | null>(null);
  const [rejectedBooks, setRejectedBooks] = useState<RejectedBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalRequest, setOriginalRequest] = useState<SearchRequest | null>(
    null
  );

  const search = useCallback(async (request: SearchRequest) => {
    setIsSearching(true);
    setError(null);
    setOriginalRequest(request);
    setRejectedBooks([]);

    try {
      const res = await fetch("/api/books/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error((data.error as string) || "Не удалось найти книгу. Попробуйте ещё раз.");
      }

      const data = await safeJson(res);
      if (!data.recommendation) throw new Error("Не удалось найти книгу. Попробуйте ещё раз.");
      setRecommendation(data.recommendation as BookRecommendation);
      setSearchHistoryId(data.searchHistoryId as string);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setIsSearching(false);
    }
  }, []);

  const reject = useCallback(
    async (reason: string) => {
      if (!recommendation || !searchHistoryId || !originalRequest) return;

      setIsSearching(true);
      setError(null);

      const newRejected: RejectedBook = {
        title: recommendation.title,
        author: recommendation.author,
        reason,
      };

      try {
        const res = await fetch("/api/books/reject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            searchHistoryId,
            rejectedBook: {
              title: recommendation.title,
              author: recommendation.author,
            },
            reason,
            originalRequest,
          }),
        });

        if (!res.ok) {
          const data = await safeJson(res);
          throw new Error((data.error as string) || "Не удалось найти альтернативу. Попробуйте ещё раз.");
        }

        const data = await safeJson(res);
        if (!data.recommendation) throw new Error("Не удалось найти альтернативу. Попробуйте ещё раз.");
        setRejectedBooks((prev) => [...prev, newRejected]);
        setRecommendation(data.recommendation as BookRecommendation);
        setSearchHistoryId(data.searchHistoryId as string);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setIsSearching(false);
      }
    },
    [recommendation, searchHistoryId, originalRequest]
  );

  const save = useCallback(async (): Promise<boolean> => {
    if (!recommendation) return false;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/books/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: recommendation.title,
          author: recommendation.author,
          description: recommendation.description,
          genres: recommendation.genres,
          coverUrl: recommendation.coverUrl,
          aiSummary: recommendation.aiSummary,
          googleBooksId: recommendation.googleBooksId,
          openLibraryKey: recommendation.openLibraryKey,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [recommendation]);

  const reset = useCallback(() => {
    setRecommendation(null);
    setSearchHistoryId(null);
    setRejectedBooks([]);
    setIsSearching(false);
    setIsSaving(false);
    setError(null);
    setOriginalRequest(null);
  }, []);

  return {
    recommendation,
    searchHistoryId,
    rejectedBooks,
    isSearching,
    isSaving,
    error,
    search,
    reject,
    save,
    reset,
    originalRequest,
  };
}
