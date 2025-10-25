# ✅ Photo Storage Architecture - Fixed

## **The Correct Architecture**

All photos are stored in the **`animal_photos` table** with categories, NOT in `animals.profileImageUrl`.

---

## **Database Structure**

### **animals table**
```typescript
{
  id: uuid,
  name: string,
  breed: string,
  // ... other fields
  // ❌ profileImageUrl is DEPRECATED - don't use
}
```

### **animal_photos table** ✅
```typescript
{
  id: uuid,
  animalId: uuid,
  category: 'profile' | 'gallery' | 'shelter' | 'training' | ...,
  fileUrl: string,
  fileName: string,
  displayOrder: number,
  isPrimary: boolean,
  // ... other fields
}
```

---

## **Photo Categories**

```typescript
📸 profile          - Main profile picture (1 max)
🖼️ gallery          - General animal photos (20 max)
🏠 shelter          - Living quarters
🐾 whelping_areas   - Maternity areas
💉 vaccinations     - Vaccination records
📜 pedigree         - Pedigree certificates
📋 council_registration - Registration papers
👨‍👩‍👦 parents         - Sire and dam photos
🍼 baby_photos      - Puppy development
🎓 training         - Training sessions
🏆 shows            - Competition photos
⚕️ health           - Health documents
```

---

## **How It Works Now**

### **1. Add Animal Dialog** ✅

```typescript
// User uploads photo
<ImageUpload
  onUploadSuccess={(result) => {
    setFormData({ profilePhotoUrl: result.url });
  }}
/>

// On submit:
1. Create animal (without profileImageUrl)
2. Save photo to animal_photos table with category='profile'
```

**Code:**
```typescript
const createdAnimal = await createAnimalMutation.mutateAsync(animalData);

// Save profile photo to animal_photos table
if (formData.profilePhotoUrl && createdAnimal?.id) {
  await fetch(`/api/animals/${createdAnimal.id}/photos`, {
    method: 'POST',
    body: JSON.stringify({
      category: 'profile',
      fileUrl: formData.profilePhotoUrl,
      fileName: 'profile-photo.jpg',
    }),
  });
}
```

---

### **2. Edit Animal Dialog** ✅

```typescript
// User changes photo
<ImageUpload
  currentImageUrl={formData.profilePhotoUrl}
  onUploadSuccess={(result) => {
    setFormData({ profilePhotoUrl: result.url });
  }}
/>

// On submit:
1. Update animal data
2. Delete old profile photo from animal_photos
3. Save new photo to animal_photos with category='profile'
```

**Code:**
```typescript
await updateAnimalMutation.mutateAsync({ id, data });

// Update profile photo in animal_photos table
if (formData.profilePhotoUrl && formData.profilePhotoUrl !== animalData.imageUrl) {
  // Delete old profile photo
  const existingPhotos = await fetch(`/api/animals/${animalId}/photos?category=profile`);
  if (existingPhotos.length > 0) {
    await fetch(`/api/animals/${animalId}/photos/${existingPhotos[0].id}`, {
      method: 'DELETE',
    });
  }

  // Add new profile photo
  await fetch(`/api/animals/${animalId}/photos`, {
    method: 'POST',
    body: JSON.stringify({
      category: 'profile',
      fileUrl: formData.profilePhotoUrl,
    }),
  });
}
```

---

### **3. Photos & Docs Tab** ✅

```typescript
// User uploads photos with category selection
<MultipleImageUpload
  onUploadSuccess={(results) => {
    // Saves to animal_photos table with selected category
    await fetch(`/api/animals/${animalId}/photos`, {
      method: 'POST',
      body: JSON.stringify({
        category: selectedCategory, // 'profile', 'gallery', etc.
        fileUrl: result.url,
      }),
    });
  }}
/>
```

---

### **4. Animal Profile Page** ✅

```typescript
// Fetch profile photo from animal_photos table
const profilePhoto = animal.photos?.find(p => p.category === 'profile');
const primaryPhoto = profilePhoto?.fileUrl || fallback;

// Get other photos (excluding profile)
const additionalPhotos = animal.photos
  ?.filter(p => p.category !== 'profile')
  .slice(0, 4);

// Build complete photo array
const allPhotos = [
  profilePhoto?.fileUrl,
  ...animal.photos.filter(p => p.category !== 'profile').map(p => p.fileUrl)
].filter(url => url);
```

---

## **API Endpoints**

### **POST /api/animals/[id]/photos**
```typescript
// Save photo to animal_photos table
{
  category: 'profile' | 'gallery' | ...,
  fileUrl: string,
  fileName: string,
  fileSize?: number,
  caption?: string
}
```

### **GET /api/animals/[id]/photos**
```typescript
// Fetch all photos, optionally filtered by category
GET /api/animals/123/photos?category=profile

Response: {
  photos: [
    {
      id: 'uuid',
      category: 'profile',
      fileUrl: 'https://...',
      isPrimary: true,
      ...
    }
  ]
}
```

### **DELETE /api/animals/[id]/photos/[photoId]**
```typescript
// Delete photo from animal_photos table
DELETE /api/animals/123/photos/456
```

---

## **Benefits of This Architecture**

✅ **Organized** - All photos in one table with categories  
✅ **Flexible** - Easy to add/remove/reorder photos  
✅ **Scalable** - Can have multiple photos per category  
✅ **Consistent** - Same storage mechanism everywhere  
✅ **Queryable** - Can filter by category, order, etc.  

---

## **Migration Notes**

If you have existing animals with `profileImageUrl` set:

```sql
-- Migrate existing profile images to animal_photos table
INSERT INTO animal_photos (id, animal_id, category, file_url, is_primary)
SELECT 
  gen_random_uuid(),
  id,
  'profile',
  profile_image_url,
  true
FROM animals
WHERE profile_image_url IS NOT NULL;

-- Optional: Clear old field
UPDATE animals SET profile_image_url = NULL;
```

---

## **Files Modified**

1. ✅ `components/breeder/animals/AddAnimalDialog.tsx`
   - Saves profile photo to animal_photos table after creation

2. ✅ `components/breeder/animals/EditAnimalDialog.tsx`
   - Updates profile photo in animal_photos table

3. ✅ `app/(breeder)/animals/[id]/page.tsx`
   - Fetches profile photo from animal_photos with category='profile'

4. ✅ `components/breeder/animals/PhotosDocsTab.tsx`
   - Already saves to animal_photos table with categories

5. ✅ `app/api/animals/[id]/photos/route.ts`
   - Fixed UUID generation issue

---

## **Summary**

**Before:** ❌
- Profile photo in `animals.profileImageUrl`
- Other photos in `animal_photos` table
- Inconsistent storage

**After:** ✅
- ALL photos in `animal_photos` table
- Organized by category
- Profile photo has `category='profile'`
- Consistent storage everywhere

---

*Last Updated: Current Session*
*System: Animalytics Photo Storage Architecture*
