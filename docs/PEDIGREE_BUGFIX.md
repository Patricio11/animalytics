# Pedigree Feature - Permission Bug Fix ✅

**Issue**: Permission errors in pedigree API routes  
**Date**: January 2025  
**Status**: Fixed

---

## Problem

When running the dev server and accessing the Pedigree tab, the following errors occurred:

```
Error: Cannot read properties of undefined (reading 'ANIMALS_READ')
TypeError: Cannot read properties of undefined (reading 'ANIMALS_READ')
    at GET (app\api\animals\[id]\pedigree\route.ts:24:49)
```

**Root Cause**: 
- `PERMISSIONS` was being imported from `@/lib/permissions/server`
- But `PERMISSIONS` is not exported from that file
- `PERMISSIONS` is defined in `@/lib/permissions/definitions`

**Secondary Issue**:
- Using `requirePermission()` which returns `Promise<void>` and redirects
- Should use `checkPermission()` which returns `{ allowed, role }` for API routes

**Tertiary Issue**:
- Using `user?.id` without getting the session first
- Need to call `auth.api.getSession({ headers: request.headers })`

---

## Solution

### 1. Fixed Import Statements

**Before:**
```typescript
import { requirePermission, PERMISSIONS } from '@/lib/permissions/server';
```

**After:**
```typescript
import { checkPermission } from '@/lib/permissions/server';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { auth } from '@/lib/auth/config';
```

### 2. Fixed Permission Checks

**Before:**
```typescript
const { allowed } = await requirePermission(PERMISSIONS.ANIMALS_READ);
```

**After:**
```typescript
const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_READ as any);
```

### 3. Fixed User Attribution

**Before:**
```typescript
createdBy: user?.id ?? null,
uploadedBy: user?.id ?? null,
```

**After:**
```typescript
// Get session first
const session = await auth.api.getSession({ headers: request.headers });

// Then use session.user.id
createdBy: session?.user?.id ?? null,
uploadedBy: session?.user?.id ?? null,
```

---

## Files Fixed

1. ✅ `app/api/animals/[id]/pedigree/route.ts`
   - Fixed imports
   - Changed `requirePermission` to `checkPermission`
   - Added session retrieval
   - Fixed user attribution in snapshot creation

2. ✅ `app/api/animals/[id]/pedigree/documents/route.ts`
   - Fixed imports
   - Changed `requirePermission` to `checkPermission` (3 places: GET, POST, DELETE)
   - Added session retrieval in POST
   - Fixed user attribution in document upload

3. ✅ `app/api/animals/[id]/pedigree/export/route.ts`
   - Fixed imports
   - Changed `requirePermission` to `checkPermission`

---

## Testing

After fixes, the following should work:

1. **Navigate to animal profile**
   ```
   http://localhost:3000/animals/[id]
   ```

2. **Click Pedigree tab**
   - Should load without errors
   - Should show pedigree tree (if data exists)
   - Should show documents sidebar

3. **Test actions**
   - Edit Parents → Should open dialog
   - Create Snapshot → Should save to database
   - Upload Document → Should upload successfully
   - Export CSV → Should download file

---

## Why This Happened

The pedigree API routes were created following a pattern that:
1. Assumed `PERMISSIONS` was exported from `server.ts` (it's not)
2. Used `requirePermission()` which is for Server Components, not API routes
3. Didn't retrieve the session before using `user`

**Correct Pattern for API Routes:**
```typescript
import { checkPermission } from '@/lib/permissions/server';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { auth } from '@/lib/auth/config';

export async function GET(request: NextRequest) {
  // 1. Check permission
  const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_READ as any);
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2. Get session if needed
  const session = await auth.api.getSession({ headers: request.headers });
  
  // 3. Use session.user.id for attribution
  const userId = session?.user?.id;
  
  // ... rest of logic
}
```

---

## Prevention

To prevent this in the future:

1. **Always check exports** before importing
2. **Use `checkPermission()`** in API routes (not `requirePermission()`)
3. **Get session explicitly** when needing user data
4. **Follow existing patterns** in the codebase (check other API routes)

---

## Status

✅ **All permission errors fixed**  
✅ **All routes updated**  
✅ **Ready for testing**

The pedigree feature should now work correctly!

---

**Fix Date**: January 2025  
**Files Modified**: 3  
**Lines Changed**: ~15
