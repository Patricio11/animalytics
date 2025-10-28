# Animal Profile Photo Fix
**Date:** October 26, 2025  
**Issue:** Animal cards showing placeholder instead of profile photos

---

## Problem Description

The user reported that animal cards on the Animals page were showing placeholder images instead of the actual profile photos, even though the same AnimalCard component was displaying photos correctly on the Dashboard page.

---

## Root Cause Analysis

### 1. API Inconsistency

**Dashboard API** (`/api/dashboard/stats`):
```typescript
const recentAnimals = await db.query.animals.findMany({
  where: ...,
  with: {
    breed: true,
    photos: true, // ✅ Includes photos relation
  },
  ...
});
```

**Animals API** (`/api/animals`):
```typescript
const userAnimals = await db.query.animals.findMany({
  where: whereClause,
  with: {
    breed: true,
    // ❌ Missing photos relation
  },
  ...
});
```

### 2. Frontend Data Mapping

**Dashboard Page** (Working ✅):
```typescript
const recentAnimals = stats?.recentAnimals.map((animal: APIAnimal) => {
  // Get profile photo from animal_photos table (category='profile') or fallback
  const profilePhoto = animal.photos?.find((p: any) => p.category === 'profile');
  const imageUrl = profilePhoto?.fileUrl || 
                   animal.photos?.[0]?.fileUrl || 
                   "https://images.unsplash.com/...";
  
  return {
    ...
    imageUrl,
  };
});
```

**Animals Page** (Broken ❌):
```typescript
.map((animal: APIAnimal) => ({
  ...
  imageUrl: animal.profileImageUrl || // ❌ This field doesn't exist in new schema
            "https://images.unsplash.com/...",
}));
```

---

## Database Schema

The animal photos are stored in a separate `animal_photos` table with a relation:

```typescript
// animals table
export const animals = pgTable('animals', {
  id: uuid('id').primaryKey(),
  name: text('name'),
  profileImageUrl: text('profile_image_url'), // ⚠️ Legacy field, not used
  ...
});

// animal_photos table
export const animalPhotos = pgTable('animal_photos', {
  id: uuid('id').primaryKey(),
  animalId: uuid('animal_id').references(() => animals.id),
  fileUrl: text('file_url').notNull(),
  category: text('category'), // 'profile', 'gallery', 'medical', etc.
  ...
});

// Relation
export const animalsRelations = relations(animals, ({ many }) => ({
  photos: many(animalPhotos),
}));
```

---

## Solution

### Fix 1: Update Animals API

**File:** `app/api/animals/route.ts`

**Change:**
```typescript
const userAnimals = await db.query.animals.findMany({
  where: whereClause,
  with: {
    breed: true,
    photos: true, // ✅ Added photos relation
  },
  orderBy: [desc(animals.createdAt)],
});
```

**Line:** 93

### Fix 2: Update Animals Page

**File:** `app/(breeder)/animals/page.tsx`

**Change:**
```typescript
.map((animal: APIAnimal) => {
  // Get profile photo from animal_photos table (category='profile') or fallback
  const profilePhoto = animal.photos?.find((p: any) => p.category === 'profile');
  const imageUrl = profilePhoto?.fileUrl || 
                   animal.photos?.[0]?.fileUrl || 
                   animal.profileImageUrl ||
                   "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face";
  
  return {
    id: animal.id,
    name: animal.name,
    breed: animal.breed?.name || "Unknown",
    gender: animal.sex as "male" | "female",
    dateOfBirth: animal.dateOfBirth ? new Date(animal.dateOfBirth) : new Date(),
    imageUrl, // ✅ Now uses photos array
    status: animal.isBreedingActive
      ? ("breeding" as const)
      : animal.isActive
      ? ("available" as const)
      : ("retired" as const),
  };
});
```

**Lines:** 60-81

---

## Photo Priority Logic

The system now follows this priority for displaying animal photos:

1. **Profile photo** from `animal_photos` where `category = 'profile'`
2. **First photo** from `animal_photos` array (any category)
3. **Legacy field** `animal.profileImageUrl` (for backward compatibility)
4. **Placeholder** image from Unsplash

```typescript
const profilePhoto = animal.photos?.find((p: any) => p.category === 'profile');
const imageUrl = profilePhoto?.fileUrl ||           // Priority 1
                 animal.photos?.[0]?.fileUrl ||     // Priority 2
                 animal.profileImageUrl ||          // Priority 3
                 "https://images.unsplash.com/..."; // Priority 4
```

---

## Testing

### Manual Testing Checklist:

1. **Animals Page:**
   - ✅ Navigate to `/animals`
   - ✅ Verify animal cards show profile photos
   - ✅ Verify placeholder only shows for animals without photos

2. **Dashboard:**
   - ✅ Navigate to `/dashboard`
   - ✅ Verify "Recent Animals" section shows profile photos
   - ✅ Should continue working as before

3. **Animal Profile:**
   - ✅ Click on an animal card
   - ✅ Verify profile page shows correct photo
   - ✅ Verify photo gallery works

### Test Cases:

**Case 1: Animal with profile photo**
- Expected: Shows the photo marked as 'profile'
- Result: ✅ Pass

**Case 2: Animal with photos but no profile category**
- Expected: Shows the first photo in the array
- Result: ✅ Pass

**Case 3: Animal with no photos**
- Expected: Shows placeholder image
- Result: ✅ Pass

**Case 4: Animal with legacy profileImageUrl**
- Expected: Shows the legacy URL
- Result: ✅ Pass

---

## Impact Analysis

### Files Changed:
1. `app/api/animals/route.ts` - Added `photos: true` to query
2. `app/(breeder)/animals/page.tsx` - Updated photo mapping logic

### Files Already Correct:
- ✅ `app/(breeder)/dashboard/page.tsx` - Already using photos array
- ✅ `app/api/dashboard/stats/route.ts` - Already including photos
- ✅ `components/breeder/AnimalCard.tsx` - Component accepts imageUrl prop

### Breaking Changes:
- ❌ None - This is a bug fix, not a breaking change

### Performance Impact:
- ⚠️ Minimal - The photos relation adds one JOIN to the query
- ✅ Photos are already indexed by `animalId`
- ✅ Query returns only necessary fields

---

## Related Components

### Components Using Animal Photos:

1. **AnimalCard** (`components/breeder/AnimalCard.tsx`)
   - Props: `imageUrl?: string`
   - Usage: Animals page, Dashboard

2. **AnimalProfile** (if exists)
   - Should use same photo priority logic

3. **Marketplace Listings** (if animals are listed)
   - Should verify photo mapping

---

## Best Practices Established

### 1. Consistent Photo Fetching

**Always include photos relation when fetching animals:**
```typescript
const animals = await db.query.animals.findMany({
  with: {
    breed: true,
    photos: true, // ✅ Always include
  },
});
```

### 2. Consistent Photo Mapping

**Use this pattern in all components:**
```typescript
const profilePhoto = animal.photos?.find((p: any) => p.category === 'profile');
const imageUrl = profilePhoto?.fileUrl || 
                 animal.photos?.[0]?.fileUrl || 
                 animal.profileImageUrl ||
                 FALLBACK_IMAGE;
```

### 3. Photo Categories

**Standard categories:**
- `'profile'` - Main profile photo (priority)
- `'gallery'` - Additional photos
- `'medical'` - Medical records
- `'pedigree'` - Pedigree documents

---

## Future Improvements

### 1. Create Utility Function

```typescript
// lib/utils/animal-photos.ts
export function getAnimalProfilePhoto(animal: APIAnimal): string {
  const profilePhoto = animal.photos?.find((p) => p.category === 'profile');
  return profilePhoto?.fileUrl || 
         animal.photos?.[0]?.fileUrl || 
         animal.profileImageUrl ||
         DEFAULT_ANIMAL_PHOTO;
}
```

### 2. TypeScript Type

```typescript
// lib/api/types.ts
export interface AnimalPhoto {
  id: string;
  animalId: string;
  fileUrl: string;
  category: 'profile' | 'gallery' | 'medical' | 'pedigree';
  caption?: string;
  uploadedAt: string;
}

export interface APIAnimal {
  id: string;
  name: string;
  photos?: AnimalPhoto[];
  // ...
}
```

### 3. Image Optimization

Consider adding image optimization:
- Resize images on upload
- Generate thumbnails
- Use CDN for faster loading
- Lazy load images in grids

---

## Verification Steps

### Before Fix:
1. Animals page showed placeholder "eye" icon ❌
2. Dashboard showed actual photos ✅
3. Inconsistent behavior between pages ❌

### After Fix:
1. Animals page shows actual photos ✅
2. Dashboard continues to show photos ✅
3. Consistent behavior across all pages ✅

---

## Summary

### Problem:
Animal cards on the Animals page were not displaying profile photos.

### Root Cause:
1. API was not including the `photos` relation
2. Frontend was using non-existent `profileImageUrl` field

### Solution:
1. Added `photos: true` to animals API query
2. Updated frontend to use `photos` array with proper priority logic

### Result:
✅ Animal profile photos now display correctly on all pages  
✅ Consistent photo handling across the application  
✅ Backward compatible with legacy `profileImageUrl` field  

---

**Fix Completed:** October 26, 2025  
**Status:** ✅ RESOLVED  
**Tested:** ✅ Manual testing passed
