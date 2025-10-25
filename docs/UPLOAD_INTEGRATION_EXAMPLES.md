# 🔌 Upload System Integration Examples

## Example 1: Animal Profile - Main Photo

```tsx
// app/(breeder)/animals/[id]/edit/page.tsx
"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/upload";
import { STORAGE_PATHS } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function EditAnimalPage() {
  const [formData, setFormData] = useState({
    name: "Max",
    mainPhoto: "https://existing-photo-url.com/photo.jpg",
    // ... other fields
  });

  const handlePhotoUpload = (result) => {
    setFormData(prev => ({
      ...prev,
      mainPhoto: result.url
    }));
  };

  const handleSubmit = async () => {
    // Save formData.mainPhoto to database
    await fetch('/api/animals/123', {
      method: 'PATCH',
      body: JSON.stringify({
        mainPhoto: formData.mainPhoto
      })
    });
  };

  return (
    <form>
      <ImageUpload
        storagePath={STORAGE_PATHS.ANIMAL_PHOTOS}
        onUploadSuccess={handlePhotoUpload}
        currentImageUrl={formData.mainPhoto}
        label="Main Photo"
        aspectRatio="square"
        maxSizeInMB={5}
      />
      
      <Button onClick={handleSubmit}>Save Changes</Button>
    </form>
  );
}
```

---

## Example 2: Animal Profile - Photo Gallery

```tsx
// components/animal/PhotoGallerySection.tsx
"use client";

import { useState } from "react";
import { MultipleImageUpload } from "@/components/upload";
import { STORAGE_PATHS, deleteFile, extractFilePathFromUrl } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface PhotoGallerySectionProps {
  animalId: string;
  initialPhotos: string[];
}

export function PhotoGallerySection({ animalId, initialPhotos }: PhotoGallerySectionProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const { toast } = useToast();

  const handleUploadSuccess = async (results) => {
    const newUrls = results.map(r => r.url!);
    
    // Save to database
    try {
      const response = await fetch(`/api/animals/${animalId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: newUrls })
      });

      if (response.ok) {
        setPhotos([...photos, ...newUrls]);
        toast({
          title: "Photos uploaded!",
          description: `${newUrls.length} photo(s) added successfully.`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save photos",
        variant: "destructive"
      });
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    // Delete from Supabase
    const filePath = extractFilePathFromUrl(photoUrl);
    if (filePath) {
      await deleteFile(filePath);
    }

    // Delete from database
    await fetch(`/api/animals/${animalId}/photos`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoUrl })
    });

    // Update state
    setPhotos(photos.filter(p => p !== photoUrl));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Photo Gallery</h2>
      
      <MultipleImageUpload
        storagePath={STORAGE_PATHS.ANIMAL_PHOTOS}
        onUploadSuccess={handleUploadSuccess}
        currentImages={photos}
        maxFiles={20}
        label="Animal Photos"
        helperText="Upload multiple photos of your animal"
      />
    </div>
  );
}
```

---

## Example 3: Health Records - Document Upload

```tsx
// components/animal/HealthRecordForm.tsx
"use client";

import { useState } from "react";
import { DocumentUpload } from "@/components/upload";
import { STORAGE_PATHS } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function HealthRecordForm({ animalId }) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    documentUrl: "",
    notes: ""
  });

  const handleDocumentUpload = (result) => {
    setFormData(prev => ({
      ...prev,
      documentUrl: result.url!
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`/api/animals/${animalId}/health-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      // Success!
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Record Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Annual Checkup"
        />
      </div>

      <div>
        <Label>Date</Label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      <DocumentUpload
        storagePath={STORAGE_PATHS.HEALTH_RECORDS}
        onUploadSuccess={handleDocumentUpload}
        currentDocumentUrl={formData.documentUrl}
        label="Health Certificate / Report"
        helperText="Upload PDF, DOC, or image file"
        maxSizeInMB={10}
      />

      <div>
        <Label>Notes</Label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes..."
        />
      </div>

      <Button type="submit" disabled={!formData.documentUrl}>
        Save Health Record
      </Button>
    </form>
  );
}
```

---

## Example 4: Marketplace Listing - Multiple Images

```tsx
// components/marketplace/CreateListingForm.tsx
"use client";

import { useState } from "react";
import { MultipleImageUpload } from "@/components/upload";
import { STORAGE_PATHS } from "@/lib/supabase";

export function CreateListingForm() {
  const [listingData, setListingData] = useState({
    title: "",
    description: "",
    price: "",
    images: [] as string[]
  });

  const handleImagesUpload = (results) => {
    const imageUrls = results.map(r => r.url!);
    setListingData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const handleSubmit = async () => {
    await fetch('/api/marketplace/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingData)
    });
  };

  return (
    <div className="space-y-6">
      {/* Other form fields */}
      
      <MultipleImageUpload
        storagePath={STORAGE_PATHS.MARKETPLACE_IMAGES}
        onUploadSuccess={handleImagesUpload}
        currentImages={listingData.images}
        maxFiles={10}
        label="Listing Photos"
        helperText="Upload clear photos of your listing"
      />

      <button onClick={handleSubmit}>Create Listing</button>
    </div>
  );
}
```

---

## Example 5: User Profile - Avatar Upload

```tsx
// components/profile/AvatarUpload.tsx
"use client";

import { ImageUpload } from "@/components/upload";
import { STORAGE_PATHS } from "@/lib/supabase";
import { useSession } from "@/lib/auth/client";

export function AvatarUpload() {
  const { user, updateUser } = useSession();

  const handleAvatarUpload = async (result) => {
    // Update user profile
    await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        avatar: result.url
      })
    });

    // Update local session
    updateUser({ avatar: result.url });
  };

  return (
    <ImageUpload
      storagePath={STORAGE_PATHS.USER_AVATARS}
      onUploadSuccess={handleAvatarUpload}
      currentImageUrl={user?.avatar}
      label="Profile Picture"
      aspectRatio="square"
      maxSizeInMB={2}
    />
  );
}
```

---

## Example 6: Pedigree Document Upload

```tsx
// components/animal/PedigreeUpload.tsx
"use client";

import { DocumentUpload } from "@/components/upload";
import { STORAGE_PATHS } from "@/lib/supabase";

export function PedigreeUpload({ animalId, currentPedigree }) {
  const handleUpload = async (result) => {
    await fetch(`/api/animals/${animalId}/pedigree`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pedigreeUrl: result.url,
        pedigreePath: result.path
      })
    });
  };

  return (
    <DocumentUpload
      storagePath={STORAGE_PATHS.PEDIGREE_DOCUMENTS}
      onUploadSuccess={handleUpload}
      currentDocumentUrl={currentPedigree}
      label="Pedigree Certificate"
      helperText="Upload official pedigree document (PDF)"
      allowedTypes={['application/pdf']}
      maxSizeInMB={5}
    />
  );
}
```

---

## API Route Example: Save Photos to Database

```tsx
// app/api/animals/[id]/photos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { photos } = await request.json();
    
    // Get current photos
    const animal = await db.query.animals.findFirst({
      where: eq(animals.id, params.id)
    });

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Merge with existing photos
    const updatedPhotos = [...(animal.photos || []), ...photos];

    // Update database
    await db.update(animals)
      .set({ photos: updatedPhotos })
      .where(eq(animals.id, params.id));

    return NextResponse.json({ success: true, photos: updatedPhotos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save photos' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { photoUrl } = await request.json();
    
    const animal = await db.query.animals.findFirst({
      where: eq(animals.id, params.id)
    });

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Remove photo from array
    const updatedPhotos = (animal.photos || []).filter(p => p !== photoUrl);

    await db.update(animals)
      .set({ photos: updatedPhotos })
      .where(eq(animals.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
```

---

## Database Schema Example

```typescript
// lib/db/schema/animals.ts
import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const animals = pgTable('animals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  
  // Single main photo
  mainPhoto: text('main_photo'),
  
  // Multiple photos array
  photos: jsonb('photos').$type<string[]>().default([]),
  
  // Documents
  pedigreeDocument: text('pedigree_document'),
  healthRecords: jsonb('health_records').$type<{
    title: string;
    date: string;
    documentUrl: string;
    notes?: string;
  }[]>().default([]),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

---

## Tips for Integration

1. **Always save URLs to database** after successful upload
2. **Handle errors gracefully** with toast notifications
3. **Show loading states** during upload
4. **Validate on both client and server**
5. **Consider implementing cleanup** - delete old files when updating
6. **Use transactions** when updating multiple records
7. **Implement proper authorization** - users should only upload to their own resources

---

**Ready to integrate! 🚀**
