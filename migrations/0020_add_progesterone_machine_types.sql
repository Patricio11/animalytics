-- Migration: Add new progesterone machine types
-- This migration expands the laboratory enum to support multiple progesterone testing machines

-- Drop the existing enum constraint and recreate with new values
ALTER TYPE laboratory DROP CONSTRAINT IF EXISTS laboratory_check;

-- Recreate the laboratory enum with all machine types
-- Note: In PostgreSQL, we need to add new enum values one by one
ALTER TYPE laboratory ADD VALUE IF NOT EXISTS 'IDEXX_LAB';
ALTER TYPE laboratory ADD VALUE IF NOT EXISTS 'IMMULITE';
ALTER TYPE laboratory ADD VALUE IF NOT EXISTS 'CHEMILUMINESCENCE';
ALTER TYPE laboratory ADD VALUE IF NOT EXISTS 'RIA';
ALTER TYPE laboratory ADD VALUE IF NOT EXISTS 'OTHER';

-- Add comment to document the enum values
COMMENT ON TYPE laboratory IS 'Progesterone testing machine types: VIDAS (Mini VIDAS - reference), IDEXX (Catalyst), IDEXX_LAB (Reference Lab), IMMULITE (Siemens), CHEMILUMINESCENCE, RIA, OTHER';
