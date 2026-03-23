const MAX_SEARCH_LEN = 256;

/**
 * Normalize user search input: length cap, strip control chars, Unicode normalize.
 */
export function sanitizeSearchInput(raw: string): string {
  const trimmed = raw.trim().slice(0, MAX_SEARCH_LEN);
  const normalized = trimmed.normalize("NFKC");
  return [...normalized]
    .filter((ch) => {
      const c = ch.codePointAt(0);
      return c !== undefined && c > 0x1f && c !== 0x7f;
    })
    .join("");
}
