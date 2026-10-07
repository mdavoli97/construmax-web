/**
 * Returns a same-origin relative path from a `next` query param, or fallback.
 */
export function getSafeNextPath(
  next: string | null | undefined,
  fallback = "/"
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}
