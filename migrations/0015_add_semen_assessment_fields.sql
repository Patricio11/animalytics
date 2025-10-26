-- Migration: Add new fields to Step 8 (Semen Assessment) in matings table
-- These fields are stored in the calculationData JSONB column

-- No schema changes needed - all new fields are stored in the existing calculationData JSONB column
-- This migration file documents the new fields added to Step 8:

-- New fields in calculationData.semenAssessment:
-- - inseminatorName: string (name of the person performing insemination)
-- - semenAssessed: 'yes' | 'no' | 'dont_know' (whether semen was assessed)

-- Updated field mappings:
-- - assessmentType now maps from UI: 'general' → 'visual', 'full' → 'full', none → 'none'
-- - visualQuality values updated to match HTML: 'excellent' | 'good' | 'poor' (removed 'fair')

-- Conditional flow (from HTML comments):
-- - If semenAssessed = 'no', skip the rest of semen assessment page
-- - If semenAssessed = 'yes', show assessment type selection
-- - If assessmentType = 'general', show simple quality dropdown
-- - If assessmentType = 'full', show detailed laboratory fields

-- No SQL changes required - JSONB is schema-less
SELECT 'Migration 0015: Semen Assessment fields documented' AS status;
