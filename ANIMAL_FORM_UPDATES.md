# Animal Form Updates - DND Profile Number & Owner Selection

## 📋 Overview
Updated the animal creation and editing forms to add DND Profile Number field in Step 3 (Registration & Parentage) and removed the "Select from system" option for Owner section.

---

## ✅ Changes Implemented

### **1. Database Schema** ✅
**File:** `lib/db/schema/animals.ts`

**Added Field:**
```typescript
dndProfileNumber: text('dnd_profile_number'), // DND profile number
```

**Location:** After `registrationNumber` field (line 67)

---

### **2. API Routes** ✅

#### **Create Animal API**
**File:** `app/api/animals/route.ts`

**Changes:**
- ✅ Added `dndProfileNumber: z.string().optional()` to `createAnimalSchema`
- ✅ Added `dndProfileNumber: validatedData.dndProfileNumber` to insert values

#### **Update Animal API**
**File:** `app/api/animals/[id]/route.ts`

**Changes:**
- ✅ Added `dndProfileNumber: z.string().optional()` to `updateAnimalSchema`
- ✅ Added `if (validatedData.dndProfileNumber !== undefined) updateData.dndProfileNumber = validatedData.dndProfileNumber;` to update mapping

---

### **3. Add Animal Dialog** ✅
**File:** `components/breeder/animals/AddAnimalDialog.tsx`

**Changes:**

#### **Interface Update:**
```typescript
interface AnimalFormData {
  // Step 3: Registration & Parentage
  microchipId: string;
  registrationNumber: string;
  dndProfileNumber: string; // ✅ NEW FIELD
  
  // Owner information
  ownerMode: 'self' | 'select' | 'manual'; // ❌ Removed 'select' option
  ...
}
```

#### **Form State:**
- ✅ Added `dndProfileNumber: ""` to initial state
- ✅ Added `dndProfileNumber: ""` to reset state after submission

#### **Step 3 UI Changes:**
```tsx
{/* Registration Numbers - Grid Layout */}
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="microchipId">Microchip ID</Label>
    <Input ... />
  </div>

  <div className="space-y-2">
    <Label htmlFor="registrationNumber">Registration Number</Label>
    <Input ... />
  </div>

  {/* ✅ NEW FIELD */}
  <div className="space-y-2">
    <Label htmlFor="dndProfileNumber">DND Profile No.</Label>
    <Input
      id="dndProfileNumber"
      value={formData.dndProfileNumber}
      onChange={(e) => updateFormData("dndProfileNumber", e.target.value)}
      placeholder="DND profile number"
      className="bg-background border-primary/20"
    />
  </div>
</div>
```

#### **Owner Section Changes:**
```tsx
{/* ❌ REMOVED "Select from system" option */}
<RadioGroup 
  value={formData.ownerMode} 
  onValueChange={(value: 'self' | 'manual') => { // Changed from 'self' | 'select' | 'manual'
    updateFormData("ownerMode", value);
    if (value === 'self') {
      updateFormData("ownerName", "");
      updateFormData("ownerRegistrationNumber", "");
    }
  }}
>
  <div className="flex gap-4">
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="self" id="owner-self" />
      <Label htmlFor="owner-self">I am the owner</Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="manual" id="owner-manual" />
      <Label htmlFor="owner-manual">Enter manually</Label>
    </div>
    {/* ❌ REMOVED: Select from system option */}
  </div>
</RadioGroup>

{/* ❌ REMOVED: Conditional rendering for 'select' mode */}
```

---

### **4. Edit Animal Dialog** ✅
**File:** `components/breeder/animals/EditAnimalDialogMultiStep.tsx`

**Changes:** (Same as Add Animal Dialog)

#### **Interface Update:**
```typescript
interface AnimalFormData {
  // Step 3: Registration & Parentage
  microchipId: string;
  registrationNumber: string;
  dndProfileNumber: string; // ✅ NEW FIELD
  
  // Owner information
  ownerMode: 'self' | 'select' | 'manual'; // ❌ Removed 'select' option
  ...
}
```

#### **Form State:**
- ✅ Added `dndProfileNumber: ""` to initial state
- ✅ Added `dndProfileNumber: animalData.dndProfileNumber || ""` to pre-fill logic
- ✅ Added `dndProfileNumber: ""` to reset state after submission

#### **Step 3 UI Changes:**
- ✅ Added DND Profile Number input field (same as Add Animal Dialog)
- ✅ Removed "Select from system" option for Owner section
- ✅ Updated RadioGroup type from `'self' | 'select' | 'manual'` to `'self' | 'manual'`

---

## 🎨 UI Layout

### **Step 3: Registration & Parentage**

```
┌─────────────────────────────────────────────────┐
│ Registration & Parentage                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │ Microchip ID     │  │ Registration No. │   │
│  │ [____________]   │  │ [____________]   │   │
│  └──────────────────┘  └──────────────────┘   │
│                                                 │
│  ┌──────────────────┐                          │
│  │ DND Profile No.  │  ✅ NEW FIELD            │
│  │ [____________]   │                          │
│  └──────────────────┘                          │
│                                                 │
│  ┌─── Breeder ──────────────────────────────┐  │
│  │ ○ I am the breeder                       │  │
│  │ ○ Select from system                     │  │
│  │ ○ Enter manually                         │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌─── Owner ────────────────────────────────┐  │
│  │ ○ I am the owner                         │  │
│  │ ○ Enter manually                         │  │
│  │ ❌ REMOVED: Select from system           │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 📊 Field Details

### **DND Profile Number**
- **Label:** "DND Profile No."
- **Placeholder:** "DND profile number"
- **Type:** Text input
- **Required:** No (optional)
- **Location:** Step 3, after Registration Number
- **Grid:** 2 columns (spans 1 column)

### **Owner Mode**
- **Options:**
  - ✅ "I am the owner" (self)
  - ✅ "Enter manually" (manual)
  - ❌ ~~"Select from system"~~ (removed)
- **Type:** Radio group
- **Default:** "self"

---

## 🔄 Data Flow

### **Create Animal:**
```typescript
// Frontend Form Data
{
  microchipId: "123456789",
  registrationNumber: "AKC-123",
  dndProfileNumber: "DND-456", // ✅ NEW
  ownerMode: "self" | "manual", // ❌ No 'select'
  ...
}

// API Request
POST /api/animals
{
  microchipNumber: "123456789",
  registrationNumber: "AKC-123",
  dndProfileNumber: "DND-456", // ✅ NEW
  ownerMode: "self" | "manual",
  ...
}

// Database Insert
INSERT INTO animals (
  microchip_number,
  registration_number,
  dnd_profile_number, -- ✅ NEW
  owner_id,
  owner_name,
  ...
)
```

### **Update Animal:**
```typescript
// Frontend Form Data
{
  dndProfileNumber: "DND-789", // ✅ Can be updated
  ownerMode: "manual",
  ownerName: "John Doe",
  ...
}

// API Request
PATCH /api/animals/[id]
{
  dndProfileNumber: "DND-789", // ✅ NEW
  ownerMode: "manual",
  ownerName: "John Doe",
  ...
}

// Database Update
UPDATE animals
SET dnd_profile_number = 'DND-789', -- ✅ NEW
    owner_name = 'John Doe',
    ...
WHERE id = '...'
```

---

## 🗄️ Database Migration

**Note:** You'll need to run a database migration to add the `dnd_profile_number` column to the `animals` table.

### **Migration SQL:**
```sql
-- Add dnd_profile_number column to animals table
ALTER TABLE animals 
ADD COLUMN dnd_profile_number TEXT;

-- Optional: Add index if needed for searching
CREATE INDEX idx_animals_dnd_profile_number 
ON animals(dnd_profile_number);
```

### **Using Drizzle:**
```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate
```

---

## 📝 Files Modified

| File | Changes |
|------|---------|
| `lib/db/schema/animals.ts` | Added `dndProfileNumber` field |
| `app/api/animals/route.ts` | Added to schema & insert |
| `app/api/animals/[id]/route.ts` | Added to schema & update |
| `components/breeder/animals/AddAnimalDialog.tsx` | Added field, removed owner select |
| `components/breeder/animals/EditAnimalDialogMultiStep.tsx` | Added field, removed owner select |

---

## ✅ Testing Checklist

- [ ] Create new animal with DND Profile Number
- [ ] Create new animal without DND Profile Number (optional field)
- [ ] Edit existing animal to add DND Profile Number
- [ ] Edit existing animal to update DND Profile Number
- [ ] Verify Owner section only shows "I am the owner" and "Enter manually"
- [ ] Verify "Select from system" option is removed for Owner
- [ ] Verify Breeder section still has all 3 options (self, select, manual)
- [ ] Verify form validation works correctly
- [ ] Verify data persists correctly in database
- [ ] Run database migration successfully

---

## 🎉 Summary

**Implemented:**
1. ✅ Added DND Profile Number field to Step 3 (Registration & Parentage)
2. ✅ Removed "Select from system" option for Owner section
3. ✅ Updated database schema with `dnd_profile_number` column
4. ✅ Updated API routes to handle new field
5. ✅ Updated both Add and Edit animal dialogs
6. ✅ Maintained Breeder section with all 3 options (self, select, manual)

**Result:** Users can now enter DND Profile Numbers when creating or editing animals, and the Owner section is simplified to only "I am the owner" or "Enter manually" options! 🐕✨
