"use client";

import React from "react";

/**
 * A standardized input component with label and error support.
 * Standard JavaScript version for compatibility with the current Amplify build environment.
 */
export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="w-full">
      {/* Optional Label */}
      {label && (
        <label className="block text-sm font-medium text-neutral-900 mb-1.5">
          {label}
        </label>
      )}

      {/* Main Input Field */}
      <input
        className={`w-full px-4 py-2.5 border border-surface-500 rounded-xl bg-white/90 focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none transition-all ${
          error ? "border-danger focus:ring-danger/30" : "border-surface-500"
        } ${className}`}
        {...props}
      />

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
