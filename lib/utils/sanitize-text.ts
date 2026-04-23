const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const UUID_INLINE = /\s*[-–:]\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const UUID_LABELED = /\s*\b(?:ID|Id|id)\s*[:=]\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const UUID_LABELED_PHRASE = /\.\s*(?:Heat Cycle|Heat cycle|Cycle|Breeding|Breeding Record|Reading|Animal)\s+(?:ID|Id|id)\s*:\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.?/gi;

export function stripUUIDs(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(UUID_LABELED_PHRASE, '')
    .replace(UUID_LABELED, '')
    .replace(UUID_INLINE, '')
    .replace(UUID_REGEX, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .trim();
}
