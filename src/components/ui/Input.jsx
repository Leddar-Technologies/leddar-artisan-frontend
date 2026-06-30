"use client";

import React from "react";

export default function Input({ label, error, className = "", value, ...props }) {
  const isFilled = value !== undefined && value !== "";

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-900 mb-1.5">
          {label}
        </label>
      )}

      <input
        value={value}
        className={`w-full px-4 py-2.5 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-[#8B4513]/30 focus:border-leather ${
          error
            ? "border-danger bg-red-50 focus:ring-danger/30 focus:border-danger"
            : isFilled
            ? "border-leather bg-[#FDF5EE]"
            : "border-surface-500 bg-white/90"
        } ${className}`}
        {...props}
      />

      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
