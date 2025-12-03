# Location Pre-population from Regional Settings

## 📋 Overview
Updated the system to store actual location data (city, region/state, country) in user preferences during registration. This location is then used to pre-populate the animal location field in Add/Edit dialogs - **no API calls needed, no guessing!**

---

## ✅ Changes Implemented

### **1. Updated User Preferences Schema** ✅

**File:** `lib/db/schema/users.ts`

**Added Location Fields:**
```typescript
preferences: jsonb('preferences').$type<{
  // ... existing fields
  // Location data (detected during registration)
  country?: string;      // Full country name: 'South Africa', 'United States'
  countryCode?: string;  // ISO 3166-1 alpha-2: 'ZA', 'US', 'GB'
  city?: string;         // City name: 'Johannesburg', 'New York'
  region?: string;       // State/Province: 'Gauteng', 'New York', 'California'
}>()
```

**Data Source:** IP-based location detection during registration (via ipapi.co)

---

### **2. Updated Regional Settings Initialization** ✅

**File:** `app/api/settings/regional/initialize/route.ts`

**Changes:**
- Now saves location data from IP detection to user preferences
- Location includes: `country`, `countryCode`, `city`, `region`

**Example Data Saved:**
```json
{
  "country": "South Africa",
  "countryCode": "ZA",
  "city": "Johannesburg",
  "region": "Gauteng",
  "timezone": "Africa/Johannesburg",
  "currency": "ZAR",
  "locale": "en-ZA"
}
```

---

### **3. Updated Regional Settings Context** ✅

**File:** `lib/contexts/regional-settings-context.tsx`

**Added to Interface:**
```typescript
export interface RegionalSettings {
  // ... existing fields
  // Location data
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
}
```

**Loaded from API:** Location data is fetched with other regional settings when user logs in

---

### **4. Updated AddAnimalDialog** ✅

**File:** `components/breeder/animals/AddAnimalDialog.tsx`

**Changes:**
- ❌ Removed `useBreederProfile` hook (no longer needed)
- ✅ Added `useRegionalSettings` hook
- ✅ Pre-populates location from regional settings

**Implementation:**
```typescript
// Get regional settings for location pre-population
const { settings: regionalSettings } = useRegionalSettings();

// Pre-populate location from regional settings when dialog opens
useEffect(() => {
  if (open && !formData.location) {
    // Build location string from regional settings
    const locationParts = [];
    if (regionalSettings.city) locationParts.push(regionalSettings.city);
    if (regionalSettings.region) locationParts.push(regionalSettings.region);
    if (regionalSettings.country) locationParts.push(regionalSettings.country);
    
    const locationString = locationParts.join(', ');
    if (locationString) {
      setFormData(prev => ({ ...prev, location: locationString }));
      console.log('📍 Pre-populated location from regional settings:', locationString);
    }
  }
}, [open, regionalSettings, formData.location]);
```

---

### **5. Updated EditAnimalDialogMultiStep** ✅

**File:** `components/breeder/animals/EditAnimalDialogMultiStep.tsx`

**Changes:**
- ❌ Removed `useBreederProfile` hook (no longer needed)
- ✅ Added `useRegionalSettings` hook
- ✅ Falls back to regional settings location if animal has no location

**Implementation:**
```typescript
// Get regional settings for location pre-population
const { settings: regionalSettings } = useRegionalSettings();

// In pre-fill logic:
location: animalData.location || (() => {
  // Build location string from regional settings if animal has no location
  const locationParts = [];
  if (regionalSettings.city) locationParts.push(regionalSettings.city);
  if (regionalSettings.region) locationParts.push(regionalSettings.region);
  if (regionalSettings.country) locationParts.push(regionalSettings.country);
  return locationParts.join(', ');
})()
```

---

## 🔄 Data Flow

### **Registration Flow:**
```
1. User signs up
2. IP address detected
3. Location API called (ipapi.co)
4. Returns: country, countryCode, city, region, timezone
5. Saved to user.preferences in database
6. User logs in → Regional settings loaded
```

### **Add Animal Flow:**
```
1. User opens Add Animal dialog
2. Regional settings already loaded (from login)
3. Location pre-filled: "City, Region, Country"
4. User can edit or keep it
5. Saved to animal.location
```

### **Edit Animal Flow:**
```
1. User opens Edit Animal dialog
2. If animal.location exists → use it
3. If animal.location is empty → use regional settings location
4. User can edit it
```

---

## 📊 Location Format Examples

| Regional Settings | Pre-populated Location |
|-------------------|------------------------|
| `{ city: "Johannesburg", region: "Gauteng", country: "South Africa" }` | "Johannesburg, Gauteng, South Africa" |
| `{ city: "New York", region: "New York", country: "United States" }` | "New York, New York, United States" |
| `{ city: "London", country: "United Kingdom" }` | "London, United Kingdom" |
| `{ country: "Canada" }` | "Canada" |
| `{}` (no location data) | "" (empty) |

---

## 🎯 Benefits

### **Accuracy:**
- ✅ **Real location data** from IP detection during registration
- ✅ **No guessing** from timezone
- ✅ **User can verify/edit** during registration or later in settings

### **Performance:**
- ✅ **No API calls** when adding animals
- ✅ **Data already loaded** with regional settings
- ✅ **Instant pre-population**

### **International Support:**
- ✅ Works for **all countries**
- ✅ Detects **city, region, country** accurately
- ✅ Respects **user's actual location**

---

## 🐛 Debugging

### **Check User's Location Data:**

1. **Open Browser Console** (F12)
2. **Check Regional Settings:**
```
📊 Regional settings response: 
{
  data: {
    locale: 'en-ZA',
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
    country: 'South Africa',
    countryCode: 'ZA',
    city: 'Johannesburg',
    region: 'Gauteng'
  }
}
```

3. **Open Add Animal Dialog**
4. **Go to Step 4**
5. **Check if location is pre-filled**

### **Console Logs:**
```
📍 Pre-populated location from regional settings: Johannesburg, Gauteng, South Africa
```

### **Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Location not pre-populating | User registered before this update | User can manually enter location |
| Location is wrong | IP detection was inaccurate | User can edit in settings or per animal |
| No location data | Registration failed to detect location | User can manually enter location |
| Only country, no city | IP detection only found country | Normal - some IPs only resolve to country |

---

## 🔧 Files Modified

| File | Changes |
|------|---------|
| `lib/db/schema/users.ts` | ✅ Added location fields to preferences |
| `app/api/settings/regional/initialize/route.ts` | ✅ Save location data during registration |
| `lib/contexts/regional-settings-context.tsx` | ✅ Added location to interface & loading |
| `components/breeder/animals/AddAnimalDialog.tsx` | ✅ Use regional settings for location |
| `components/breeder/animals/EditAnimalDialogMultiStep.tsx` | ✅ Use regional settings for location |

---

## 🗑️ Files Removed/Deprecated

| File | Status |
|------|--------|
| `app/api/breeder-profile/me/route.ts` | ❌ Can be removed (not used) |
| `lib/hooks/useBreederProfile.ts` | ❌ Can be removed (not used) |
| `lib/utils/timezone-to-location.ts` | ❌ Can be removed (not needed) |

---

## ✅ Testing Checklist

### **For Existing Users:**
- [ ] Location field may be empty (registered before update)
- [ ] Can manually enter location
- [ ] Location saves correctly

### **For New Users (After This Update):**
- [ ] Register new account
- [ ] Check regional settings include location
- [ ] Open Add Animal dialog
- [ ] Verify location is pre-filled in Step 4
- [ ] Verify location format is correct
- [ ] Edit location and verify it saves

### **International Testing:**
- [ ] Test from different countries
- [ ] Verify correct location detection
- [ ] Verify location format is user-friendly

---

## 🎉 Summary

**Before:**
- ❌ Made API call to fetch breeder profile
- ❌ Tried to guess location from timezone
- ❌ Not accurate for international users

**After:**
- ✅ Location detected during registration (IP-based)
- ✅ Stored in user preferences
- ✅ Loaded with regional settings (no extra API call)
- ✅ Accurate for all international users
- ✅ User can verify/edit if needed

**Result:** Accurate, fast, and international-friendly location pre-population! 🌍✨
