# FileUpload Component Architecture

## Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Interactions                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐              ┌─────────────────┐            │
│   │  Drag & Drop │              │  Click to Upload │            │
│   └──────┬───────┘              └────────┬─────────┘            │
│          │                               │                      │
│          │                               │                      │
└──────────┼───────────────────────────────┼──────────────────────┘
           │                               │
           │                               │
           ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FileUpload Component                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  State Management:                                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  • uploading: boolean                                  │    │
│  │  • preview: string | null                              │    │
│  │  • isDragging: boolean                                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Event Handlers:                                                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  • handleDragOver() → setIsDragging(true)              │    │
│  │  • handleDragLeave() → setIsDragging(false)            │    │
│  │  • handleDrop() → processFile(file)                    │    │
│  │  • handleFileChange() → processFile(file)              │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Processing:                                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  processFile(file):                                    │    │
│  │    1. Validate file size                               │    │
│  │       ├─ If invalid → Show toast error                 │    │
│  │       └─ If valid → Continue                           │    │
│  │    2. Generate local preview (FileReader)              │    │
│  │    3. Set uploading = true                             │    │
│  │    4. Start upload via UploadThing                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   UploadThing Integration                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  useUploadThing('animalImage', {                                │
│    onClientUploadComplete: (res) => {                           │
│      ├─ setUploading(false)                                     │
│      ├─ Extract URL from res[0].url                             │
│      ├─ Update preview with remote URL                          │
│      └─ Call onUploadComplete(url) → Parent Component           │
│    },                                                            │
│    onUploadError: (error) => {                                  │
│      ├─ setUploading(false)                                     │
│      ├─ Log error to console                                    │
│      └─ Show toast notification                                 │
│    }                                                             │
│  })                                                              │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  UploadThing API Routes                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  File: app/api/uploadthing/core.ts                              │
│                                                                 │
│  Middleware:                                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  1. Check Better Auth session                          │    │
│  │  2. If no session → Throw "Unauthorized"               │    │
│  │  3. If session → Return { userId: session.user.id }    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  File Router Endpoints:                                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  • animalImage (30MB, 1 file, images)                  │    │
│  │  • animalDocument (30MB, 1 file, PDF)                  │    │
│  │  • animalGallery (30MB, 10 files, images)              │    │
│  │  • kycDocument (10MB, 1 file, images/PDF)              │    │
│  │  • breederProfileImage (10MB, 1 file, images)          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  onUploadComplete:                                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  • Log upload completion                               │    │
│  │  • Return metadata { uploadedBy: userId }              │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   UploadThing CDN Storage                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  • File uploaded to UploadThing CDN                             │
│  • Automatic image optimization                                 │
│  • Global CDN delivery                                          │
│  • Secure HTTPS URLs generated                                  │
│  • Returns: https://uploadthing.com/.../filename.jpg            │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Parent Component                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  onUploadComplete(url) {                                        │
│    • Save URL to local state                                    │
│    • Make API call to save URL to database                      │
│    • Update UI with uploaded image                              │
│  }                                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Flow Diagram

```
Initial State:
┌────────────────────────────────────┐
│  uploading: false                  │
│  preview: null                     │
│  isDragging: false                 │
│                                    │
│  UI: Upload area (dashed border)   │
└────────────────────────────────────┘
                │
                ▼
User Drags File Over Upload Area:
┌────────────────────────────────────┐
│  uploading: false                  │
│  preview: null                     │
│  isDragging: true                  │◄── onDragOver()
│                                    │
│  UI: Upload area (primary border)  │
└────────────────────────────────────┘
                │
                ▼
User Drops File or Clicks to Select:
┌────────────────────────────────────┐
│  uploading: false                  │
│  preview: "data:image/..." (local) │◄── FileReader.readAsDataURL()
│  isDragging: false                 │
│                                    │
│  UI: Preview shown with spinner    │
└────────────────────────────────────┘
                │
                ▼
Validation Check:
┌────────────────────────────────────┐
│  Is file.size <= maxSize?          │
│  ├─ Yes → Continue to upload       │
│  └─ No  → Show toast, return       │
└────────────────────────────────────┘
                │
                ▼
Upload Started:
┌────────────────────────────────────┐
│  uploading: true                   │◄── setUploading(true)
│  preview: "data:image/..." (local) │
│  isDragging: false                 │
│                                    │
│  UI: Preview + Loader2 spinner     │
└────────────────────────────────────┘
                │
                ▼
Upload Complete (Success):
┌────────────────────────────────────┐
│  uploading: false                  │◄── onClientUploadComplete()
│  preview: "https://..." (CDN URL)  │
│  isDragging: false                 │
│                                    │
│  UI: Preview with remote image     │
│  Callback: onUploadComplete(url)   │◄── Calls parent
└────────────────────────────────────┘

OR

Upload Failed (Error):
┌────────────────────────────────────┐
│  uploading: false                  │◄── onUploadError()
│  preview: "data:image/..." (local) │
│  isDragging: false                 │
│                                    │
│  UI: Preview + Error toast         │
│  Console: Error logged             │
└────────────────────────────────────┘
```

---

## Component Props & Data Flow

```
Parent Component
      │
      │ Props ↓
      ├─ category: string
      ├─ onUploadComplete: (url: string) => void
      ├─ accept?: string (default: 'image/*')
      └─ maxSize?: number (default: 30)
      │
      ▼
FileUpload Component
      │
      │ Internal State ↓
      ├─ uploading: boolean
      ├─ preview: string | null
      └─ isDragging: boolean
      │
      │ Hooks ↓
      ├─ useUploadThing('animalImage', { callbacks })
      └─ useToast() for notifications
      │
      │ Event Handlers ↓
      ├─ handleDragOver() → setIsDragging(true)
      ├─ handleDragLeave() → setIsDragging(false)
      ├─ handleDrop(e) → processFile(file)
      └─ handleFileChange(e) → processFile(file)
      │
      │ Processing Function ↓
      ├─ processFile(file):
      │   ├─ Validate file size
      │   ├─ Generate preview (FileReader)
      │   ├─ setUploading(true)
      │   └─ startUpload([file])
      │
      │ Callbacks ↓
      ├─ onClientUploadComplete(res):
      │   ├─ setUploading(false)
      │   ├─ Extract URL: res[0].url
      │   ├─ setPreview(url)
      │   └─ onUploadComplete(url) → Parent
      │
      └─ onUploadError(error):
          ├─ setUploading(false)
          ├─ console.error(error)
          └─ toast({ error message })
```

---

## UI State Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                    Initial Upload Area                      │
├─────────────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║                                                       ║  │
│  ║                   [Upload Icon]                       ║  │
│  ║                                                       ║  │
│  ║          Click to upload or drag and drop            ║  │
│  ║                                                       ║  │
│  ║                  Max size: 30MB                       ║  │
│  ║                                                       ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
│  Border: dashed, muted                                      │
└─────────────────────────────────────────────────────────────┘

                            ↓ User drags file over

┌─────────────────────────────────────────────────────────────┐
│                 Dragging State (isDragging)                 │
├─────────────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║                                                       ║  │
│  ║                   [Upload Icon]                       ║  │
│  ║                                                       ║  │
│  ║          Click to upload or drag and drop            ║  │
│  ║                                                       ║  │
│  ║                  Max size: 30MB                       ║  │
│  ║                                                       ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
│  Border: solid primary, background: primary/5               │
└─────────────────────────────────────────────────────────────┘

                       ↓ File selected/dropped

┌─────────────────────────────────────────────────────────────┐
│                  Uploading State (uploading)                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │                   [Preview Image]                   │    │
│  │                                                     │    │
│  │              ⟳ [Spinning Loader Icon]              │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│  Preview: Local preview from FileReader                     │
│  Spinner: Loader2 icon, animated                            │
└─────────────────────────────────────────────────────────────┘

                        ↓ Upload complete

┌─────────────────────────────────────────────────────────────┐
│                   Success State (preview)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                       [X]           │    │
│  │                                                     │    │
│  │                   [Preview Image]                   │    │
│  │                 (from CDN URL)                      │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│  Preview: Remote image from UploadThing CDN                 │
│  Close button: Top-right, destructive variant               │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
File Selected
     │
     ▼
┌─────────────────────┐
│  Validate File Size │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
 Valid       Invalid
    │           │
    │           ├─→ Show Toast Error
    │           ├─→ "File too large"
    │           └─→ Return (stop)
    │
    ▼
Start Upload
    │
    ├─→ Network Error
    │   ├─→ onUploadError()
    │   ├─→ Show Toast Error
    │   ├─→ Log to console
    │   └─→ setUploading(false)
    │
    ├─→ Server Error
    │   ├─→ onUploadError()
    │   ├─→ Show Toast Error
    │   ├─→ Log to console
    │   └─→ setUploading(false)
    │
    ├─→ Auth Error (No session)
    │   ├─→ onUploadError()
    │   ├─→ Show Toast "Unauthorized"
    │   ├─→ Log to console
    │   └─→ setUploading(false)
    │
    └─→ Success
        ├─→ onClientUploadComplete(res)
        ├─→ Extract URL: res[0].url
        ├─→ Update preview with CDN URL
        ├─→ Call onUploadComplete(url)
        └─→ setUploading(false)
```

---

## Security & Validation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Client-Side Validation                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. File Size Check:                                        │
│     if (file.size > maxSize * 1024 * 1024) {               │
│       toast({ error: "File too large" });                  │
│       return; // Stop upload                               │
│     }                                                        │
│                                                             │
│  2. File Type Filter (Browser):                            │
│     <input accept="image/*" />                             │
│     → Browser filters allowed file types                   │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               UploadThing Middleware (Server)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  .middleware(async ({ req }) => {                           │
│    const session = await auth.api.getSession({             │
│      headers: req.headers                                  │
│    });                                                      │
│                                                             │
│    if (!session) {                                          │
│      throw new Error("Unauthorized");                      │
│    }                                                        │
│                                                             │
│    return { userId: session.user.id };                     │
│  })                                                         │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              UploadThing File Router (Server)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  File Router Configuration:                                 │
│  • Max file size enforced                                   │
│  • Max file count enforced                                  │
│  • File type restrictions                                   │
│  • User ID tracked in metadata                              │
│                                                             │
│  Example: animalImage                                       │
│    f({ image: {                                             │
│      maxFileSize: '30MB',                                   │
│      maxFileCount: 1                                        │
│    }})                                                      │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    UploadThing CDN                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • Secure HTTPS URLs                                        │
│  • Automatic image optimization                             │
│  • Global CDN delivery                                      │
│  • File stored securely                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### 1. Animal Profiles Integration
```typescript
// components/breeder/animals/PhotosDocsTab.tsx

import { FileUpload } from '@/components/shared/FileUpload';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const uploadMutation = useMutation({
  mutationFn: async ({ category, url }: { category: string; url: string }) => {
    const response = await fetch(`/api/animals/${animalId}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, fileUrl: url, fileType: 'image' }),
    });
    if (!response.ok) throw new Error('Failed to save file');
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['animal', animalId]);
  },
});

<FileUpload
  category={selectedCategory}
  onUploadComplete={(url) => {
    uploadMutation.mutate({ category: selectedCategory, url });
  }}
  accept="image/*"
  maxSize={30}
/>
```

### 2. KYC Verification Integration
```typescript
// app/(breeder)/verification/page.tsx

<FileUpload
  category="kyc_id_front"
  onUploadComplete={async (url) => {
    await fetch('/api/kyc/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentType: 'id_front',
        fileUrl: url,
      }),
    });
  }}
  accept="image/*,application/pdf"
  maxSize={10}
/>
```

### 3. Breeder Profile Integration
```typescript
// app/(breeder)/profile/breeder/page.tsx

<FileUpload
  category="breeder_logo"
  onUploadComplete={async (url) => {
    await fetch('/api/breeder-profile/images', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logoUrl: url }),
    });
  }}
  accept="image/*"
  maxSize={10}
/>
```

---

## Performance Optimization

### Client-Side Optimizations
```
1. File Validation Before Upload
   ├─ Saves bandwidth
   ├─ Faster user feedback
   └─ Prevents unnecessary API calls

2. Local Preview Generation
   ├─ Instant visual feedback
   ├─ Uses FileReader API
   └─ No server roundtrip needed

3. State Cleanup on Error
   ├─ Allows immediate retry
   ├─ Prevents memory leaks
   └─ Clears uploading state

4. Debounced Drag Events
   ├─ Smooth interaction
   ├─ Reduces unnecessary re-renders
   └─ Better performance
```

### Server-Side Optimizations
```
1. UploadThing CDN
   ├─ Global edge locations
   ├─ Fast image delivery
   └─ Automatic optimization

2. Authentication Middleware
   ├─ Early rejection of unauthorized requests
   ├─ No file processing for invalid users
   └─ Security without performance cost

3. File Size Limits
   ├─ Prevents abuse
   ├─ Controls storage costs
   └─ Ensures consistent experience
```

---

## Summary

The FileUpload component is a **production-ready, reusable** solution with:

✅ **Complete Functionality**
- Drag & drop with visual feedback
- Click to upload fallback
- Local preview before upload
- File size validation
- Loading states
- Error handling
- URL returned to parent

✅ **Security**
- Better Auth authentication
- Client + server validation
- Secure HTTPS URLs
- User tracking

✅ **User Experience**
- Instant feedback
- Clear error messages
- Beautiful BreedBook Pro design
- Responsive on all devices

✅ **Developer Experience**
- Type-safe props
- Simple API
- Well-documented
- Easy integration

**Ready for Phase 6 Task 6.3: Integration with Animal Profiles! 🚀**
