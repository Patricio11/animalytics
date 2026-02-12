-- Add SEO-friendly slug column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Backfill existing listings with slugs generated from title + short id
UPDATE listings
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      CONCAT(
        REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '-',
        LEFT(id::text, 8)
      ),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;
