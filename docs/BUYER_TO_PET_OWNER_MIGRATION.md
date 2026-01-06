# Buyer to Pet Owner Migration Guide

## Overview
Complete migration from "buyer" terminology to "pet_owner" throughout the Animalytics application.

## Status: IN PROGRESS

## Completed Changes

### 1. Database Schema ✅
- **Created**: `pet-owner-profiles.ts` (replacing `buyer-profiles.ts`)
- **Updated**: `users.ts` - Role enum: `'buyer'` → `'pet_owner'`
- **Updated**: `purchases.ts` - All buyer fields → petOwner fields
  - `buyerId` → `petOwnerId`
  - `buyerConfirmedReceipt` → `petOwnerConfirmedReceipt`
  - `buyerReviewId` → `petOwnerReviewId`
  - `buyerNotes` → `petOwnerNotes`
  - `visibleToBuyer` → `visibleToPetOwner`
  - `accessibleToBuyer` → `accessibleToPetOwner`
- **Updated**: `wallet.ts` - `buyerId` → `petOwnerId`
- **Updated**: `conversations.ts` - All buyer fields → petOwner fields
  - `buyerId` → `petOwnerId`
  - `unreadCountBuyer` → `unreadCountPetOwner`
  - `archivedByBuyer` → `archivedByPetOwner`
  - `blockedByBuyer` → `blockedByPetOwner`
- **Updated**: `animals.ts` - Sale info fields
  - `buyerName` → `petOwnerName`
  - `buyerEmail` → `petOwnerEmail`
  - `buyerPhone` → `petOwnerPhone`
- **Updated**: `index.ts` - Export path updated

### 2. API Routes ✅
- **Created**: `/api/pet-owner/profile/route.ts`
- **Created**: `/api/pet-owner/stats/route.ts`
- **Updated**: `/api/purchases/route.ts` (partial)

## Remaining Changes

### 3. API Routes (In Progress)
Files requiring updates:
- `/api/purchases/[id]/route.ts` (33 matches)
- `/api/conversations/[id]/route.ts` (28 matches)
- `/api/conversations/route.ts` (21 matches)
- `/api/purchases/[id]/pay/route.ts` (19 matches)
- `/api/purchases/[id]/confirm-receipt/route.ts` (17 matches)
- `/api/auth/save-signup-preferences/route.ts` (16 matches)
- `/api/auth/initialize-oauth-user/route.ts` (13 matches)
- `/api/conversations/[id]/messages/route.ts` (13 matches)
- `/api/webhooks/stripe/route.ts` (12 matches)
- `/api/escrow/[id]/route.ts` (10 matches)
- `/api/purchases/[id]/create-checkout/route.ts` (10 matches)
- `/api/purchases/[id]/documents/route.ts` (9 matches)
- `/api/purchases/[id]/timeline/route.ts` (7 matches)
- `/api/purchases/[id]/confirm-handover/route.ts` (4 matches)
- `/api/conversations/[id]/read/route.ts` (4 matches)
- `/api/escrow/route.ts` (4 matches)
- `/api/admin/dashboard/route.ts` (2 matches)
- `/api/conversations/events/route.ts` (1 match)
- `/api/conversations/unread/route.ts` (1 match)
- `/api/animals/[id]/litters/[litterId]/puppies/route.ts` (6 matches)
- `/api/animals/[id]/litters/[litterId]/puppies/[puppyId]/route.ts` (3 matches)

### 4. Frontend Pages
Directory structure:
- **Rename**: `/app/buyer/` → `/app/pet-owner/`
  - `dashboard/page.tsx` (14 matches)
  - `layout.tsx` (9 matches)
  - `profile/page.tsx` (6 matches)
  - `purchases/[id]/page.tsx` (5 matches)
  - `purchases/page.tsx` (3 matches)
  - `messages/[id]/page.tsx` (4 matches)
  - `messages/page.tsx` (2 matches)
  - `saved/page.tsx` (1 match)

### 5. Other Frontend Files
- `/app/(breeder)/purchases/[id]/page.tsx` (7 matches)
- `/app/(breeder)/settings/delivery/page.tsx` (6 matches)
- `/app/marketplace/[id]/page.tsx` (5 matches)
- `/app/(breeder)/messages/[id]/page.tsx` (4 matches)
- `/app/(breeder)/messages/page.tsx` (4 matches)
- `/app/admin/dashboard/page.tsx` (4 matches)
- `/app/admin/users/page.tsx` (4 matches)
- `/app/auth/signin/page.tsx` (4 matches)
- `/app/auth/signup/page.tsx` (5 matches)
- `/app/(breeder)/sales/page.tsx` (3 matches)
- `/app/(breeder)/profile/breeder/page.tsx` (2 matches)
- `/app/(breeder)/saved/page.tsx` (1 match)
- `/app/breeders/page.tsx` (1 match)

## Database Migration Required

### SQL Migration Script
```sql
-- Step 1: Rename enum value
ALTER TYPE user_role RENAME VALUE 'buyer' TO 'pet_owner';

-- Step 2: Rename table
ALTER TABLE buyer_profiles RENAME TO pet_owner_profiles;

-- Step 3: Rename columns in purchases table
ALTER TABLE purchases RENAME COLUMN buyer_id TO pet_owner_id;
ALTER TABLE purchases RENAME COLUMN buyer_confirmed_receipt TO pet_owner_confirmed_receipt;
ALTER TABLE purchases RENAME COLUMN buyer_confirmed_at TO pet_owner_confirmed_at;
ALTER TABLE purchases RENAME COLUMN buyer_review_id TO pet_owner_review_id;
ALTER TABLE purchases RENAME COLUMN buyer_review_submitted TO pet_owner_review_submitted;
ALTER TABLE purchases RENAME COLUMN buyer_notes TO pet_owner_notes;

-- Step 4: Rename columns in purchase_timeline table
ALTER TABLE purchase_timeline RENAME COLUMN visible_to_buyer TO visible_to_pet_owner;

-- Step 5: Rename columns in purchase_documents table
ALTER TABLE purchase_documents RENAME COLUMN accessible_to_buyer TO accessible_to_pet_owner;

-- Step 6: Rename columns in escrows table
ALTER TABLE escrows RENAME COLUMN buyer_id TO pet_owner_id;

-- Step 7: Rename columns in conversations table
ALTER TABLE conversations RENAME COLUMN buyer_id TO pet_owner_id;
ALTER TABLE conversations RENAME COLUMN unread_count_buyer TO unread_count_pet_owner;
ALTER TABLE conversations RENAME COLUMN archived_by_buyer TO archived_by_pet_owner;
ALTER TABLE conversations RENAME COLUMN archived_by_buyer_at TO archived_by_pet_owner_at;
ALTER TABLE conversations RENAME COLUMN blocked_by_buyer TO blocked_by_pet_owner;

-- Step 8: Rename columns in animals table
ALTER TABLE animals RENAME COLUMN buyer_name TO pet_owner_name;
ALTER TABLE animals RENAME COLUMN buyer_email TO pet_owner_email;
ALTER TABLE animals RENAME COLUMN buyer_phone TO pet_owner_phone;

-- Step 9: Update any stored text values that reference 'buyer'
UPDATE purchase_timeline SET actor_role = 'pet_owner' WHERE actor_role = 'buyer';
UPDATE purchase_documents SET uploader_role = 'pet_owner' WHERE uploader_role = 'buyer';
UPDATE conversation_participants SET role = 'pet_owner' WHERE role = 'buyer';
UPDATE purchases SET cancelled_by = 'pet_owner' WHERE cancelled_by = 'buyer';
```

## Testing Checklist
- [ ] User registration with pet_owner role
- [ ] Pet owner profile creation/update
- [ ] Purchase flow as pet owner
- [ ] Conversations between pet owner and seller
- [ ] Pet owner dashboard and statistics
- [ ] Payment processing
- [ ] Purchase confirmation and receipt
- [ ] Reviews and ratings
- [ ] Admin user management

## Notes
- Old `/api/buyer/*` routes can be kept temporarily for backward compatibility
- Frontend routes will need updating in navigation components
- Update any hardcoded strings in UI components
- Check email templates for "buyer" references
- Update notification messages
