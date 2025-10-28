# 🔍 Pedigree Manual Entry Debug Checklist

## Issue Description
Manual pedigree entries (e.g., Grandsire) show success toast but don't appear in the tree, even after page refresh.

---

## 🧪 Debugging Steps

### 1. **Check Database Table Exists**
```sql
SELECT * FROM manual_pedigree_entries LIMIT 5;
```
✅ Schema exists in `lib/db/schema/animals.ts`
✅ Table name: `manual_pedigree_entries`

### 2. **Verify API Route is Saving**
- Check server console for logs:
  - `📝 Creating manual pedigree entry:` - Should show before insert
  - `✅ Manual pedigree entry created:` - Should show after insert with entry data

### 3. **Check Database After Add**
```sql
SELECT * FROM manual_pedigree_entries 
WHERE animal_id = '[YOUR_ANIMAL_ID]'
ORDER BY created_at DESC;
```
**Expected:** Entry should exist with correct `position` (e.g., "sire.sire")

### 4. **Verify Fetch is Working**
- Check server console for:
  - `🔍 Fetched X manual pedigree entries for animal [ID]`
  - Should list all entries with their positions

### 5. **Check Query Invalidation**
- In browser console, check React Query DevTools
- After adding entry, `["pedigree", animalId]` query should refetch

---

## 🔧 Code Flow

### **Adding Manual Entry:**
```
1. User clicks empty card (e.g., Grandsire slot)
   ↓
2. PedigreeCard onClick → onAddManual("sire.sire", 2, "GRANDSIRE")
   ↓
3. handleAddManualClick sets manualEntryConfig
   ↓
4. AddPedigreeEntryDialog opens with:
   - animalId: root animal ID (e.g., "abc-123")
   - position: "sire.sire"
   - generation: 2
   ↓
5. User fills form and submits
   ↓
6. POST /api/animals/[id]/pedigree/manual
   Body: {
     position: "sire.sire",
     generation: 2,
     name: "Champion Max",
     ...
   }
   ↓
7. API inserts into database
   ↓
8. Success response
   ↓
9. resetAndClose() calls:
   - queryClient.invalidateQueries(["pedigree", animalId])
   - onSuccess() → onUpdate() → invalidateQueries again
   ↓
10. Pedigree refetches
```

### **Fetching Pedigree:**
```
1. GET /api/animals/[id]/pedigree?gens=4
   ↓
2. fetchPedigree(animalId, 0, 4, animalId)
   ↓
3. At depth 0: fetchManualEntries(animalId)
   - SELECT * FROM manual_pedigree_entries WHERE animal_id = ?
   - Returns all entries for this animal
   - Creates Map: { "sire.sire": {...}, "dam": {...}, ... }
   ↓
4. Pass manualEntries map through recursion
   ↓
5. At each depth, check if position exists in map
   - If "sire.sire" exists → use manual entry
   - If not → check if sireId exists → recurse
   ↓
6. Return complete tree with manual entries
```

---

## 🐛 Potential Issues

### **Issue 1: Database Not Saving**
**Symptoms:**
- Success toast shows
- No error in console
- Entry not in database

**Check:**
```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'manual_pedigree_entries';

-- Check if any entries exist at all
SELECT COUNT(*) FROM manual_pedigree_entries;
```

**Fix:** Run database migration
```bash
npm run db:push
```

### **Issue 2: Wrong Animal ID**
**Symptoms:**
- Entry saves to database
- But with wrong `animal_id`

**Check:**
- Console log in API route shows `animalId`
- Verify it matches the root animal you're viewing

**Fix:** Ensure `node.id` is the root animal ID

### **Issue 3: Query Not Invalidating**
**Symptoms:**
- Entry in database
- But tree doesn't update

**Check:**
- React Query DevTools shows query status
- Check if `["pedigree", selectedAnimalId]` is being invalidated

**Fix:** Ensure query key matches exactly

### **Issue 4: Fetch Not Including Manual Entries**
**Symptoms:**
- Entry in database
- Fetch runs but doesn't include manual entries

**Check:**
- Server console shows `🔍 Fetched 0 manual pedigree entries`
- But database has entries

**Fix:** Check if `fetchManualEntries` is being called with correct ID

### **Issue 5: Position Mismatch**
**Symptoms:**
- Entry in database with position "sire.sire"
- But tree checks for different position

**Check:**
- Log the `position` being saved
- Log the `position` being checked in tree

**Fix:** Ensure position format is consistent

---

## 🧪 Manual Test

### **Test 1: Add Grandsire**
1. Go to Pedigree page
2. Select an animal
3. Click empty "GRANDSIRE" slot (sire's sire)
4. Fill form:
   - Name: "Test Grandsire"
   - Sex: Male (auto-selected)
5. Click "Add Entry"
6. **Expected:** 
   - Success toast
   - Tree refreshes
   - Grandsire appears in slot

### **Test 2: Verify Database**
```sql
SELECT 
  id,
  animal_id,
  position,
  generation,
  name,
  created_at
FROM manual_pedigree_entries
ORDER BY created_at DESC
LIMIT 1;
```
**Expected:**
- `position`: "sire.sire"
- `generation`: 2
- `name`: "Test Grandsire"

### **Test 3: Refresh Page**
1. Refresh browser
2. Select same animal
3. **Expected:** Grandsire still appears

---

## 📊 Console Logs to Check

### **When Adding:**
```
📝 Creating manual pedigree entry: {
  animalId: "abc-123",
  userId: "user-456",
  position: "sire.sire",
  generation: 2,
  name: "Test Grandsire"
}
✅ Manual pedigree entry created: { id: "entry-789", ... }
```

### **When Fetching:**
```
🔍 Fetched 1 manual pedigree entries for animal abc-123: [
  { position: "sire.sire", name: "Test Grandsire" }
]
```

---

## ✅ Success Criteria

1. ✅ Entry saves to database
2. ✅ Entry appears in tree immediately
3. ✅ Entry persists after page refresh
4. ✅ Multiple entries can be added
5. ✅ Entries at all depths work (dam, sire, grandsire, great-grandsire)

---

## 🔧 Quick Fixes Applied

### **Fix 1: Pass Manual Entries Through Recursion**
**File:** `lib/utils/pedigree.ts`
**Change:** Added `manualEntriesMap` parameter to `fetchPedigree` function
**Status:** ✅ Applied

### **Fix 2: Add Logging**
**Files:** 
- `app/api/animals/[id]/pedigree/manual/route.ts`
- `lib/utils/pedigree.ts`
**Change:** Added console.log statements
**Status:** ✅ Applied

---

## 🚀 Next Steps

1. **Test the add flow** - Add a grandsire and check console logs
2. **Check database** - Verify entry was saved
3. **Check fetch** - Verify entry is being fetched
4. **Check tree** - Verify entry appears in UI

If entry saves but doesn't appear:
- Check if `fetchManualEntries` is being called
- Check if position matches exactly
- Check if manual entries map is being passed through recursion

If entry doesn't save:
- Check database connection
- Check if table exists
- Run `npm run db:push` to sync schema
