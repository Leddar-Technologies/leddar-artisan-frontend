"use client";

import { useState } from "react";
import { Phone, CheckCircle, AlertCircle } from "lucide-react";

export function normalizePhone(raw) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234")) return "+" + digits;
  if (digits.startsWith("0")) return "+234" + digits.slice(1);
  if (raw.startsWith("+")) return "+" + digits;
  return "+" + digits;
}

export function validatePhone(normalised) {
  if (!normalised) return false;
  if (normalised.startsWith("+234")) return /^\+234\d{10}$/.test(normalised);
  return /^\+\d{7,15}$/.test(normalised);
}

export function getPhoneError(value) {
  if (!value) return "Phone number is required";
  const norm = normalizePhone(value);
  if (norm.startsWith("+234")) {
    const digits = norm.slice(4);
    if (digits.length < 10) return `Incomplete — ${10 - digits.length} more digit(s) needed`;
    if (digits.length > 10) return "Too many digits for a Nigerian number";
  }
  if (!validatePhone(norm)) return "Enter a valid number, e.g. 08012345678 or +2348012345678";
  return null;
}

export default function PhoneInput({
  label = "WhatsApp Number *",
  value = "",
  onChange,
  error,
  name = "whatsapp",
  className = "",
}) {
  const [touched, setTouched] = useState(false);

  const norm = normalizePhone(value);
  const isValid = value ? validatePhone(norm) : null;
  const phoneError = touched && value ? getPhoneError(value) : null;
  const showError = !!(phoneError || (touched && error));
  const showSuccess = touched && isValid && !phoneError;

  function handleChange(e) {
    const raw = e.target.value.replace(/[^\d+\s\-]/g, "");
    onChange({ target: { name, value: raw } });
  }

  function handleBlur() {
    setTouched(true);
    if (value) {
      const normalised = normalizePhone(value);
      onChange({ target: { name, value: normalised } });
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-900 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative flex items-stretch">
        <div className="flex items-center gap-1.5 rounded-l-xl border border-r-0 border-surface-500 bg-[#F4EEE9] px-3 select-none">
          <Phone size={14} className="text-[#8B6355]" />
          <span className="text-sm font-bold text-[#5A2F22]">🇳🇬</span>
        </div>

        <input
          type="tel"
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="08012345678 or +2348012345678"
          className={`w-full rounded-r-xl border px-4 py-2.5 pr-10 outline-none transition-all focus:ring-2 ${
            showError
              ? "border-danger bg-red-50 focus:ring-danger/30 focus:border-danger"
              : showSuccess
              ? "border-green-500 bg-green-50 focus:ring-green-200 focus:border-green-500"
              : "border-surface-500 bg-white/90 focus:ring-gold/50 focus:border-gold"
          }`}
        />

        {touched && value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid && !phoneError ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <AlertCircle size={16} className="text-danger" />
            )}
          </div>
        )}
      </div>

      {phoneError ? (
        <p className="mt-1 text-xs font-medium text-danger">{phoneError}</p>
      ) : error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-neutral-400">
          e.g. 08012345678 or +2348012345678
        </p>
      )}
    </div>
  );
}
