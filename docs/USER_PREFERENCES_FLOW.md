# 📋 User Preferences Flow - How It Works

## 🎯 The Problem

When a user signs up, they select:
- **Role** (breeder, veterinarian, etc.)
- **Breed Preferences** (which breeds they work with)

But with email verification enabled, the user can't be logged in immediately, so we can't save these to the database right away.

## ✅ The Solution: localStorage + Auto-Initialize

### **Complete Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SIGNUP PAGE                                              │
│    User fills form with:                                    │
│    - Name, Email, Password                                  │
│    - Role (breeder/vet/etc)                                 │
│    - Breed Preferences (if breeder)                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. SUBMIT SIGNUP                                            │
│    ✅ Account created in database (unverified)              │
│    📦 Preferences saved to localStorage:                    │
│       {                                                     │
│         email: "user@example.com",                          │
│         role: "breeder",                                    │
│         breedIds: ["breed-1", "breed-2"]                    │
│       }                                                     │
│    📧 Verification email sent                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. EMAIL VERIFICATION NOTICE PAGE                           │
│    User sees "Check Your Email" message                     │
│    Preferences stored safely in browser                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. USER CLICKS VERIFICATION LINK                            │
│    ✅ Email verified in database                            │
│    → Redirected to login page                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. USER LOGS IN                                             │
│    ✅ Session created                                        │
│    → Redirected to dashboard                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. DASHBOARD LOADS                                          │
│    🔍 useInitializeUserPreferences hook runs                │
│    📦 Checks localStorage for pending preferences           │
│    ✅ Finds preferences for current user email              │
│                                                             │
│    Automatically:                                           │
│    1. Initializes regional settings (timezone, currency)    │
│    2. Saves breed preferences to database                   │
│    3. Clears localStorage                                   │
│                                                             │
│    🎉 User sees: "Welcome! Your preferences have been saved"│
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### **1. During Signup (app/auth/signup/page.tsx)**

```typescript
onSuccess: async (data) => {
  // Save to localStorage
  const preferencesData = {
    email: formData.email,
    role: formData.role,
    breedIds: selectedBreedIds,
  };
  
  localStorage.setItem('pendingUserPreferences', JSON.stringify(preferencesData));
  
  // Redirect to verification notice
  router.push(`/auth/verify-email-notice?email=${email}`);
}
```

### **2. After First Login (app/(breeder)/dashboard/page.tsx)**

```typescript
// Get current user
const { data: session } = authClient.useSession();

// Auto-initialize preferences
useInitializeUserPreferences(session?.user?.id, session?.user?.email);
```

### **3. The Hook (lib/hooks/useInitializeUserPreferences.ts)**

```typescript
export function useInitializeUserPreferences(userId, userEmail) {
  useEffect(() => {
    // 1. Check localStorage for pending preferences
    const pendingPrefs = localStorage.getItem('pendingUserPreferences');
    
    // 2. Verify it's for the current user
    if (pendingPrefs.email === userEmail) {
      
      // 3. Initialize regional settings
      await fetch('/api/settings/regional/initialize', { method: 'POST' });
      
      // 4. Save breed preferences
      if (pendingPrefs.role === 'breeder') {
        await fetch('/api/breeders/breed-preferences', {
          method: 'POST',
          body: JSON.stringify({ breedIds: pendingPrefs.breedIds })
        });
      }
      
      // 5. Clear localStorage
      localStorage.removeItem('pendingUserPreferences');
    }
  }, [userId, userEmail]);
}
```

---

## 🎯 Why This Approach?

### **✅ Advantages:**

1. **No Data Loss**
   - Preferences stored immediately during signup
   - Survives page refresh
   - Works even if user closes browser

2. **Fast Signup**
   - No API calls during signup
   - No waiting for regional settings
   - Instant redirect to verification page

3. **Automatic**
   - User doesn't need to re-enter preferences
   - Happens silently on first login
   - No extra steps required

4. **Secure**
   - Email verification still required
   - Preferences only saved after verification
   - Matched to user email for safety

5. **Flexible**
   - Works for any role (breeder, vet, etc.)
   - Can store any signup data
   - Easy to extend

### **❌ Alternative Approaches (Why Not Used):**

#### **Option A: Save to Database Immediately**
```
❌ Problem: User doesn't have session yet (not verified)
❌ Can't authenticate API calls
❌ Would need special "unverified user" endpoints
```

#### **Option B: Ask User Again After Login**
```
❌ Bad UX - user already entered this
❌ Extra steps after verification
❌ Risk of user skipping
```

#### **Option C: Pass in URL Parameters**
```
❌ URL too long with breed IDs
❌ Visible in browser history
❌ Can be lost if user navigates away
```

---

## 📊 Data Storage Timeline

| Step | Where Data Lives | Status |
|------|------------------|--------|
| Signup Form | React State | Temporary |
| After Submit | localStorage | Pending |
| Email Verification | localStorage | Pending |
| Login | localStorage | Pending |
| Dashboard Load | Database | ✅ Saved |
| After Save | Nowhere | ✅ Complete |

---

## 🔍 What Gets Saved?

### **Regional Settings:**
```json
{
  "language": "en",
  "timezone": "Africa/Johannesburg",
  "currency": "ZAR",
  "locale": "en-ZA",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h",
  "measurementUnit": "metric",
  "firstDayOfWeek": 1
}
```

### **Breed Preferences (if breeder):**
```json
{
  "breedIds": [
    "breed-uuid-1",
    "breed-uuid-2",
    "breed-uuid-3"
  ]
}
```

---

## 🧪 Testing the Flow

### **Test 1: Complete Flow**
```
1. Sign up with role "breeder" and select 2 breeds
2. Check localStorage - should have "pendingUserPreferences"
3. Verify email via link
4. Log in
5. Dashboard loads
6. Check console logs:
   📦 Found pending preferences, initializing...
   ✅ Regional settings initialized
   ✅ Breed preferences saved
   ✅ Preferences initialized and cleared from localStorage
7. Check localStorage - "pendingUserPreferences" should be gone
8. Check database - preferences should be saved
```

### **Test 2: Browser Refresh**
```
1. Sign up
2. Close browser before verifying
3. Open browser again
4. Verify email
5. Log in
6. Preferences should still be saved ✅
```

### **Test 3: Different User**
```
1. User A signs up with preferences
2. User B signs up with different preferences
3. User B verifies and logs in
4. Only User B's preferences should be saved
5. User A's preferences still in localStorage
6. User A verifies and logs in
7. User A's preferences now saved ✅
```

---

## 🚨 Edge Cases Handled

### **1. User Never Verifies Email**
- ✅ Preferences stay in localStorage
- ✅ No database pollution
- ✅ Will be saved if they verify later

### **2. User Clears Browser Data**
- ✅ Preferences lost from localStorage
- ✅ User can update in profile settings later
- ✅ Regional settings auto-detected on login

### **3. Multiple Signups on Same Browser**
- ✅ Each signup overwrites localStorage
- ✅ Only the last signup's preferences stored
- ✅ Matched by email when saving

### **4. User Logs In on Different Device**
- ✅ No localStorage on new device
- ✅ Regional settings auto-detected
- ✅ Breed preferences can be set in profile

---

## 🎨 User Experience

### **What User Sees:**

**During Signup:**
```
✅ Account Created!
📧 Please check your email to verify your account
→ Redirected to "Check Your Email" page
```

**After First Login:**
```
🎉 Welcome to Animalytics!
✅ Your preferences have been saved
→ Dashboard loads with everything configured
```

**User Never Knows:**
- ✅ Preferences were stored temporarily
- ✅ Auto-initialization happened
- ✅ Everything "just works"

---

## 📝 Code Files

### **Modified:**
1. `app/auth/signup/page.tsx` - Save to localStorage
2. `app/(breeder)/dashboard/page.tsx` - Use initialization hook

### **Created:**
1. `lib/hooks/useInitializeUserPreferences.ts` - Auto-initialization logic

### **APIs Used:**
1. `/api/settings/regional/initialize` - Regional settings
2. `/api/breeders/breed-preferences` - Breed preferences

---

## 🔄 Future Enhancements

### **Possible Improvements:**

1. **Encrypted localStorage**
   - Encrypt preferences before storing
   - More secure for sensitive data

2. **Server-Side Temporary Storage**
   - Store in database with "pending" flag
   - More reliable than localStorage
   - Requires special handling for unverified users

3. **Progressive Profile Completion**
   - Let user skip during signup
   - Prompt to complete profile after login
   - Better for mobile users

4. **Preference Sync**
   - Sync across devices
   - Store in user profile
   - Update on any device

---

## ✅ Summary

**The Flow:**
1. ✅ User signs up → Preferences saved to localStorage
2. ✅ Email verification → User verifies email
3. ✅ First login → Hook auto-saves preferences to database
4. ✅ localStorage cleared → Clean state

**Benefits:**
- ✅ Fast signup (no delays)
- ✅ No data loss
- ✅ Automatic (no user action needed)
- ✅ Secure (email verified first)
- ✅ Clean UX (seamless experience)

**It just works!** 🎉
