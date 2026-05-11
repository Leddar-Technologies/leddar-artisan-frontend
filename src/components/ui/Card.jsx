"use client";

import React from "react";

/**
 * A container component for grouping related content.
 */
export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white/85 rounded-2xl border border-surface-400/70 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * The header section of a Card, typically containing a title.
 */
export function CardHeader({ children, className = "" }) {
  return (
    <div className={`p-4 sm:p-6 border-b border-surface-400/70 ${className}`}>
      {children}
    </div>
  );
}

/**
 * The main body section of a Card.
 */
export function CardContent({ children, className = "" }) {
  return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
}

/**
 * A heading component designed for use within a CardHeader.
 */
export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg font-semibold text-ink ${className}`}>
      {children}
    </h3>
  );
}
