-- Migration: Add new fields to Step 3 (Bitch History) in matings table
-- These fields are stored in the calculationData JSONB column

-- No schema changes needed - all new fields are stored in the existing calculationData JSONB column
-- This migration file documents the new fields added to Step 3:

-- New fields in calculationData.bitchHistory:
-- - previousPregnancies: 'yes' | 'no' | 'dont_know'
-- - numberOfSiblings: '0' | '1-3' | '4-5' | '6+'
-- - numberOfBreedings: number (total number of breedings)
-- - hadMatingThatDidNotProduce: 'yes' | 'no' | 'dont_know'
-- - timesDidNotProduce: '1' | '2' | '3+' (how many times mating did not produce)

-- No SQL changes required - JSONB is schema-less
SELECT 'Migration 0012: Bitch History fields documented' AS status;
