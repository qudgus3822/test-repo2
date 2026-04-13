/**
 * Validates that a URL uses a safe HTTP(S) scheme with a host.
 * Prevents XSS via javascript: or data: scheme URLs from external sources.
 */
export function isHttpUrl(url: unknown): boolean {
  if (typeof url !== "string" || !url) return false;
  return /^https?:\/\/.+/.test(url.trim());
}
