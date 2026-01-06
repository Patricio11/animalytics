-- Migration: Rename 'buyer' to 'pet_owner' throughout the database
-- Created: 2026-01-06
-- Description: Complete migration from buyer terminology to pet_owner

BEGIN;

-- Step 1: Update enum value (PostgreSQL doesn't support direct rename, so we need to recreate)
-- First, add the new value
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'pet_owner';

-- Update all existing 'buyer' roles to 'pet_owner'
UPDATE users SET role = 'pet_owner' WHERE role = 'buyer';

-- Note: We cannot remove the old 'buyer' value from enum without recreating it
-- This is safe for backward compatibility during migration

-- Step 2: Rename table
ALTER TABLE IF EXISTS buyer_profiles RENAME TO pet_owner_profiles;

-- Step 3: Rename columns in purchases table
ALTER TABLE purchases RENAME COLUMN buyer_id TO pet_owner_id;
ALTER TABLE purchases RENAME COLUMN buyer_confirmed_receipt TO pet_owner_confirmed_receipt;
ALTER TABLE purchases RENAME COLUMN buyer_confirmed_at TO pet_owner_confirmed_at;
ALTER TABLE purchases RENAME COLUMN buyer_review_id TO pet_owner_review_id;
ALTER TABLE purchases RENAME COLUMN buyer_review_submitted TO pet_owner_review_submitted;
ALTER TABLE purchases RENAME COLUMN buyer_notes TO pet_owner_notes;

-- Step 4: Rename columns in purchase_timeline table
ALTER TABLE purchase_timeline RENAME COLUMN visible_to_buyer TO visible_to_pet_owner;

-- Update text values in purchase_timeline
UPDATE purchase_timeline SET actor_role = 'pet_owner' WHERE actor_role = 'buyer';

-- Step 5: Rename columns in purchase_documents table
ALTER TABLE purchase_documents RENAME COLUMN accessible_to_buyer TO accessible_to_pet_owner;

-- Update text values in purchase_documents
UPDATE purchase_documents SET uploader_role = 'pet_owner' WHERE uploader_role = 'buyer';

-- Step 6: Rename columns in escrows table
ALTER TABLE escrows RENAME COLUMN buyer_id TO pet_owner_id;

-- Step 7: Rename columns in conversations table
ALTER TABLE conversations RENAME COLUMN buyer_id TO pet_owner_id;
ALTER TABLE conversations RENAME COLUMN unread_count_buyer TO unread_count_pet_owner;
ALTER TABLE conversations RENAME COLUMN archived_by_buyer TO archived_by_pet_owner;
ALTER TABLE conversations RENAME COLUMN archived_by_buyer_at TO archived_by_pet_owner_at;
ALTER TABLE conversations RENAME COLUMN blocked_by_buyer TO blocked_by_pet_owner;

-- Step 8: Update conversation_participants role values
UPDATE conversation_participants SET role = 'pet_owner' WHERE role = 'buyer';

-- Step 9: Rename columns in animals table
ALTER TABLE animals RENAME COLUMN buyer_name TO pet_owner_name;
ALTER TABLE animals RENAME COLUMN buyer_email TO pet_owner_email;
ALTER TABLE animals RENAME COLUMN buyer_phone TO pet_owner_phone;

-- Step 10: Update any text references in purchases
UPDATE purchases SET cancelled_by = 'pet_owner' WHERE cancelled_by = 'buyer';

-- Step 11: Update purchase status enum comment
COMMENT ON TYPE purchase_status IS 'Purchase workflow statuses from initiation to completion';

COMMIT;

-- Verification queries (run these after migration to verify)
-- SELECT role, COUNT(*) FROM users GROUP BY role;
-- SELECT table_name, column_name FROM information_schema.columns WHERE column_name LIKE '%buyer%';
-- SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%buyer%';
