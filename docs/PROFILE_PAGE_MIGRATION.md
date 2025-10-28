# Breeder Profile Page - Migration Guide

**Status**: New page created and ready to replace old one  
**File**: `app/(breeder)/profile/breeder/page-new.tsx`

---

## 🎯 What's New

### ✅ Major Improvements

1. **Real API Integration**
   - ❌ Old: Mock data hardcoded in file
   - ✅ New: Fetches from `/api/breeder/profile`

2. **Component Architecture**
   - ❌ Old: Everything in one 548-line file
   - ✅ New: Uses ProfileBanner, ProfileHeader, ProfileStats, EditProfileDialog

3. **Fixed Layout Issues**
   - ❌ Old: Banner and header overlapped, badges cut off
   - ✅ New: Proper spacing, banner 320px, header -mt-32

4. **Edit Functionality**
   - ❌ Old: Inline editing cluttered the UI
   - ✅ New: Clean modal dialog with tabs

5. **Loading & Error States**
   - ❌ Old: No loading states
   - ✅ New: Skeletons, error handling, empty states

6. **Profile Initialization**
   - ❌ Old: Required manual data entry
   - ✅ New: One-click initialization with seed data

---

## 📋 Migration Steps

### Step 1: Backup Old File (Optional)

```bash
# Rename old file to keep as backup
mv page.tsx page-old-backup.tsx
```

Or just keep it as is - we'll replace the content.

### Step 2: Replace Content

**Option A: Manual Copy/Paste**
1. Open `page-new.tsx`
2. Select all content (Ctrl+A)
3. Copy (Ctrl+C)
4. Open `page.tsx`
5. Select all (Ctrl+A)
6. Paste (Ctrl+V)
7. Save (Ctrl+S)

**Option B: File Rename**
1. Delete or rename `page.tsx` to `page-old.tsx`
2. Rename `page-new.tsx` to `page.tsx`

### Step 3: Test

Navigate to:
```
http://localhost:3000/profile/breeder
```

Should see:
- ✅ Banner displays properly
- ✅ Header with avatar and badges
- ✅ Stats cards
- ✅ Edit button (top right)
- ✅ All tabs working
- ✅ No overlap issues

---

## 🔍 Key Differences

### Imports

**Old:**
```typescript
import { useState } from "react";
// Many unused imports
```

**New:**
```typescript
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileBanner } from "@/components/breeder/profile/ProfileBanner";
import { ProfileHeader } from "@/components/breeder/profile/ProfileHeader";
import { ProfileStats } from "@/components/breeder/profile/ProfileStats";
import { EditProfileDialog } from "@/components/breeder/profile/EditProfileDialog";
```

### Data Fetching

**Old:**
```typescript
const mockProfile = {
  id: 'profile_123',
  // ... hardcoded data
};
```

**New:**
```typescript
function useBreederProfile() {
  return useQuery({
    queryKey: ['breeder-profile'],
    queryFn: async () => {
      const response = await fetch('/api/breeder/profile');
      // ... real API call
    },
  });
}
```

### Layout Structure

**Old:**
```tsx
<div className="relative h-64 bg-gradient-brand">
  {/* Banner inline */}
</div>
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
  {/* Header inline with avatar */}
</div>
```

**New:**
```tsx
<ProfileBanner bannerUrl={profile.bannerUrl} isEditing={false} />
<ProfileHeader
  displayName={profile.displayName}
  tagline={profile.tagline}
  // ... all props
/>
<ProfileStats
  profileViews={profile.profileViews}
  // ... stats props
/>
```

### Edit Functionality

**Old:**
```tsx
const [isEditing, setIsEditing] = useState(false);
{isEditing ? (
  <Input value={editedProfile.displayName} />
) : (
  <h1>{mockProfile.displayName}</h1>
)}
```

**New:**
```tsx
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
<Button onClick={() => setIsEditDialogOpen(true)}>
  Edit Profile
</Button>
<EditProfileDialog
  open={isEditDialogOpen}
  onOpenChange={setIsEditDialogOpen}
  profile={profile}
/>
```

---

## ✨ New Features

### 1. Loading States
```tsx
if (isLoading) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <Skeleton className="h-80 w-full" />
      {/* More skeletons */}
    </div>
  );
}
```

### 2. Profile Initialization
```tsx
if (!profile && !error) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Breeder Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => initializeMutation.mutate()}>
          Create My Profile
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 3. Error Handling
```tsx
if (error) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Loading Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
        <Button onClick={() => refetch()}>Try Again</Button>
      </CardContent>
    </Card>
  );
}
```

### 4. Empty States
```tsx
{profile.certifications && profile.certifications.length > 0 ? (
  // Show certifications
) : (
  <Card>
    <CardContent className="p-12 text-center">
      <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>No certifications added yet.</p>
      <Button onClick={() => setIsEditDialogOpen(true)}>
        Add Certifications
      </Button>
    </CardContent>
  </Card>
)}
```

---

## 🎨 Visual Improvements

### Banner & Header Spacing

**Old Problem:**
- Banner: 256px (h-64)
- Header: -mt-20 (80px overlap)
- Result: Avatar and badges partially hidden

**New Solution:**
- Banner: 320px (h-80) - component
- Header: -mt-32 (128px overlap) - component
- Result: Perfect spacing, everything visible

### Component Separation

**Old:**
```
page.tsx (548 lines)
├── Banner (inline)
├── Header (inline)
├── Stats (inline)
├── Edit mode (inline)
└── Tabs (inline)
```

**New:**
```
page.tsx (420 lines)
├── ProfileBanner (component)
├── ProfileHeader (component)
├── ProfileStats (component)
├── EditProfileDialog (component)
└── Tabs (cleaner)
```

---

## 🧪 Testing Checklist

After migration, verify:

- [ ] Page loads without errors
- [ ] Banner displays at correct height
- [ ] Header shows avatar, name, badges
- [ ] Badges fully visible (not cut off)
- [ ] Stats cards display correctly
- [ ] Edit button appears (top right)
- [ ] Edit dialog opens
- [ ] Can save changes
- [ ] Changes persist after refresh
- [ ] All tabs work (About, Statistics, Certifications, Reviews)
- [ ] Profile completeness bar shows
- [ ] Responsive on mobile/tablet
- [ ] No console errors

---

## 🔄 Rollback Plan

If something goes wrong:

**Option 1: Undo Changes**
```bash
git checkout page.tsx
```

**Option 2: Restore Backup**
```bash
mv page-old-backup.tsx page.tsx
```

**Option 3: Use Old File**
The old file still exists, just rename it back.

---

## 📊 Code Comparison

### Line Count
- **Old:** 548 lines
- **New:** 420 lines (23% reduction)

### Components Used
- **Old:** 0 custom components
- **New:** 4 custom components

### API Calls
- **Old:** 0 (mock data)
- **New:** 2 (GET profile, POST initialize)

### State Management
- **Old:** useState only
- **New:** TanStack Query (caching, mutations)

### Loading States
- **Old:** None
- **New:** Skeletons, spinners, disabled buttons

### Error Handling
- **Old:** None
- **New:** Try-catch, error states, retry buttons

---

## 🚀 Next Steps After Migration

1. **Test thoroughly** - Use the checklist above

2. **Delete old file** - Once confirmed working:
   ```bash
   rm page-old-backup.tsx
   rm page-new.tsx
   ```

3. **Phase 5: Image Upload** - Add UploadThing integration

4. **Phase 6: Advanced Features**
   - Certifications CRUD
   - Awards CRUD
   - Breeds editor
   - Social media links

---

## 💡 Tips

1. **Keep Dev Server Running** - Changes will hot-reload

2. **Check Console** - Look for any errors after migration

3. **Test Edit Functionality** - Make sure saves work

4. **Verify Data Persistence** - Refresh page after editing

5. **Test on Mobile** - Ensure responsive design works

---

## ✅ Success Criteria

Migration is successful when:

- ✅ Page loads without errors
- ✅ All components render correctly
- ✅ Edit functionality works
- ✅ Data persists after refresh
- ✅ No visual regressions
- ✅ Better UX than before
- ✅ Cleaner code structure

---

**Ready to migrate!** 🎉

Just copy the content from `page-new.tsx` to `page.tsx` and you're done!
