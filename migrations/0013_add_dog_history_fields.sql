-- Migration: Add new fields to Step 5 (Dog History) in matings table
-- These fields are stored in the calculationData JSONB column

-- No schema changes needed - all new fields are stored in the existing calculationData JSONB column
-- This migration file documents the new fields added to Step 5:

-- New fields in calculationData.dogHistory:
-- - littersSired: '0' | '1-2' | '3-5' | '5+' (number of litters the dog has sired)
-- - fathersLittersSired: '1-3' | '4-10' | '11+' (number of litters the dog's father has sired)
-- - recentLitterDate: 'less_than_1_month' | '1-6_months' | '6-18_months' | 'more_than_18_months' (time since most recent litter)
-- - pupsInMostRecentSire: '0' | '1-3' | '4-6' | '7+' (number of puppies in most recent litter)

-- Note: If recentLitterDate is 'more_than_18_months', system flags potential low sperm count
-- and recommends upgrading mating method and conducting semen analysis

-- No SQL changes required - JSONB is schema-less
SELECT 'Migration 0013: Dog History fields documented' AS status;
