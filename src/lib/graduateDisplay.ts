/** Current graduate schema stores a uint16 year-style value; legacy/custom schemas may use Unix seconds. */
const LEGACY_COMPLETION_MAX = 100_000n;

export function formatDecodedCompletionDate(completionDate: bigint): string {
  if (completionDate <= LEGACY_COMPLETION_MAX) {
    return completionDate.toString();
  }
  return formatUnixDateFromSeconds(completionDate);
}

function formatUnixDateFromSeconds(sec: bigint): string {
  if (sec <= 0n) return "N/A";
  const ms = Number(sec * 1000n);
  if (!Number.isFinite(ms)) {
    return sec.toString();
  }
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return sec.toString();
  }
}

/**
 * Returns a safe http(s) URL for display, or null if empty/invalid.
 * Prepends https:// when no scheme is present.
 */
export function safeExternalHref(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const withProto = /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

export function truncateMiddle(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  const keep = maxLen - 3;
  const head = Math.ceil(keep / 2);
  const tail = Math.floor(keep / 2);
  return `${s.slice(0, head)}…${s.slice(s.length - tail)}`;
}
