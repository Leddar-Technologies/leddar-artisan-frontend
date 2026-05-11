"use client";

import React from "react";

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-leather text-white hover:bg-[#592f22]",
    secondary: "bg-espresso text-white hover:bg-[#2a1d1a]",
    success: "bg-success text-white hover:bg-[#24543f]",
    danger: "bg-danger text-white hover:bg-[#941c13]",
    outline:
      "bg-transparent border-2 border-leather text-leather hover:bg-surface-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm sm:text-base",
    lg: "px-5 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg",
  };

  return (
    <button
      className={`rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
