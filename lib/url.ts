/**
 * URL security validation utilities.
 */

/**
 * Validates that a string is a safe HTTP or HTTPS URL to prevent javascript: or data: URI injection.
 */
export function isSafeHttpUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
