-- Add view_count column to animals table
ALTER TABLE animals ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create index for better performance on view count queries
CREATE INDEX IF NOT EXISTS idx_animals_view_count ON animals(view_count DESC);
