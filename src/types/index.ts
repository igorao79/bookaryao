import { z } from "zod";

// ── Book types ──────────────────────────────────────────────────────

export interface BookResult {
  title: string;
  author: string;
  description: string;
  genres: string[];
  coverUrl: string | null;
  googleBooksId: string | null;
  openLibraryKey: string | null;
}

export interface BookRecommendation extends BookResult {
  aiSummary: string;
  matchingGenres: string[];
}

export interface RejectedBook {
  title: string;
  author: string;
  reason: string;
}

export interface SavedBook {
  id: string;
  userId: string;
  title: string;
  author: string;
  description: string | null;
  genres: string[];
  coverUrl: string | null;
  aiSummary: string | null;
  googleBooksId: string | null;
  openLibraryKey: string | null;
  createdAt: Date | null;
  avgRating?: number;
  reviewCount?: number;
}

export interface Review {
  id: string;
  userId: string;
  bookKey: string;
  rating: number;
  reviewText: string | null;
  userName: string | null;
  userImage: string | null;
  createdAt: Date | null;
}

// ── AI response ─────────────────────────────────────────────────────

export interface AIBookSuggestion {
  title: string;
  author: string;
  genres: string[];
  whyItMatches: string;
  searchQuery: string;
}

// ── Zod schemas ─────────────────────────────────────────────────────

export const searchFromScratchSchema = z.object({
  type: z.literal("scratch"),
  genre: z.string().min(1, "Выберите жанр"),
  description: z.string().min(50, "Описание должно быть не менее 50 символов"),
  rejectedBooks: z
    .array(
      z.object({
        title: z.string(),
        author: z.string(),
        reason: z.string(),
      })
    )
    .optional()
    .default([]),
});

export const searchBySimilarSchema = z.object({
  type: z.literal("similar"),
  bookTitle: z.string().min(1, "Введите название книги"),
  author: z.string().optional().default(""),
  whatYouLiked: z.string().min(1, "Опишите, что вам понравилось"),
  rejectedBooks: z
    .array(
      z.object({
        title: z.string(),
        author: z.string(),
        reason: z.string(),
      })
    )
    .optional()
    .default([]),
});

export const searchRequestSchema = z.discriminatedUnion("type", [
  searchFromScratchSchema,
  searchBySimilarSchema,
]);

export const rejectRequestSchema = z.object({
  searchHistoryId: z.string(),
  rejectedBook: z.object({
    title: z.string(),
    author: z.string(),
  }),
  reason: z.string().min(1, "Укажите причину"),
  originalRequest: searchRequestSchema,
});

export const saveBookSchema = z.object({
  title: z.string(),
  author: z.string(),
  description: z.string().optional(),
  genres: z.array(z.string()),
  coverUrl: z.string().nullable(),
  aiSummary: z.string(),
  googleBooksId: z.string().nullable(),
  openLibraryKey: z.string().nullable(),
});

export type SearchFromScratchRequest = z.infer<typeof searchFromScratchSchema>;
export type SearchBySimilarRequest = z.infer<typeof searchBySimilarSchema>;
export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type RejectRequest = z.infer<typeof rejectRequestSchema>;
export type SaveBookRequest = z.infer<typeof saveBookSchema>;
