# Pedigree View-Only Mode - Debugging Guide

## 📋 Issue Description

**Problem:** When viewing an animal profile, the pedigree shows "View-only mode" even though you created the animal and should be able to edit it.

**Expected Behavior:** If you're the owner of the animal, you should see edit controls (Edit Parents, Import Pedigree, etc.)

---

## 🔍 How Ownership Works

### **Ownership Check Logic:**

```typescript
// In PedigreeTab.tsx
const { user } = useAuth();
const isOwner = user?.id === animalUserId;
```

**The pedigree tab receives:**
- `animalUserId` - The user ID who owns the animal (from `animal.userId`)
- `user.id` - The current logged-in user's ID

**Comparison:**
- ✅ If `user.id === animalUserId` → You're the owner → Full edit access
- ❌ If `user.id !== animalUserId` → You're not the owner → View-only mode

---

## 🐛 Possible Issues

### **Issue 1: User ID Mismatch**

**Symptom:** You created the animal but see "View-only mode"

**Possible Causes:**
1. **Different user IDs:** The animal's `userId` doesn't match your current `user.id`
2. **Type mismatch:** One ID is a string, the other is a different type
3. **Undefined values:** Either `user.id` or `animalUserId` is undefined

**Debug Steps:**
1. Open browser console (F12)
2. View the animal profile
3. Look for these logs:

```
🐕 Animal data: {
  id: "clx123abc",
  name: "Max",
  userId: "user-abc-123",
  currentUser: "user-abc-123",
  isOwner: true
}

🔍 PedigreeTab ownership check: {
  userId: "user-abc-123",
  animalUserId: "user-abc-123",
  isOwner: true,
  match: true
}
```

**What to Check:**
- ✅ `userId` and `currentUser` should be identical
- ✅ `animalUserId` and `userId` should be identical
- ✅ `isOwner` should be `true`
- ❌ If any are `undefined`, there's a data loading issue
- ❌ If IDs don't match, there's an ownership issue

---

### **Issue 2: Animal Created by Different User**

**Symptom:** Animal was created but under a different user account

**Possible Causes:**
1. **Multiple accounts:** You have multiple accounts and created the animal with a different one
2. **Session issue:** You were logged in as a different user when creating the animal
3. **Database issue:** The `userId` was set incorrectly during creation

**Solution:**
1. Check which user created the animal:
   ```sql
   SELECT id, name, userId FROM animals WHERE id = 'your-animal-id';
   ```
2. Check your current user ID:
   - Open browser console
   - Run: `localStorage.getItem('auth')` or check the logs above
3. If they don't match:
   - Either log in with the correct account
   - OR update the animal's `userId` in the database (if you have access)

---

### **Issue 3: Auth Context Not Loaded**

**Symptom:** `user` is `undefined` in the logs

**Possible Causes:**
1. **Auth not initialized:** The `useAuth` hook hasn't loaded yet
2. **Session expired:** Your session has expired
3. **Auth provider issue:** The `AuthProvider` is not wrapping the component

**Solution:**
1. Refresh the page
2. Log out and log back in
3. Check if `AuthProvider` is in the layout

---

## 🔧 Files Modified for Debugging

### **1. PedigreeTab.tsx**

**Added Debug Logging:**
```typescript
// Debug logging
console.log('🔍 PedigreeTab ownership check:', {
  userId: user?.id,
  animalUserId,
  isOwner,
  match: user?.id === animalUserId,
});
```

**Purpose:** Shows the ownership comparison in the pedigree tab

---

### **2. app/(breeder)/animals/[id]/page.tsx**

**Added useAuth Hook:**
```typescript
const { user } = useAuth();
```

**Added Debug Logging:**
```typescript
// Debug logging
console.log('🐕 Animal data:', {
  id: animal.id,
  name: animal.name,
  userId: animal.userId,
  currentUser: user?.id,
  isOwner: user?.id === animal.userId,
});
```

**Purpose:** Shows the animal's userId and current user comparison

---

## 🧪 Testing Steps

### **Step 1: Create a New Animal**
1. Go to "My Animals" page
2. Click "Add Animal"
3. Fill in all required fields
4. Complete all steps and submit
5. Note the animal ID from the URL

### **Step 2: View the Animal Profile**
1. Click on the newly created animal
2. Open browser console (F12)
3. Look for the debug logs

### **Step 3: Check the Logs**

**Expected Output (Owner):**
```
🐕 Animal data: {
  id: "clx123abc",
  name: "Max",
  userId: "user-abc-123",
  currentUser: "user-abc-123",
  isOwner: true
}

🔍 PedigreeTab ownership check: {
  userId: "user-abc-123",
  animalUserId: "user-abc-123",
  isOwner: true,
  match: true
}
```

**Unexpected Output (Not Owner):**
```
🐕 Animal data: {
  id: "clx123abc",
  name: "Max",
  userId: "user-xyz-789",  // ❌ Different user!
  currentUser: "user-abc-123",
  isOwner: false
}

🔍 PedigreeTab ownership check: {
  userId: "user-abc-123",
  animalUserId: "user-xyz-789",  // ❌ Different user!
  isOwner: false,
  match: false
}
```

### **Step 4: Navigate to Pedigree Tab**
1. Click on the "Pedigree" tab
2. Check if you see edit controls:
   - ✅ **Owner:** "Edit Parents" button, "Import Pedigree" button
   - ❌ **Not Owner:** "View-only mode" message, no edit buttons

---

## 🔍 Database Verification

### **Check Animal Ownership:**
```sql
SELECT 
  a.id,
  a.name,
  a.userId,
  u.name as userName,
  u.email as userEmail
FROM animals a
LEFT JOIN users u ON a.userId = u.id
WHERE a.id = 'your-animal-id';
```

**Expected Output:**
```
id            | name | userId        | userName      | userEmail
clx123abc     | Max  | user-abc-123  | John Doe      | john@example.com
```

**What to Check:**
- ✅ `userId` should match your user ID
- ✅ `userName` and `userEmail` should be yours
- ❌ If different, the animal was created by someone else

---

## 🛠️ Fixing Ownership Issues

### **Option 1: Update Animal Ownership (Database)**

**If you have database access:**
```sql
UPDATE animals 
SET userId = 'your-correct-user-id'
WHERE id = 'animal-id';
```

**⚠️ Warning:** Only do this if you're sure the animal should belong to you!

---

### **Option 2: Transfer Ownership (Future Feature)**

**Not implemented yet, but could be added:**
- Owner can transfer ownership to another user
- Admin can reassign ownership
- Ownership history is tracked

---

## 📊 Expected Console Output

### **Successful Ownership (Owner):**

```
🐕 Animal data: {
  id: "clx123abc",
  name: "Golden Boy",
  userId: "clxuser123",
  currentUser: "clxuser123",
  isOwner: true
}

🔍 PedigreeTab ownership check: {
  userId: "clxuser123",
  animalUserId: "clxuser123",
  isOwner: true,
  match: true
}
```

**Result:** ✅ Full edit access in pedigree tab

---

### **View-Only Mode (Not Owner):**

```
🐕 Animal data: {
  id: "clx123abc",
  name: "Golden Boy",
  userId: "clxuser456",  // Different user
  currentUser: "clxuser123",
  isOwner: false
}

🔍 PedigreeTab ownership check: {
  userId: "clxuser123",
  animalUserId: "clxuser456",  // Different user
  isOwner: false,
  match: false
}
```

**Result:** ⚠️ View-only mode (expected behavior for non-owners)

---

### **Auth Not Loaded:**

```
🐕 Animal data: {
  id: "clx123abc",
  name: "Golden Boy",
  userId: "clxuser123",
  currentUser: undefined,  // ❌ Auth not loaded
  isOwner: false
}

🔍 PedigreeTab ownership check: {
  userId: undefined,  // ❌ Auth not loaded
  animalUserId: "clxuser123",
  isOwner: false,
  match: false
}
```

**Result:** ❌ View-only mode (auth issue - refresh page or log in again)

---

## ✅ Summary

### **What We Added:**

1. **Debug Logging in PedigreeTab:**
   - Shows ownership comparison
   - Helps identify ID mismatches

2. **Debug Logging in Animal Profile Page:**
   - Shows animal's userId
   - Shows current user's ID
   - Shows ownership status

3. **This Documentation:**
   - Explains how ownership works
   - Provides debugging steps
   - Shows expected console output

### **How to Use:**

1. **Open browser console** when viewing animal profile
2. **Check the logs** for ownership information
3. **Compare IDs** - they should match if you're the owner
4. **If IDs don't match:**
   - Check if you're logged in with the correct account
   - Verify the animal was created by your account
   - Contact support if needed

### **Next Steps:**

- Test with a newly created animal
- Check console logs
- Share the logs if issue persists
- We can investigate further based on the debug output

---

## 🎯 Quick Checklist

- [ ] Created animal with current account
- [ ] Viewing animal profile
- [ ] Browser console open (F12)
- [ ] See debug logs with IDs
- [ ] `userId` and `currentUser` match
- [ ] `isOwner` is `true`
- [ ] Can see edit controls in pedigree tab

**If all checked:** ✅ Everything is working!

**If any unchecked:** Share the console logs for further debugging! 🔍
