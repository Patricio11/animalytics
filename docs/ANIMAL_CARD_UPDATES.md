# 🐕 Animal Card Display Updates - Registered Name Prominence

## Overview
Updated all animal cards and listing pages to display the **registered name prominently** instead of the call name, as the registered name is what matters for breeding, pedigree, and marketplace purposes.

---

## 🎯 **Design Philosophy**

### **Why Registered Name First?**
1. **Breeding Context** - Registered names are official and used in pedigrees
2. **Marketplace Listings** - Buyers/breeders need to see official names
3. **Professional Standards** - Kennel club registrations use registered names
4. **Pedigree Documentation** - All official documents use registered names
5. **Call Names are Personal** - Only owners use call names in daily life

### **Display Hierarchy:**
```
┌─────────────────────────────────┐
│  CH MIGHTY MAX OF CHAMPIONS     │ ← Registered Name (PROMINENT)
│  Call name: Max                 │ ← Call Name (Subtle, italic)
│  German Shepherd • Male         │ ← Breed & Sex
└─────────────────────────────────┘
```

---

## ✅ **Files Updated**

### **1. Marketplace Animal Card**
**File:** `components/breeder/marketplace/AnimalCard.tsx`

**Changes:**
- Added `registeredName?: string` to interface
- Main title shows: `{animal.registeredName || animal.name}`
- Call name shown below in smaller, italic text
- Only shows call name if both names exist

**Display:**
```tsx
<h3 className="text-lg font-bold">
  {animal.registeredName || animal.name}
</h3>
{animal.registeredName && animal.name && (
  <p className="text-sm text-muted-foreground italic">
    Call name: {animal.name}
  </p>
)}
```

---

### **2. Breeder's Animal Card**
**File:** `components/breeder/AnimalCard.tsx`

**Changes:**
- Added `registeredName?: string` to interface
- Main title shows: `{registeredName || name}`
- Call name shown below in smaller, italic text
- Maintains all existing functionality (edit, share, status badges)

**Display:**
```tsx
<h3 className="font-semibold text-xl">
  {registeredName || name}
</h3>
{registeredName && name && (
  <p className="text-xs text-muted-foreground italic">
    Call name: {name}
  </p>
)}
```

---

### **3. General Animal Card**
**File:** `components/animals/AnimalCard.tsx`

**Changes:**
- Added `registeredName?: string` to interface
- Main title shows: `{registeredName || name}`
- Call name shown below in smaller, italic text
- Works with titles, badges, and health status

**Display:**
```tsx
<h3 className="font-bold text-lg">
  {registeredName || name}
</h3>
{registeredName && name && (
  <p className="text-xs text-muted-foreground italic mb-2">
    Call name: {name}
  </p>
)}
```

---

### **4. Single Listing Page**
**File:** `app/marketplace/[id]/page.tsx`

**Changes:**
- Updated animal details section
- Registered name shown **larger and bold** (text-lg font-bold)
- Label changes based on which name is available
- Call name shown below in italic
- Spans full width (col-span-2)

**Display:**
```tsx
<div className="col-span-2">
  <div className="text-sm text-muted-foreground">
    {listing.animal?.registeredName ? 'Registered Name' : 'Animal Name'}
  </div>
  <div className="font-bold text-lg text-foreground">
    {listing.animal.registeredName || listing.animal.name}
  </div>
  {listing.animal?.registeredName && listing.animal?.name && (
    <div className="text-sm text-muted-foreground italic mt-1">
      Call name: {listing.animal.name}
    </div>
  )}
</div>
```

---

## 🎨 **Visual Hierarchy**

### **Before:**
```
Max                          ← Call name (prominent)
German Shepherd • Male
```

### **After:**
```
CH MIGHTY MAX OF CHAMPIONS   ← Registered name (prominent, bold)
Call name: Max               ← Call name (subtle, italic)
German Shepherd • Male
```

---

## 📊 **Display Logic**

### **Scenario 1: Both Names Present**
```
Registered Name: CH MIGHTY MAX OF CHAMPIONS
Call Name: Max

Display:
  CH MIGHTY MAX OF CHAMPIONS
  Call name: Max
```

### **Scenario 2: Only Registered Name**
```
Registered Name: CH MIGHTY MAX OF CHAMPIONS
Call Name: (none)

Display:
  CH MIGHTY MAX OF CHAMPIONS
```

### **Scenario 3: Only Call Name**
```
Registered Name: (none)
Call Name: Max

Display:
  Max
```

---

## 🎯 **User Experience Benefits**

### **For Marketplace Visitors:**
✅ **Immediate Recognition** - See official registered names first
✅ **Professional Appearance** - Matches kennel club standards
✅ **Breeding Decisions** - Can identify champion lines quickly
✅ **Pedigree Verification** - Easy to cross-reference with documents

### **For Breeders:**
✅ **Consistency** - All cards show same hierarchy
✅ **Professionalism** - Marketplace looks more official
✅ **Clarity** - Clear distinction between official and personal names
✅ **Flexibility** - Still shows call names for context

### **For Owners:**
✅ **Both Names Visible** - Don't lose call name information
✅ **Clear Labels** - "Call name:" prefix makes it obvious
✅ **Subtle Design** - Call name doesn't compete with registered name
✅ **Optional** - If no registered name, call name is still prominent

---

## 🔧 **Technical Implementation**

### **Interface Updates:**
All three card components now include:
```typescript
interface AnimalCardProps {
  // ... other props
  name: string;              // Call name (required)
  registeredName?: string;   // Registered name (optional)
  // ... other props
}
```

### **Backward Compatibility:**
✅ **Fallback Logic** - If no registered name, shows call name
✅ **Optional Field** - Registered name is optional
✅ **No Breaking Changes** - Existing code continues to work
✅ **Graceful Degradation** - Works with partial data

---

## 📝 **Styling Details**

### **Registered Name:**
- **Font Size:** `text-lg` to `text-xl` (larger)
- **Font Weight:** `font-bold` or `font-semibold`
- **Color:** `text-foreground` (full contrast)
- **Hover:** `hover:text-primary` (interactive feedback)

### **Call Name:**
- **Font Size:** `text-xs` to `text-sm` (smaller)
- **Font Weight:** Normal
- **Font Style:** `italic`
- **Color:** `text-muted-foreground` (subtle)
- **Prefix:** "Call name: " for clarity

---

## 🎉 **Summary**

### **What Changed:**
✅ Registered name is now the **primary display** on all cards
✅ Call name shown as **secondary information** (italic, smaller)
✅ Clear visual hierarchy matches **breeding industry standards**
✅ Works across **all card types** (marketplace, breeder, general)
✅ Enhanced **single listing page** with prominent registered name

### **Impact:**
- **Better UX** for marketplace visitors and breeders
- **Professional appearance** matching kennel club standards
- **Clear information hierarchy** for breeding decisions
- **Backward compatible** with existing data
- **Flexible** - works with or without registered names

### **Files Modified:** 4
1. `components/breeder/marketplace/AnimalCard.tsx`
2. `components/breeder/AnimalCard.tsx`
3. `components/animals/AnimalCard.tsx`
4. `app/marketplace/[id]/page.tsx`

---

**Perfect for professional breeders and marketplace users!** 🐕✨
