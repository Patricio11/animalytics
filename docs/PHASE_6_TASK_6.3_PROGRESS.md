# Phase 6 - Task 6.3: Integrate File Upload with Animal Profiles - IN PROGRESS 🔄

**Implementation Date:** January 2025
**Status:** 🔄 IN PROGRESS (50% Complete)

---

## Progress Summary

### ✅ Completed
1. **Database Schema Updated** - Added missing photo categories to enum
   - `whelping_areas`
   - `vaccinations`
   - `council_registration`
   - `parents`
   - Total: 11 photo categories (was 7, now 11)

2. **API Endpoints Created** - `/api/animals/[id]/photos/route.ts`
   - ✅ GET: Fetch photos (with optional category filter)
   - ✅ POST: Upload photo with category limit enforcement
   - ✅ DELETE: Remove photo by ID
   - ✅ Authentication via requireAuth()
   - ✅ Category limits: Profile (1), Others (10)
   - ✅ Auto-delete old profile photo when uploading new one

### 🔄 In Progress
3. **Component Integration** - PhotosDocsTab.tsx
   - Existing component has drag & drop UI (beautiful design ✨)
   - Needs integration with:
     - FileUpload component (or UploadThing directly)
     - Real API calls to save photos
     - Fetch and display existing photos from database
     - Delete functionality

### ⏳ Pending
4. **Photo Grid Display** - Show uploaded photos
5. **Delete Functionality** - Remove photos with confirmation
6. **Category Limit UI** - Show remaining slots per category
7. **Testing** - Full workflow testing

---

## What Was Discovered

### Existing Schema (lib/db/schema/animals.ts)
The schema was already well-designed with:

```typescript
export const animalPhotos = pgTable('animal_photos', {
  id: text('id').primaryKey(),
  animalId: text('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  category: photoCategoryEnum('category').notNull(),
  fileUrl: text('file_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  width: integer('width'),
  height: integer('height'),
  caption: text('caption'),
  displayOrder: integer('display_order').default(0),
  isPrimary: boolean('is_primary').default(false),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});
```

**Updated Photo Categories (11 total):**
```typescript
export const photoCategoryEnum = pgEnum('photo_category', [
  'profile',              // Main profile photo (1 max)
  'training',             // Training photos
  'shows',                // Show/competition photos
  'pedigree',             // Pedigree documentation
  'health',               // Health records
  'shelter',              // Shelter/living environment
  'baby_photos',          // Puppy/baby photos
  'whelping_areas',       // NEW: Whelping area photos
  'vaccinations',         // NEW: Vaccination records
  'council_registration', // NEW: Registration documents
  'parents',              // NEW: Parent animal photos
]);
```

### Existing Component (components/breeder/animals/PhotosDocsTab.tsx)
The component already has:
- ✅ Beautiful BreedBook Pro design
- ✅ Drag & drop UI with visual feedback
- ✅ File type validation (images for photos, PDF/images for documents)
- ✅ File size validation (30MB limit)
- ✅ Category selection UI
- ✅ Upload preview with file list
- ✅ Photo gallery grid display
- ✅ Image viewer modal
- ⚠️ BUT: Uses mock data, not real API calls
- ⚠️ BUT: Doesn't integrate with UploadThing

---

## API Implementation Details

### POST /api/animals/[id]/photos

**Request Body:**
```json
{
  "category": "shelter",
  "fileUrl": "https://uploadthing.com/.../image.jpg",
  "fileName": "shelter-photo.jpg",
  "fileSize": 2048576,
  "thumbnailUrl": "https://uploadthing.com/.../thumb.jpg",
  "caption": "Beautiful shelter area",
  "width": 1920,
  "height": 1080
}
```

**Category Limits:**
- `profile`: 1 photo maximum
- All others: 10 photos maximum

**Features:**
- ✅ Checks current photo count before upload
- ✅ Returns error if limit reached
- ✅ Auto-deletes old profile photo when uploading new one
- ✅ Sets `isPrimary` flag for first photo in category
- ✅ Assigns `displayOrder` based on current count

**Response (Success):**
```json
{
  "success": true,
  "photo": {
    "id": "clxxx...",
    "animalId": "animal1",
    "category": "shelter",
    "fileUrl": "https://...",
    "fileName": "shelter-photo.jpg",
    // ... other fields
  }
}
```

**Response (Limit Reached):**
```json
{
  "success": false,
  "error": "Photo limit reached for category \"shelter\". Maximum 10 photo(s) allowed."
}
```

### GET /api/animals/[id]/photos

**Query Parameters:**
- `category` (optional): Filter by specific category

**Example:**
```
GET /api/animals/animal1/photos?category=shelter
```

**Response:**
```json
{
  "success": true,
  "photos": [
    {
      "id": "photo1",
      "animalId": "animal1",
      "category": "shelter",
      "fileUrl": "https://...",
      "fileName": "photo.jpg",
      "uploadedAt": "2025-01-11T10:00:00Z",
      // ... other fields
    }
  ],
  "count": 1
}
```

### DELETE /api/animals/[id]/photos

**Query Parameters:**
- `photoId` (required): ID of photo to delete

**Example:**
```
DELETE /api/animals/animal1/photos?photoId=clxxx...
```

**Response:**
```json
{
  "success": true,
  "message": "Photo deleted successfully"
}
```

---

## Integration Plan (Next Steps)

### Step 1: Update PhotosDocsTab to Use Real API

**Current flow (mock data):**
```
User uploads → Files stored in state → Toast shown → No persistence
```

**New flow (real API):**
```
User uploads → UploadThing CDN → API saves URL → Database persists → UI updates
```

### Step 2: Integration Options

**Option A: Use FileUpload Component** (Simpler, consistent)
```typescript
import { FileUpload } from '@/components/shared/FileUpload';

<FileUpload
  category={selectedCategory}
  onUploadComplete={async (url) => {
    await fetch(`/api/animals/${animalId}/photos`, {
      method: 'POST',
      body: JSON.stringify({
        category: selectedCategory,
        fileUrl: url,
        fileName: file.name,
        fileSize: file.size,
        caption,
      }),
    });
  }}
  accept="image/*"
  maxSize={30}
/>
```

**Option B: Use UploadThing Directly** (More control, current UI preserved)
```typescript
import { useUploadThing } from '@/lib/uploadthing';

const { startUpload } = useUploadThing('animalImage', {
  onClientUploadComplete: async (res) => {
    const url = res[0].url;
    await fetch(`/api/animals/${animalId}/photos`, {
      method: 'POST',
      body: JSON.stringify({ category, fileUrl: url, ... }),
    });
  },
});
```

**Recommendation:** **Option B** - Preserve existing beautiful drag & drop UI, just add UploadThing integration

### Step 3: Fetch Existing Photos

Add `useEffect` or TanStack Query to fetch photos:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { data: photosData } = useQuery({
  queryKey: ['animal-photos', animalId],
  queryFn: async () => {
    const res = await fetch(`/api/animals/${animalId}/photos`);
    return res.json();
  },
});
```

### Step 4: Add Delete Mutation

```typescript
const deleteMutation = useMutation({
  mutationFn: async (photoId: string) => {
    await fetch(`/api/animals/${animalId}/photos?photoId=${photoId}`, {
      method: 'DELETE',
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['animal-photos', animalId]);
    toast({ title: 'Photo deleted successfully' });
  },
});
```

### Step 5: Show Category Limits

Add UI to show remaining slots:

```typescript
const { data: photosData } = useQuery(...);
const categoryPhotos = photosData?.photos.filter(p => p.category === selectedCategory) || [];
const limit = selectedCategory === 'profile' ? 1 : 10;
const remaining = limit - categoryPhotos.length;

// In UI:
<Badge>
  {remaining} of {limit} slots remaining
</Badge>
```

---

## File Structure

```
lib/db/schema/
└── animals.ts                                  # ✅ Updated with new categories

app/api/animals/[id]/photos/
└── route.ts                                    # ✅ Created (GET, POST, DELETE)

components/breeder/animals/
└── PhotosDocsTab.tsx                           # 🔄 Needs integration

components/shared/
└── FileUpload.tsx                              # ✅ Available for use
```

---

## Acceptance Criteria Progress

- [x] Database schema supports 11 photo categories
- [x] API endpoints created (GET, POST, DELETE)
- [x] Category limits enforced (1 for profile, 10 for others)
- [ ] Component integrated with UploadThing
- [ ] Photos save to database via API
- [ ] Existing photos display from database
- [ ] Delete functionality works
- [ ] Category limit UI shows remaining slots
- [ ] Full workflow tested

---

## Next Actions

1. **Integrate UploadThing** into PhotosDocsTab's existing drag & drop
2. **Add TanStack Query** for fetching and caching photos
3. **Hook up delete** mutation with confirmation dialog
4. **Add category limit badges** showing remaining slots
5. **Test full workflow** from upload to display to delete

---

## Notes

- The existing PhotosDocsTab component is very well-designed with beautiful UI
- Don't replace the entire component, just integrate the upload/fetch/delete logic
- Preserve the drag & drop experience and visual design
- Use TanStack Query for data management (it's likely already installed)
- Category limits are enforced server-side, but show client-side for better UX

---

**Status:** 50% Complete - Good foundation, needs integration work
**Next Task:** Complete PhotosDocsTab integration with UploadThing and API
**Date:** January 2025
