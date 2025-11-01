# UploadThing Setup Instructions

## Overview

UploadThing is now configured for file uploads in Animalytics. This guide will help you get your API keys and test the upload functionality.

---

## Step 1: Get Your UploadThing API Keys

1. **Visit UploadThing Dashboard**
   - Go to https://uploadthing.com
   - Sign up or log in with your account

2. **Create a New App**
   - Click "Create App" or select your existing app
   - Copy your **App ID** and **Secret Key**

3. **Update Environment Variables**
   - Open `.env.local` file
   - Replace the placeholder values:
     ```env
     UPLOADTHING_SECRET=your-actual-secret-key-here
     UPLOADTHING_APP_ID=your-actual-app-id-here
     ```

---

## Step 2: File Router Configuration

The following file upload endpoints are configured:

| Endpoint | Purpose | Max Size | Max Files | Allowed Types |
|----------|---------|----------|-----------|---------------|
| `animalImage` | Animal profile photos | 30MB | 1 | Images |
| `animalDocument` | Health records, certificates | 30MB | 1 | PDF |
| `animalGallery` | Multiple gallery photos | 30MB | 10 | Images |
| `kycDocument` | Identity verification | 10MB | 1 | Images, PDF |
| `breederProfileImage` | Breeder logo/banner | 10MB | 1 | Images |

**File:** `app/api/uploadthing/core.ts`

---

## Step 3: Using the FileUpload Component

### Basic Usage

```typescript
import { FileUpload } from '@/components/shared/FileUpload';

function MyComponent() {
  const handleUploadComplete = (url: string) => {
    console.log('File uploaded:', url);
    // Save URL to database or state
  };

  return (
    <FileUpload
      endpoint="animalImage"
      onUploadComplete={handleUploadComplete}
      accept="image/*"
      maxSize={30}
    />
  );
}
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `endpoint` | FileRouterEndpoint | ✅ Yes | - | Which upload endpoint to use |
| `onUploadComplete` | `(url: string) => void` | ✅ Yes | - | Callback with uploaded file URL |
| `accept` | string | ❌ No | `'image/*'` | File type filter |
| `maxSize` | number | ❌ No | `30` | Max file size in MB |
| `showPreview` | boolean | ❌ No | `true` | Show preview after upload |

### Available Endpoints

```typescript
type FileRouterEndpoint =
  | 'animalImage'
  | 'animalDocument'
  | 'animalGallery'
  | 'kycDocument'
  | 'breederProfileImage';
```

---

## Step 4: Example Implementations

### Example 1: Upload Animal Profile Photo

```typescript
'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/shared/FileUpload';

export function AnimalProfilePhotoUpload({ animalId }: { animalId: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleUpload = async (url: string) => {
    setImageUrl(url);

    // Save to database
    await fetch(`/api/animals/${animalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileImageUrl: url }),
    });
  };

  return (
    <div>
      <h3>Upload Profile Photo</h3>
      <FileUpload
        endpoint="animalImage"
        onUploadComplete={handleUpload}
        accept="image/*"
        maxSize={30}
      />
      {imageUrl && <p>Uploaded: {imageUrl}</p>}
    </div>
  );
}
```

### Example 2: Upload KYC Document

```typescript
'use client';

import { FileUpload } from '@/components/shared/FileUpload';

export function KYCDocumentUpload() {
  const handleUpload = async (url: string) => {
    // Save KYC document URL to database
    await fetch('/api/kyc/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentType: 'id_front',
        url,
      }),
    });
  };

  return (
    <FileUpload
      endpoint="kycDocument"
      onUploadComplete={handleUpload}
      accept="image/*,application/pdf"
      maxSize={10}
    />
  );
}
```

### Example 3: Upload Multiple Gallery Images

```typescript
'use client';

import { useState } from 'react';
import { useUploadThing } from '@/lib/uploadthing';
import { Button } from '@/components/ui/button';

export function AnimalGalleryUpload({ animalId }: { animalId: string }) {
  const [uploading, setUploading] = useState(false);

  const { startUpload } = useUploadThing('animalGallery', {
    onClientUploadComplete: async (res) => {
      setUploading(false);
      const urls = res?.map(r => r.url) || [];

      // Save all URLs to database
      await fetch(`/api/animals/${animalId}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
    },
    onUploadError: (error) => {
      setUploading(false);
      console.error('Upload error:', error);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    await startUpload(files);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
        id="gallery-upload"
      />
      <label htmlFor="gallery-upload">
        <Button as="span" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Gallery Images (up to 10)'}
        </Button>
      </label>
    </div>
  );
}
```

---

## Step 5: Security Features

### Authentication Middleware

All upload endpoints are protected with authentication:

```typescript
.middleware(async ({ req }) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) throw new Error("Unauthorized");
  return { userId: session.user.id };
})
```

### File Validation

- **Size limits** enforced on client and server
- **File type restrictions** via accept attribute
- **Max file count** limits for gallery uploads

---

## Step 6: Testing the Upload

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to a page with FileUpload component**
   - Example: Animal profile edit page
   - Example: KYC verification page

3. **Test Upload Flow**
   - Click upload area or drag file
   - Verify file size validation
   - Verify file type validation
   - Check preview display
   - Confirm upload completion
   - Verify URL is returned

4. **Check Upload in Dashboard**
   - Visit https://uploadthing.com/dashboard
   - View uploaded files
   - Check storage usage

---

## Troubleshooting

### Error: "Unauthorized"
- ✅ Ensure user is logged in
- ✅ Check Better Auth session is valid
- ✅ Verify session cookies are present

### Error: "Failed to upload"
- ✅ Check UPLOADTHING_SECRET is set correctly
- ✅ Check UPLOADTHING_APP_ID is set correctly
- ✅ Verify network connection
- ✅ Check UploadThing dashboard for errors

### Files Not Uploading
- ✅ Verify file size is under limit
- ✅ Check file type is allowed
- ✅ Clear browser cache
- ✅ Check browser console for errors

### Preview Not Showing
- ✅ Ensure `showPreview={true}` is set
- ✅ Verify file is an image (for image preview)
- ✅ Check browser supports FileReader API

---

## API Endpoints

The following routes are automatically created:

- **GET** `/api/uploadthing` - Get upload configuration
- **POST** `/api/uploadthing` - Handle file uploads

These routes are handled by UploadThing SDK internally.

---

## File Structure

```
app/
├── api/
│   └── uploadthing/
│       ├── core.ts          # File router configuration
│       └── route.ts         # API route handlers
components/
└── shared/
    └── FileUpload.tsx       # Reusable upload component
lib/
└── uploadthing.ts           # React hooks & utilities
.env.local                   # Environment variables
```

---

## Next Steps

1. ✅ Get UploadThing API keys
2. ✅ Update `.env.local` with your keys
3. ✅ Test file uploads in development
4. ✅ Integrate FileUpload component in your pages
5. ✅ Add file URLs to database schemas
6. ✅ Test in production

---

## Resources

- **UploadThing Docs**: https://docs.uploadthing.com
- **Dashboard**: https://uploadthing.com/dashboard
- **Pricing**: https://uploadthing.com/pricing (Free tier: 2GB storage, 2GB bandwidth)

---

**Status**: ✅ Configured and Ready
**Date**: January 2025
**Phase**: 6 - File Upload & Storage
