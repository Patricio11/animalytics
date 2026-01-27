-- Migration: Add normalized progesterone level field
-- This migration adds a field to store VIDAS-equivalent normalized progesterone values

-- Add normalized_progesterone_level column to heat_cycle_progesterone_readings
ALTER TABLE heat_cycle_progesterone_readings 
ADD COLUMN IF NOT EXISTS normalized_progesterone_level TEXT;

-- Add comment to document the field
COMMENT ON COLUMN heat_cycle_progesterone_readings.normalized_progesterone_level IS 'Progesterone level normalized to VIDAS standard (ng/mL) for consistent phase detection and charting across different testing machines';

-- For existing records, set normalized value equal to raw value (assuming VIDAS)
-- This ensures backwards compatibility
UPDATE heat_cycle_progesterone_readings 
SET normalized_progesterone_level = progesterone_level 
WHERE normalized_progesterone_level IS NULL;
