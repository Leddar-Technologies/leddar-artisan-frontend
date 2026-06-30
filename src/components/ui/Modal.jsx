"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Simple accessible modal overlay.
 * Props: open, onClose, title, children
 */
export default function Modal({ open, onClose, title, children }) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop — covers everything including sticky/blurred headers */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-cream shadow-2xl border border-surface-400">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-400 px-6 py-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-neutral-600 hover:bg-surface-100 hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
