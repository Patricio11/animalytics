-- ============================================================================
-- PREGNANCY SCREENING TASK AUTOMATION - DATABASE MIGRATION
-- Date: December 11, 2025
-- ============================================================================

-- Add new event types for pregnancy screening
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'pregnancy_ultrasound';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'pregnancy_blood_test';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'pregnancy_xray';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'pregnancy_checkup';

-- Add last mating tracking fields to breeding_records table
ALTER TABLE breeding_records 
  ADD COLUMN IF NOT EXISTS is_last_mating BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pregnancy_screening_tasks_generated BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pregnancy_screening_tasks_generated_at TIMESTAMP;

-- Create index for faster queries on last mating
CREATE INDEX IF NOT EXISTS idx_breeding_records_last_mating 
  ON breeding_records(heat_cycle_id, is_last_mating) 
  WHERE is_last_mating = TRUE;

-- Create index for task generation status
CREATE INDEX IF NOT EXISTS idx_breeding_records_tasks_generated 
  ON breeding_records(pregnancy_screening_tasks_generated);

-- Add comment to explain the fields
COMMENT ON COLUMN breeding_records.is_last_mating IS 
  'Marks this breeding as the last mating in the fertility window. Used to trigger pregnancy screening task generation.';

COMMENT ON COLUMN breeding_records.pregnancy_screening_tasks_generated IS 
  'Indicates whether pregnancy screening tasks have been auto-generated for this breeding record.';

COMMENT ON COLUMN breeding_records.pregnancy_screening_tasks_generated_at IS 
  'Timestamp when pregnancy screening tasks were generated.';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if new event types were added
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'event_type'::regtype 
  AND enumlabel LIKE 'pregnancy_%'
ORDER BY enumlabel;

-- Check if new columns were added to breeding_records
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'breeding_records'
  AND column_name IN ('is_last_mating', 'pregnancy_screening_tasks_generated', 'pregnancy_screening_tasks_generated_at');

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'breeding_records'
  AND indexname LIKE '%last_mating%' OR indexname LIKE '%tasks_generated%';

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- To rollback this migration (use with caution):
/*
ALTER TABLE breeding_records 
  DROP COLUMN IF EXISTS is_last_mating,
  DROP COLUMN IF EXISTS pregnancy_screening_tasks_generated,
  DROP COLUMN IF EXISTS pregnancy_screening_tasks_generated_at;

DROP INDEX IF EXISTS idx_breeding_records_last_mating;
DROP INDEX IF EXISTS idx_breeding_records_tasks_generated;

-- Note: Cannot easily remove enum values in PostgreSQL
-- Would need to recreate the enum type without the new values
*/
