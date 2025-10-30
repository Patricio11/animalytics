-- Migration: Add breeder and owner fields to animals table
-- Date: 2025-10-30
-- Description: Adds breeder and owner tracking fields
-- Note: Parent information uses existing manualPedigreeEntries table

-- Add breeder information fields
ALTER TABLE animals ADD COLUMN breeder_id TEXT REFERENCES users(id);
ALTER TABLE animals ADD COLUMN breeder_name TEXT;
ALTER TABLE animals ADD COLUMN breeder_registration_number TEXT;

-- Add owner information fields
ALTER TABLE animals ADD COLUMN owner_id TEXT REFERENCES users(id);
ALTER TABLE animals ADD COLUMN owner_name TEXT;
ALTER TABLE animals ADD COLUMN owner_registration_number TEXT;

-- Add comments for documentation
COMMENT ON COLUMN animals.breeder_id IS 'User ID of breeder if in system (never changes)';
COMMENT ON COLUMN animals.breeder_name IS 'Breeder name if external/manual entry';
COMMENT ON COLUMN animals.breeder_registration_number IS 'Kennel club breeder registration number';

COMMENT ON COLUMN animals.owner_id IS 'Current owner user ID if in system (can change when sold)';
COMMENT ON COLUMN animals.owner_name IS 'Owner name if external/manual entry';
COMMENT ON COLUMN animals.owner_registration_number IS 'Owner registration number';

-- Create index for faster lookups by breeder and owner
CREATE INDEX idx_animals_breeder_id ON animals(breeder_id);
CREATE INDEX idx_animals_owner_id ON animals(owner_id);
