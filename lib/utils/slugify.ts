/**
 * Generate a URL-friendly slug from a string.
 * Appends a short random suffix to ensure uniqueness.
 */
export function generateSlug(text: string, shortId?: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-|-$/g, '');         // Trim leading/trailing hyphens

  // Truncate to reasonable length for URL
  const truncated = base.substring(0, 60).replace(/-$/g, '');

  // Append short unique suffix
  const suffix = shortId || Math.random().toString(36).substring(2, 8);

  return `${truncated}-${suffix}`;
}
