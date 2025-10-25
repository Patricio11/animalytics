# 📤 File Upload System Documentation

## Overview

A comprehensive, production-ready file upload system built with **Supabase Storage**. This system provides reusable components and utilities for uploading images and documents throughout the application.

---

## 🏗️ Architecture

```
lib/supabase/
├── client.ts          # Supabase client configuration
├── upload.ts          # Upload utility functions
└── index.ts           # Public exports

components/upload/
├── ImageUpload.tsx           # Single image upload
├── MultipleImageUpload.tsx   # Multiple images upload
├── DocumentUpload.tsx        # Document upload
└── index.ts                  # Public exports
```

---

## 🚀 Quick Start

### 1. Environment Setup

Add these to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Storage Setup

1. Go to your Supabase project
2. Navigate to **Storage**
3. Create a bucket named: `animalitic`
4. Set bucket to **Public** (or configure RLS policies)
5. Done! ✅

---

## 📦 Components

### ImageUpload - Single Image Upload

Perfect for profile pictures, main images, etc.

```tsx
import { ImageUpload } from '@/components/upload';
import { STORAGE_PATHS } from '@/lib/supabase';

function MyComponent() {
  const handleSuccess = (result) => {
    console.log('Uploaded!', result.url);
    // Save result.url to your database
  };

  return (
    <ImageUpload
      storagePath={STORAGE_PATHS.ANIMAL_PHOTOS}
      onUploadSuccess={handleSuccess}
      label="Animal Photo"
      helperText="PNG, JPG up to 5MB"
      showPreview={true}
      aspectRatio="square"
    />
  );
}
```

**Props:**
- `storagePath` - Where to store the file (use STORAGE_PATHS constants)
- `onUploadSuccess` - Callback with upload result
- `onUploadError` - Optional error callback
- `currentImageUrl` - Existing image URL (for editing)
- `maxSizeInMB` - Max file size (default: 5MB)
- `showPreview` - Show image preview (default: true)
- `aspectRatio` - "square" | "video" | "auto"
- `label` - Label text
- `helperText` - Helper text

---

### MultipleImageUpload - Multiple Images

Perfect for photo galleries, animal photos, etc.

```tsx
import { MultipleImageUpload } from '@/components/upload';
import { STORAGE_PATHS } from '@/lib/supabase';

function MyComponent() {
  const handleSuccess = (results) => {
    const urls = results.map(r => r.url);
    console.log('Uploaded URLs:', urls);
    // Save URLs to your database
  };

  return (
    <MultipleImageUpload
      storagePath={STORAGE_PATHS.ANIMAL_PHOTOS}
      onUploadSuccess={handleSuccess}
      maxFiles={10}
      currentImages={existingUrls}
    />
  );
}
```

**Props:**
- `storagePath` - Where to store files
- `onUploadSuccess` - Callback with array of results
- `onUploadError` - Optional error callback
- `currentImages` - Array of existing image URLs
- `maxFiles` - Maximum number of images (default: 10)
- `maxSizeInMB` - Max file size per image (default: 5MB)

---

### DocumentUpload - Document Upload

Perfect for health records, pedigrees, certificates, etc.

```tsx
import { DocumentUpload } from '@/components/upload';
import { STORAGE_PATHS } from '@/lib/supabase';

function MyComponent() {
  const handleSuccess = (result) => {
    console.log('Document uploaded!', result.url);
    // Save result.url to your database
  };

  return (
    <DocumentUpload
      storagePath={STORAGE_PATHS.HEALTH_RECORDS}
      onUploadSuccess={handleSuccess}
      label="Health Certificate"
      helperText="PDF, DOC up to 10MB"
      maxSizeInMB={10}
    />
  );
}
```

**Props:**
- `storagePath` - Where to store the file
- `onUploadSuccess` - Callback with upload result
- `onUploadError` - Optional error callback
- `currentDocumentUrl` - Existing document URL
- `currentDocumentName` - Existing document name
- `maxSizeInMB` - Max file size (default: 10MB)
- `allowedTypes` - Custom allowed MIME types

---

## 🛠️ Utility Functions

### Upload Functions

```tsx
import { uploadFile, uploadMultipleFiles, STORAGE_PATHS, FILE_VALIDATION } from '@/lib/supabase';

// Upload single file
const result = await uploadFile(
  file,
  STORAGE_PATHS.ANIMAL_PHOTOS,
  FILE_VALIDATION.IMAGE
);

if (result.success) {
  console.log('URL:', result.url);
  console.log('Path:', result.path);
}

// Upload multiple files
const results = await uploadMultipleFiles(
  files,
  STORAGE_PATHS.ANIMAL_PHOTOS,
  FILE_VALIDATION.IMAGE
);
```

### Delete Functions

```tsx
import { deleteFile, deleteMultipleFiles, extractFilePathFromUrl } from '@/lib/supabase';

// Delete single file
const filePath = extractFilePathFromUrl(imageUrl);
await deleteFile(filePath);

// Delete multiple files
await deleteMultipleFiles([path1, path2, path3]);
```

### Validation

```tsx
import { validateFile, FILE_VALIDATION } from '@/lib/supabase';

const validation = validateFile(file, FILE_VALIDATION.IMAGE);
if (!validation.valid) {
  console.error(validation.error);
}
```

---

## 📁 Storage Paths

Pre-defined storage paths for organization:

```tsx
import { STORAGE_PATHS } from '@/lib/supabase';

STORAGE_PATHS.ANIMAL_PHOTOS          // animals/photos
STORAGE_PATHS.ANIMAL_DOCUMENTS       // animals/documents
STORAGE_PATHS.HEALTH_RECORDS         // health/records
STORAGE_PATHS.PEDIGREE_DOCUMENTS     // pedigree/documents
STORAGE_PATHS.BREEDING_RECORDS       // breeding/records
STORAGE_PATHS.USER_AVATARS           // users/avatars
STORAGE_PATHS.MARKETPLACE_IMAGES     // marketplace/images
STORAGE_PATHS.CLINIC_DOCUMENTS       // clinics/documents
```

---

## ✅ File Validation

Pre-configured validation rules:

### Images
- **Max Size:** 5MB
- **Allowed Types:** JPEG, JPG, PNG, WEBP, GIF
- **Extensions:** .jpg, .jpeg, .png, .webp, .gif

### Documents
- **Max Size:** 10MB
- **Allowed Types:** PDF, DOC, DOCX, XLS, XLSX
- **Extensions:** .pdf, .doc, .docx, .xls, .xlsx

### Custom Validation

```tsx
const customValidation = {
  maxSizeInMB: 20,
  allowedTypes: ['image/jpeg', 'image/png'],
  allowedExtensions: ['.jpg', '.png'],
};

await uploadFile(file, storagePath, customValidation);
```

---

## 🎯 Usage Examples

### Example 1: Animal Profile Photo

```tsx
import { ImageUpload } from '@/components/upload';
import { STORAGE_PATHS } from '@/lib/supabase';

function AnimalProfileForm() {
  const [photoUrl, setPhotoUrl] = useState('');

  return (
    <ImageUpload
      storagePath={STORAGE_PATHS.ANIMAL_PHOTOS}
      onUploadSuccess={(result) => setPhotoUrl(result.url!)}
      currentImageUrl={photoUrl}
      label="Profile Photo"
      aspectRatio="square"
    />
  );
}
```

### Example 2: Animal Photo Gallery

```tsx
import { MultipleImageUpload } from '@/components/upload';
import { STORAGE_PATHS } from '@/lib/supabase';

function AnimalGallery({ animalId }) {
  const [photos, setPhotos] = useState<string[]>([]);

  const handleUpload = (results) => {
    const newUrls = results.map(r => r.url!);
    setPhotos([...photos, ...newUrls]);
    // Save to database
  };

  return (
    <MultipleImageUpload
      storagePath={STORAGE_PATHS.ANIMAL_PHOTOS}
      onUploadSuccess={handleUpload}
      currentImages={photos}
      maxFiles={20}
      label="Photo Gallery"
    />
  );
}
```

### Example 3: Health Certificate Upload

```tsx
import { DocumentUpload } from '@/components/upload';
import { STORAGE_PATHS } from '@/lib/supabase';

function HealthRecordForm() {
  const [certificateUrl, setCertificateUrl] = useState('');

  return (
    <DocumentUpload
      storagePath={STORAGE_PATHS.HEALTH_RECORDS}
      onUploadSuccess={(result) => setCertificateUrl(result.url!)}
      currentDocumentUrl={certificateUrl}
      label="Health Certificate"
      helperText="Upload PDF certificate"
      allowedTypes={['application/pdf']}
    />
  );
}
```

---

## 🔒 Security Best Practices

1. **Validate on Server:** Always validate files on the server-side too
2. **Set File Size Limits:** Prevent abuse with reasonable limits
3. **Scan for Malware:** Consider adding virus scanning for production
4. **Use RLS Policies:** Configure Supabase Row Level Security
5. **Generate Unique Names:** System automatically generates unique filenames

---

## 🐛 Error Handling

All components and functions provide comprehensive error handling:

```tsx
<ImageUpload
  storagePath={STORAGE_PATHS.ANIMAL_PHOTOS}
  onUploadSuccess={(result) => {
    console.log('Success!', result);
  }}
  onUploadError={(error) => {
    console.error('Upload failed:', error);
    // Show user-friendly error message
  }}
/>
```

Common errors:
- File too large
- Invalid file type
- Network errors
- Supabase configuration issues

---

## 🎨 Customization

All components are fully customizable with Tailwind CSS:

```tsx
<ImageUpload
  className="my-custom-class"
  storagePath={STORAGE_PATHS.ANIMAL_PHOTOS}
  onUploadSuccess={handleSuccess}
/>
```

---

## 📊 Features

✅ **Single & Multiple Image Upload**  
✅ **Document Upload (PDF, DOC, XLS)**  
✅ **Real-time Preview**  
✅ **Progress Indicators**  
✅ **File Validation**  
✅ **Error Handling**  
✅ **Drag & Drop Support**  
✅ **Responsive Design**  
✅ **TypeScript Support**  
✅ **Unique Filename Generation**  
✅ **File Size Formatting**  
✅ **Delete Functionality**  

---

## 🚀 Next Steps

1. ✅ Install Supabase package: `npm install @supabase/supabase-js`
2. ✅ Add environment variables
3. ✅ Create Supabase bucket: `animalitic`
4. ✅ Import and use components
5. ✅ Save URLs to your database

---

## 💡 Tips

- Use `STORAGE_PATHS` constants for consistency
- Always handle `onUploadError` for better UX
- Save URLs to database after successful upload
- Consider implementing file deletion when records are deleted
- Use appropriate `maxSizeInMB` based on your needs

---

**Built with ❤️ for Animalytics**
