import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bookaryao - Найди свою следующую книгу",
  description:
    "Рекомендации книг на основе ИИ, подобранные под ваш вкус.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${playfair.variable} ${lora.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col relative"
        style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
      >
        <SessionProvider>
          <Navbar />
          <main className="flex-1 relative z-10">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
