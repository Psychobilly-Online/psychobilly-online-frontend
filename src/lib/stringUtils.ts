/**
 * String utility functions
 */

/**
 * Decodes HTML entities in a string
 * @param html - String containing HTML entities
 * @returns Decoded string
 */
export function decodeHtmlEntities(html: string | null | undefined): string {
  if (!html) return '';
  if (typeof document === 'undefined') {
    // Server-side fallback
    return html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&apos;/g, "'");
  }
  // Client-side
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

/**
 * Ensures a URL has a protocol prefix
 * @param url - URL string
 * @returns URL with protocol or null if invalid
 */
export function ensureProtocol(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
