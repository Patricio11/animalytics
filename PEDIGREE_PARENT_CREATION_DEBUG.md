# Pedigree Parent Creation - Debugging Guide

## 📋 Issue Description

**Problem:** When creating an animal and adding SIRE and DAM information, the parents don't appear in the Pedigree view.

**Expected Behavior:** Parents should automatically appear in the pedigree tree after animal creation.

---

## 🔍 How the System Works

### **Two Ways to Add Parents:**

#### **1. Select from System (sireMode/damMode = 'select')**
- User selects an existing animal as parent
- Frontend sends: `sireId` or `damId`
- Backend saves to `animals` table: `sireId`, `damId` columns
- Pedigree fetch: Uses `animal.sireId`/`animal.damId` to recursively fetch parent

#### **2. Manual Entry (sireMode/damMode = 'manual')**
- User manually enters parent details
- Frontend sends: `sireRegistrationNumber`, `sireRegisteredName`
- Backend creates entry in `manual_pedigree_entries` table
- Pedigree fetch: Looks up manual entries by position ('sire', 'dam')

---

## 🔄 Data Flow

### **Creating Animal with System Parents:**

```
1. User selects sire from dropdown
   → formData.sireMode = 'select'
   → formData.sireId = 'animal-123'

2. Frontend sends to API:
   {
     sireId: 'animal-123',
     damId: 'animal-456',
     ...
   }

3. Backend saves to animals table:
   INSERT INTO animals (sireId, damId, ...)
   VALUES ('animal-123', 'animal-456', ...)

4. Pedigree fetch checks:
   - animal.sireId exists? → Recursively fetch that animal
   - animal.damId exists? → Recursively fetch that animal
```

### **Creating Animal with Manual Parents:**

```
1. User enters manual parent info
   → formData.sireMode = 'manual'
   → formData.sireRegistrationNumber = 'ZA-123'
   → formData.sireRegisteredName = 'Champion Dog'

2. Frontend sends to API:
   {
     sireRegistrationNumber: 'ZA-123',
     sireRegisteredName: 'Champion Dog',
     ...
   }

3. Backend saves to animals table:
   INSERT INTO animals (name, breed, ...)
   VALUES (...)
   
   Then creates manual entry:
   INSERT INTO manual_pedigree_entries
   (animalId, position, registeredName, registrationNumber, ...)
   VALUES (newAnimalId, 'sire', 'Champion Dog', 'ZA-123', ...)

4. Pedigree fetch checks:
   - manual_pedigree_entries for position 'sire'? → Use that entry
   - manual_pedigree_entries for position 'dam'? → Use that entry
```

---

## 🐛 Debugging Steps

### **Step 1: Check Frontend is Sending Correct Data**

**Open Browser Console** when creating animal:

```javascript
// In AddAnimalDialog.tsx submission
console.log('🔍 Creating animal with parent info:', {
  sireId: validatedData.sireId,
  damId: validatedData.damId,
  sireRegistrationNumber: validatedData.sireRegistrationNumber,
  sireRegisteredName: validatedData.sireRegisteredName,
  damRegistrationNumber: validatedData.damRegistrationNumber,
  damRegisteredName: validatedData.damRegisteredName,
});
```

**Expected Output:**
- If "Select from System": `sireId` and `damId` should have values
- If "Manual Entry": `sireRegistrationNumber` and `sireRegisteredName` should have values

---

### **Step 2: Check Backend Received and Saved Data**

**Check Terminal/Server Logs** after creating animal:

```
🔍 Creating animal with parent info: {
  sireId: 'clx123abc',
  damId: 'clx456def',
  sireRegistrationNumber: undefined,
  sireRegisteredName: undefined,
  damRegistrationNumber: undefined,
  damRegisteredName: undefined
}

✅ Animal created with ID: clx789ghi
📊 Saved parent IDs: {
  sireId: 'clx123abc',
  damId: 'clx456def'
}
```

**What to Check:**
- ✅ Parent IDs are NOT undefined
- ✅ Saved parent IDs match what was sent
- ✅ For manual entries, see "📝 Creating manual pedigree entry" logs

---

### **Step 3: Check Database Directly**

**Query animals table:**
```sql
SELECT id, name, sireId, damId 
FROM animals 
WHERE id = 'your-animal-id';
```

**Expected:**
- `sireId` and `damId` columns should have values (if system parents)
- OR they should be NULL (if manual parents)

**Query manual_pedigree_entries:**
```sql
SELECT * 
FROM manual_pedigree_entries 
WHERE animalId = 'your-animal-id';
```

**Expected:**
- Should have rows with `position = 'sire'` and `position = 'dam'` (if manual parents)
- OR no rows (if system parents)

---

### **Step 4: Check Pedigree Fetch**

**Open Browser Console** when viewing pedigree:

```
🔍 Fetched 0 manual pedigree entries for animal clx789ghi: []
🔍 Depth 0, checking paths: {
  damPath: 'dam',
  sirePath: 'sire',
  hasManualDam: false,
  hasManualSire: false
}
🔄 Recursing for sire: clx123abc
🔄 Recursing for dam: clx456def
```

**What to Check:**
- ✅ If system parents: Should see "🔄 Recursing for sire/dam"
- ✅ If manual parents: Should see "✅ Found manual sire/dam at position"
- ❌ If neither: Problem with data saving

---

## ✅ Current Implementation Status

### **Files Modified:**

| File | Status | Purpose |
|------|--------|---------|
| `app/api/animals/route.ts` | ✅ **Updated** | Added logging to debug parent info |
| `components/breeder/animals/AddAnimalDialog.tsx` | ✅ **Working** | Sends parent data correctly |
| `lib/utils/pedigree.ts` | ✅ **Working** | Fetches parents from DB |
| `app/api/animals/[id]/pedigree/route.ts` | ✅ **Working** | Returns pedigree tree |

### **Logging Added:**

```typescript
// app/api/animals/route.ts

// Before creation
console.log('🔍 Creating animal with parent info:', {
  sireId: validatedData.sireId,
  damId: validatedData.damId,
  sireRegistrationNumber: validatedData.sireRegistrationNumber,
  sireRegisteredName: validatedData.sireRegisteredName,
  damRegistrationNumber: validatedData.damRegistrationNumber,
  damRegisteredName: validatedData.damRegisteredName,
});

// After creation
console.log('✅ Animal created with ID:', createdAnimal.id);
console.log('📊 Saved parent IDs:', {
  sireId: createdAnimal.sireId,
  damId: createdAnimal.damId,
});
```

---

## 🧪 Testing Checklist

### **Test 1: Create Animal with System Parents**
- [ ] Create new animal
- [ ] In Step 3, select "Select from System" for Sire
- [ ] Choose an existing male animal
- [ ] Select "Select from System" for Dam
- [ ] Choose an existing female animal
- [ ] Complete creation
- [ ] **Check Terminal:** Should see parent IDs logged
- [ ] View animal profile → Pedigree tab
- [ ] **Expected:** Sire and Dam should appear in tree

### **Test 2: Create Animal with Manual Parents**
- [ ] Create new animal
- [ ] In Step 3, select "Manual Entry" for Sire
- [ ] Enter Registered Name and Registration Number
- [ ] Select "Manual Entry" for Dam
- [ ] Enter Registered Name and Registration Number
- [ ] Complete creation
- [ ] **Check Terminal:** Should see "📝 Creating manual pedigree entry" logs
- [ ] View animal profile → Pedigree tab
- [ ] **Expected:** Sire and Dam should appear in tree

### **Test 3: Mixed Mode**
- [ ] Create animal with System Sire + Manual Dam
- [ ] View pedigree
- [ ] **Expected:** Both should appear

---

## 🔧 Common Issues & Solutions

### **Issue 1: Parents Not Appearing**

**Symptoms:**
- Animal created successfully
- No errors in console
- Pedigree shows only the animal, no parents

**Possible Causes:**
1. **Frontend not sending parent data**
   - Check browser console for submission data
   - Verify `sireId`/`damId` or manual fields have values

2. **Backend not saving parent data**
   - Check terminal logs for "📊 Saved parent IDs"
   - Verify IDs are not `null`

3. **Database constraint issue**
   - Check if parent IDs reference valid animals
   - Verify foreign key constraints

**Solution:**
- Follow debugging steps above
- Check logs at each step
- Verify data in database

---

### **Issue 2: Only One Parent Showing**

**Symptoms:**
- Sire appears but Dam doesn't (or vice versa)

**Possible Causes:**
1. **One parent not selected/entered**
   - Check form validation
   - Verify both parents are required

2. **One parent ID invalid**
   - Check if parent animal exists
   - Verify parent animal is active

**Solution:**
- Check logs for both sire and dam
- Verify both are being sent and saved

---

### **Issue 3: Manual Parents Not Showing**

**Symptoms:**
- Manual parent entries created
- But don't appear in pedigree

**Possible Causes:**
1. **Manual entry not created**
   - Check for "📝 Creating manual pedigree entry" log
   - Check `manual_pedigree_entries` table

2. **Position mismatch**
   - Verify position is exactly 'sire' or 'dam'
   - Check for typos

**Solution:**
- Query `manual_pedigree_entries` table
- Verify `animalId` and `position` are correct

---

## 📝 Summary

The system **already handles** parent creation correctly:

1. ✅ **System Parents:** Saved via `sireId`/`damId` in `animals` table
2. ✅ **Manual Parents:** Saved via `manual_pedigree_entries` table
3. ✅ **Pedigree Fetch:** Checks both sources and builds tree

**Added Logging** to help debug:
- Frontend: Shows what data is being sent
- Backend: Shows what data is received and saved
- Pedigree: Shows how tree is being built

**Next Steps:**
1. Create a test animal with parents
2. Check terminal logs
3. Verify parents appear in pedigree
4. If issue persists, share logs for further debugging

---

## 🎯 Expected Console Output

### **Successful Creation with System Parents:**

```
🔍 Creating animal with parent info: {
  sireId: 'clx123abc',
  damId: 'clx456def',
  sireRegistrationNumber: undefined,
  sireRegisteredName: undefined,
  damRegistrationNumber: undefined,
  damRegisteredName: undefined
}
✅ Animal created with ID: clx789ghi
📊 Saved parent IDs: { sireId: 'clx123abc', damId: 'clx456def' }
```

### **Successful Creation with Manual Parents:**

```
🔍 Creating animal with parent info: {
  sireId: undefined,
  damId: undefined,
  sireRegistrationNumber: 'ZA-GR-2022-001',
  sireRegisteredName: 'Champion Golden Boy',
  damRegistrationNumber: 'ZA-GR-2021-045',
  damRegisteredName: 'Lady Golden Star'
}
✅ Animal created with ID: clx789ghi
📊 Saved parent IDs: { sireId: null, damId: null }
📝 Creating manual pedigree entry for sire: Champion Golden Boy
✅ Manual sire entry created
📝 Creating manual pedigree entry for dam: Lady Golden Star
✅ Manual dam entry created
```

**Result:** Parents should now appear in the pedigree tree! 🎉
