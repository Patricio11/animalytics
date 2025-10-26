-- Migration: Add new fields to Step 2 (Bitch Information) in matings table
-- These fields are stored in the calculationData JSONB column

-- No schema changes needed - all new fields are stored in the existing calculationData JSONB column
-- This migration file documents the new fields added to Step 2:

-- New fields in calculationData.bitchInformation:
-- - livingCondition: 'kennels' | 'pack' | 'on_her_own'
-- - positionInPack: 'dominant' | 'doesnt_care' | 'bottom' | 'dont_know'
-- - ageAtMating: number (age in years at time of mating)
-- - runsWithOthers: 'yes' | 'no' | 'dont_know'
-- - runsWithHowMany: number (number of other dogs)
-- - ranWithOthersDuringPreviousPregnancies: 'yes' | 'no' | 'dont_know'

-- No SQL changes required - JSONB is schema-less
SELECT 'Migration 0011: Bitch Information fields documented' AS status;
