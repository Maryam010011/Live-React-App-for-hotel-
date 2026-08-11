/**
 * HTML Sanitizer & Text Formatter Utility
 * 
 * Safely strips HTML tags and decodes HTML entities from API descriptions.
 * Prevents raw tags like <p>, <b>, <br> from displaying to users.
 */
export function cleanHtmlDescription(html?: string): string {
  if (!html) return '';

  // 1. Convert breaks and block-closing tags to line breaks
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ');

  // 2. Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // 3. Decode common HTML entities
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  };

  text = text.replace(/&[a-z0-9#]+;/gi, (match) => {
    const lower = match.toLowerCase();
    if (entities[lower]) return entities[lower];
    if (lower.startsWith('&#x')) {
      const code = parseInt(lower.slice(3, -1), 16);
      return !isNaN(code) ? String.fromCharCode(code) : match;
    }
    if (lower.startsWith('&#')) {
      const code = parseInt(lower.slice(2, -1), 10);
      return !isNaN(code) ? String.fromCharCode(code) : match;
    }
    return match;
  });

  // 4. Format lines: trim and remove redundant empty lines
  const paragraphs = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return paragraphs.join('\n\n');
}
