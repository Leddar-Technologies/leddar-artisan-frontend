"use client";

import React from "react";

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}) {
  const variants = {
    success: "bg-success/10 text-success border-success/30",
    warning: "bg-gold/15 text-leather border-gold/30",
    danger: "bg-danger/10 text-danger border-danger/30",
    info: "bg-leather/10 text-leather border-leather/30",
    default: "bg-surface-200 text-neutral-900 border-surface-400",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
}
