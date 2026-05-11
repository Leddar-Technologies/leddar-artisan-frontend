/**
 * Utility functions for handling reference images and SVG placeholders.
 * Standard JavaScript version for the Leddar Artisan Dashboard.
 */

const palette = ["#c08457", "#7c5c45", "#2f5d50", "#6e4b3a", "#9b7a4d"];

/**
 * Escapes special characters for safe inclusion in SVG data URIs.
 */
const escapeSvgText = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/**
 * Generates a consistent hash from a string to pick a color from the palette.
 */
const hashLabel = (label) =>
  Array.from(label).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );

/**
 * Resolves the label string regardless of whether the input is a string or an object.
 */
const getResolvedLabel = (image) =>
  typeof image === "string" ? image : image.label;

/**
 * Generates the source URI for an image.
 * If a valid URL is provided, it returns it; otherwise, it generates a themed SVG placeholder.
 */
export const getReferenceImageSrc = (image) => {
  if (typeof image === "string") {
    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:") ||
      image.startsWith("blob:") ||
      image.startsWith("/")
    ) {
      return image;
    }
  } else if (image && image.src) {
    return image.src;
  }

  const label = getResolvedLabel(image) || "Reference Image";
  const safeLabel = escapeSvgText(label);
  const color = palette[hashLabel(label) % palette.length];

  // Return a generated SVG placeholder as a Data URI
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" role="img" aria-label="${safeLabel}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8f3ec" />
          <stop offset="100%" stop-color="#eadfce" />
        </linearGradient>
      </defs>
      <rect width="640" height="420" rx="32" fill="url(#bg)" />
      <rect x="32" y="32" width="576" height="356" rx="24" fill="${color}" opacity="0.14" />
      <circle cx="504" cy="126" r="88" fill="${color}" opacity="0.18" />
      <rect x="96" y="116" width="220" height="16" rx="8" fill="${color}" opacity="0.35" />
      <rect x="96" y="152" width="300" height="16" rx="8" fill="${color}" opacity="0.24" />
      <rect x="96" y="188" width="260" height="16" rx="8" fill="${color}" opacity="0.18" />
      <text x="96" y="284" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#2f241c">${safeLabel}</text>
      <text x="96" y="324" font-family="Arial, sans-serif" font-size="18" fill="#5d4b3f">Reference image preview</text>
    </svg>`,
  )}`;
};

/**
 * Returns the alt text for an image.
 */
export const getReferenceImageAlt = (image) => {
  if (!image) return "Reference image";
  return typeof image === "string" ? image : image.alt || image.label;
};
