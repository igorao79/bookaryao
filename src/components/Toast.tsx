"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onDone: () => void;
}

export function Toast({ message, type, onDone }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t1 = setTimeout(() => setVisible(true), 10);
    const t2 = setTimeout(() => setVisible(false), 3000);
    const t3 = setTimeout(() => onDone(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  if (!mounted) return null;

  const isSuccess = type === "success";

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 80,
        right: visible ? 20 : -340,
        opacity: visible ? 1 : 0,
        transition: "right 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
        zIndex: 99999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 18px",
          borderRadius: 10,
          background: isSuccess ? "#faf7f0" : "#fff5f5",
          border: `1px solid ${isSuccess ? "rgba(197,165,90,0.4)" : "rgba(114,47,55,0.35)"}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          fontFamily: "var(--font-playfair), serif",
          fontSize: 13,
          color: isSuccess ? "#5c3317" : "#722f37",
          whiteSpace: "nowrap",
        }}
      >
        {isSuccess ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#c5a55a" strokeWidth="1.5" />
            <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#c5a55a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#722f37" strokeWidth="1.5" />
            <path d="M8 4.5v4M8 11v.5" stroke="#722f37" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
        {message}
      </div>
    </div>,
    document.body
  );
}
