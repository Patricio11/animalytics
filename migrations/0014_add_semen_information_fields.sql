-- Migration: Add new fields to Step 7 (Semen Information) in matings table
-- These fields are stored in the calculationData JSONB column

-- No schema changes needed - all new fields are stored in the existing calculationData JSONB column
-- This migration file documents the new fields added to Step 7:

-- New fields in calculationData.semenInformation:
-- - timeBetweenCollectionAndInsemination: 'less_than_24hrs' | '24-48hrs' | 'more_than_48hrs' (chilled semen only)
-- - ageOfDogAtCollection: number (age in years at time of collection)
-- - batchUsedPreviously: 'yes' | 'no' | 'dont_know' (has the batch been used before)
-- - didProducePups: 'yes' | 'no' | 'dont_know' (if batch was used, did it produce pups)
-- - pupsProduced: '1-3' | '4-6' | '7+' (number of pups produced from previous use)

-- Age at collection rating system (from HTML comments):
-- - Less than 12 months: Rate 1 (poor)
-- - 1-3 years: Rate 3 (excellent)
-- - 3-5 years: Rate 2 (good)
-- - 5+ years: Rate 1 (fair)

-- No SQL changes required - JSONB is schema-less
SELECT 'Migration 0014: Semen Information fields documented' AS status;
