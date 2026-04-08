import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // AniList covers
      { protocol: "https", hostname: "s4.anilist.co" },
      // Kitsu covers
      { protocol: "https", hostname: "media.kitsu.app" },
      { protocol: "https", hostname: "media.kitsu.io" },
      // MyAnimeList / Jikan covers
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      // MangaDex covers
      { protocol: "https", hostname: "uploads.mangadex.org" },
    ],
  },
};

export default nextConfig;
