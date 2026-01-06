-- Migration: Rename buyer to pet_owner
-- This script renames all buyer-related columns and tables to pet_owner
-- Run this manually: psql animalytics < migrations/manual/rename_buyer_to_pet_owner.sql

BEGIN;

-- 1. Rename buyer_profiles table to pet_owner_profiles
ALTER TABLE IF EXISTS buyer_profiles RENAME TO pet_owner_profiles;

-- 2. Update conversations table - rename buyer_id to pet_owner_id
ALTER TABLE IF EXISTS conversations 
  RENAME COLUMN buyer_id TO pet_owner_id;

-- 3. Update conversations table - rename unread counts
ALTER TABLE IF EXISTS conversations 
  RENAME COLUMN unread_count_buyer TO unread_count_pet_owner;

-- 4. Update purchases table - rename buyer_id to pet_owner_id
ALTER TABLE IF EXISTS purchases 
  RENAME COLUMN buyer_id TO pet_owner_id;

-- 5. Update purchases table - rename buyer notes
ALTER TABLE IF EXISTS purchases 
  RENAME COLUMN buyer_notes TO pet_owner_notes;

-- 6. Update purchases table - rename buyer confirmed receipt
ALTER TABLE IF EXISTS purchases 
  RENAME COLUMN buyer_confirmed_receipt TO pet_owner_confirmed_receipt;

-- 7. Update purchase_timeline table - rename visible_to_buyer
ALTER TABLE IF EXISTS purchase_timeline 
  RENAME COLUMN visible_to_buyer TO visible_to_pet_owner;

-- 8. Update wallet_transactions table - rename buyer_id to pet_owner_id
ALTER TABLE IF EXISTS wallet_transactions 
  RENAME COLUMN buyer_id TO pet_owner_id;

-- 9. Update user_role enum - add pet_owner if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'pet_owner' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'pet_owner';
  END IF;
END$$;

-- 10. Update existing users with role 'buyer' to 'pet_owner'
UPDATE users 
SET role = 'pet_owner' 
WHERE role = 'buyer';

-- 11. Remove 'buyer' from enum (optional - only if no data depends on it)
-- Note: PostgreSQL doesn't support removing enum values directly
-- If needed, you would need to:
-- 1. Create new enum without 'buyer'
-- 2. Alter columns to use new enum
-- 3. Drop old enum
-- For now, we'll leave 'buyer' in the enum for backward compatibility

COMMIT;

-- Verification queries
SELECT 'Checking pet_owner_profiles table...' as status;
SELECT COUNT(*) as pet_owner_profiles_count FROM pet_owner_profiles;

SELECT 'Checking conversations columns...' as status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND column_name LIKE '%pet_owner%';

SELECT 'Checking purchases columns...' as status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'purchases' 
AND column_name LIKE '%pet_owner%';

SELECT 'Checking user roles...' as status;
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

SELECT 'Migration complete!' as status;
