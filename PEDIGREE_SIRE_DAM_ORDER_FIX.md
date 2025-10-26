# Pedigree Tree Layout Fix - SIRE/DAM Order
**Date:** October 26, 2025  
**Issue:** SIRE and DAM positions were reversed in pedigree trees

---

## Problem Description

The user reported that in the Three Generation Pedigree, the positions of SIRE (father) and DAM (mother) were opposite to the standard breeding convention:

**Before (Incorrect):**
- DAM (mother) was on top
- SIRE (father) was on bottom

**Required (Correct):**
- SIRE (father) must be on top
- DAM (mother) must be on bottom

This needed to be consistent across **ALL** pedigree tree views and **ALL** generations.

---

## Standard Breeding Convention

In professional pedigree certificates and breeding records:
- **SIRE (Father/Male)** is always listed **FIRST** (top position)
- **DAM (Mother/Female)** is always listed **SECOND** (bottom position)

This convention applies to:
- Generation 1: Parents
- Generation 2: Grandparents
- Generation 3: Great Grandparents
- All subsequent generations

---

## Files Modified

### 1. **PedigreeTreeHorizontal.tsx** (Horizontal Certificate View)
**File:** `components/breeder/animals/PedigreeTreeHorizontal.tsx`

This is the main pedigree certificate view shown to users.

#### Generation 1 - Parents (Lines 156-168)
**Before:**
```typescript
<div className="col-span-1 flex flex-col justify-center gap-8">
  <div className="relative">
    <PedigreeCard animal={node.dam} generation={1} position="dam" label="DAM" />
  </div>
  <div className="relative">
    <PedigreeCard animal={node.sire} generation={1} position="sire" label="SIRE" />
  </div>
</div>
```

**After:**
```typescript
<div className="col-span-1 flex flex-col justify-center gap-8">
  <div className="relative">
    <PedigreeCard animal={node.sire} generation={1} position="sire" label="SIRE" />
  </div>
  <div className="relative">
    <PedigreeCard animal={node.dam} generation={1} position="dam" label="DAM" />
  </div>
</div>
```

#### Generation 2 - Grandparents (Lines 170-190)
**Before:**
```typescript
{/* Dam's parents */}
<PedigreeCard animal={node.dam?.dam} label="GRANDDAM" />
<PedigreeCard animal={node.dam?.sire} label="GRANDSIRE" />
{/* Sire's parents */}
<PedigreeCard animal={node.sire?.dam} label="GRANDDAM" />
<PedigreeCard animal={node.sire?.sire} label="GRANDSIRE" />
```

**After:**
```typescript
{/* Sire's parents */}
<PedigreeCard animal={node.sire?.sire} label="GRANDSIRE" />
<PedigreeCard animal={node.sire?.dam} label="GRANDDAM" />
{/* Dam's parents */}
<PedigreeCard animal={node.dam?.sire} label="GRANDSIRE" />
<PedigreeCard animal={node.dam?.dam} label="GRANDDAM" />
```

#### Generation 3 - Great Grandparents (Lines 192-230)
**Before:**
```typescript
{/* Dam's Dam's parents */}
<PedigreeCard animal={node.dam?.dam?.dam} compact />
<PedigreeCard animal={node.dam?.dam?.sire} compact />
{/* Dam's Sire's parents */}
<PedigreeCard animal={node.dam?.sire?.dam} compact />
<PedigreeCard animal={node.dam?.sire?.sire} compact />
{/* Sire's Dam's parents */}
<PedigreeCard animal={node.sire?.dam?.dam} compact />
<PedigreeCard animal={node.sire?.dam?.sire} compact />
{/* Sire's Sire's parents */}
<PedigreeCard animal={node.sire?.sire?.dam} compact />
<PedigreeCard animal={node.sire?.sire?.sire} compact />
```

**After:**
```typescript
{/* Sire's Sire's parents */}
<PedigreeCard animal={node.sire?.sire?.sire} compact />
<PedigreeCard animal={node.sire?.sire?.dam} compact />
{/* Sire's Dam's parents */}
<PedigreeCard animal={node.sire?.dam?.sire} compact />
<PedigreeCard animal={node.sire?.dam?.dam} compact />
{/* Dam's Sire's parents */}
<PedigreeCard animal={node.dam?.sire?.sire} compact />
<PedigreeCard animal={node.dam?.sire?.dam} compact />
{/* Dam's Dam's parents */}
<PedigreeCard animal={node.dam?.dam?.sire} compact />
<PedigreeCard animal={node.dam?.dam?.dam} compact />
```

---

### 2. **PedigreeCertificatePDF.tsx** (PDF Export)
**File:** `components/breeder/animals/PedigreeCertificatePDF.tsx`

This component generates the downloadable PDF certificate.

#### Generation 1 - Parents (Lines 101-112)
**Before:**
```typescript
<PedigreeCardPDF animal={node.dam} label="DAM (Mother)" />
<PedigreeCardPDF animal={node.sire} label="SIRE (Father)" />
```

**After:**
```typescript
<PedigreeCardPDF animal={node.sire} label="SIRE (Father)" />
<PedigreeCardPDF animal={node.dam} label="DAM (Mother)" />
```

#### Generation 2 - Grandparents (Lines 114-123)
**Before:**
```typescript
<PedigreeCardPDF animal={node.dam?.dam} label="GRANDDAM" compact />
<PedigreeCardPDF animal={node.dam?.sire} label="GRANDSIRE" compact />
<PedigreeCardPDF animal={node.sire?.dam} label="GRANDDAM" compact />
<PedigreeCardPDF animal={node.sire?.sire} label="GRANDSIRE" compact />
```

**After:**
```typescript
<PedigreeCardPDF animal={node.sire?.sire} label="GRANDSIRE" compact />
<PedigreeCardPDF animal={node.sire?.dam} label="GRANDDAM" compact />
<PedigreeCardPDF animal={node.dam?.sire} label="GRANDSIRE" compact />
<PedigreeCardPDF animal={node.dam?.dam} label="GRANDDAM" compact />
```

#### Generation 3 - Great Grandparents (Lines 125-138)
**Before:**
```typescript
<PedigreeCardPDF animal={node.dam?.dam?.dam} compact />
<PedigreeCardPDF animal={node.dam?.dam?.sire} compact />
<PedigreeCardPDF animal={node.dam?.sire?.dam} compact />
<PedigreeCardPDF animal={node.dam?.sire?.sire} compact />
<PedigreeCardPDF animal={node.sire?.dam?.dam} compact />
<PedigreeCardPDF animal={node.sire?.dam?.sire} compact />
<PedigreeCardPDF animal={node.sire?.sire?.dam} compact />
<PedigreeCardPDF animal={node.sire?.sire?.sire} compact />
```

**After:**
```typescript
<PedigreeCardPDF animal={node.sire?.sire?.sire} compact />
<PedigreeCardPDF animal={node.sire?.sire?.dam} compact />
<PedigreeCardPDF animal={node.sire?.dam?.sire} compact />
<PedigreeCardPDF animal={node.sire?.dam?.dam} compact />
<PedigreeCardPDF animal={node.dam?.sire?.sire} compact />
<PedigreeCardPDF animal={node.dam?.sire?.dam} compact />
<PedigreeCardPDF animal={node.dam?.dam?.sire} compact />
<PedigreeCardPDF animal={node.dam?.dam?.dam} compact />
```

---

### 3. **PedigreeTree.tsx** (Vertical Family Tree View)
**File:** `components/breeder/animals/PedigreeTree.tsx`

This is the vertical/traditional family tree view.

#### Row Building Logic (Lines 40-48)
**Before:**
```typescript
prevRow.forEach((node) => {
  if (node) {
    currentRow.push(node.dam ?? null);  // ❌ DAM first
    currentRow.push(node.sire ?? null); // ❌ SIRE second
  } else {
    currentRow.push(null);
    currentRow.push(null);
  }
});
```

**After:**
```typescript
prevRow.forEach((node) => {
  if (node) {
    currentRow.push(node.sire ?? null); // ✅ SIRE first
    currentRow.push(node.dam ?? null);  // ✅ DAM second
  } else {
    currentRow.push(null);
    currentRow.push(null);
  }
});
```

**Impact:** This change affects **ALL** generations in the vertical tree view, as the algorithm recursively builds each generation based on the previous one.

---

## Visual Representation

### Horizontal Pedigree Certificate (Before vs After)

**Before (Incorrect):**
```
┌─────────┐
│ Subject │
└─────────┘
     │
     ├──────────────────────────────────────┐
     │                                      │
┌─────────┐                          ┌─────────┐
│   DAM   │ ❌ (Mother on top)       │ GRANDDAM│
└─────────┘                          └─────────┘
     │                                      │
┌─────────┐                          ┌─────────┐
│  SIRE   │ ❌ (Father on bottom)    │GRANDSIRE│
└─────────┘                          └─────────┘
```

**After (Correct):**
```
┌─────────┐
│ Subject │
└─────────┘
     │
     ├──────────────────────────────────────┐
     │                                      │
┌─────────┐                          ┌─────────┐
│  SIRE   │ ✅ (Father on top)       │GRANDSIRE│
└─────────┘                          └─────────┘
     │                                      │
┌─────────┐                          ┌─────────┐
│   DAM   │ ✅ (Mother on bottom)    │ GRANDDAM│
└─────────┘                          └─────────┘
```

### Vertical Family Tree (Before vs After)

**Before (Incorrect):**
```
Generation 0: [Subject]
Generation 1: [DAM, SIRE] ❌
Generation 2: [DAM's DAM, DAM's SIRE, SIRE's DAM, SIRE's SIRE] ❌
```

**After (Correct):**
```
Generation 0: [Subject]
Generation 1: [SIRE, DAM] ✅
Generation 2: [SIRE's SIRE, SIRE's DAM, DAM's SIRE, DAM's DAM] ✅
```

---

## Pattern Applied Across All Generations

The fix follows this consistent pattern:

### For Each Animal's Parents:
1. **SIRE** (father) - Always first/top
2. **DAM** (mother) - Always second/bottom

### For Each Generation Level:
1. **SIRE's lineage** - Always first/top half
2. **DAM's lineage** - Always second/bottom half

### Example for Generation 2 (Grandparents):
```
1. SIRE's SIRE (Paternal Grandfather)
2. SIRE's DAM (Paternal Grandmother)
3. DAM's SIRE (Maternal Grandfather)
4. DAM's DAM (Maternal Grandmother)
```

### Example for Generation 3 (Great Grandparents):
```
1. SIRE's SIRE's SIRE
2. SIRE's SIRE's DAM
3. SIRE's DAM's SIRE
4. SIRE's DAM's DAM
5. DAM's SIRE's SIRE
6. DAM's SIRE's DAM
7. DAM's DAM's SIRE
8. DAM's DAM's DAM
```

---

## Testing Checklist

### Visual Verification:
- ✅ Generation 1: SIRE on top, DAM on bottom
- ✅ Generation 2: SIRE's parents before DAM's parents
- ✅ Generation 3: Correct order maintained
- ✅ Horizontal view matches vertical view
- ✅ PDF export matches screen view

### Functional Testing:
- ✅ Click "Edit Parents" - correct animals appear
- ✅ Add manual entry - appears in correct position
- ✅ Download PDF - correct order in certificate
- ✅ Switch between horizontal/vertical views - consistent order

### Data Integrity:
- ✅ No data loss during reordering
- ✅ All relationships preserved
- ✅ Manual entries maintain position
- ✅ External pedigree imports work correctly

---

## Impact Analysis

### Components Affected:
1. ✅ **PedigreeTreeHorizontal.tsx** - Main certificate view
2. ✅ **PedigreeCertificatePDF.tsx** - PDF export
3. ✅ **PedigreeTree.tsx** - Vertical tree view

### User-Facing Changes:
- ✅ Pedigree certificates now follow standard breeding convention
- ✅ Consistent across all views (horizontal, vertical, PDF)
- ✅ Easier to read and understand lineage
- ✅ Professional appearance for sharing/printing

### Breaking Changes:
- ❌ None - This is a visual reordering only
- ❌ No database changes required
- ❌ No API changes required
- ❌ Existing pedigree data unchanged

---

## Why This Matters

### Professional Standards:
- Breeding organizations worldwide use SIRE-first convention
- Kennel clubs require this format for official pedigrees
- Industry standard for over 100 years

### User Benefits:
- **Consistency:** Matches printed pedigree certificates
- **Clarity:** Easier to trace paternal vs maternal lines
- **Professional:** Suitable for official documentation
- **Universal:** Recognized globally in breeding community

### Examples of Organizations Using This Standard:
- American Kennel Club (AKC)
- The Kennel Club (UK)
- Fédération Cynologique Internationale (FCI)
- United Kennel Club (UKC)
- All major breed registries worldwide

---

## Summary

### Problem:
Pedigree trees showed DAM (mother) on top and SIRE (father) on bottom, which is opposite to breeding industry standards.

### Solution:
Swapped the order in all three pedigree components to show SIRE first (top) and DAM second (bottom) across all generations.

### Files Changed:
1. ✅ `PedigreeTreeHorizontal.tsx` - 3 edits (Gen 1, 2, 3)
2. ✅ `PedigreeCertificatePDF.tsx` - 3 edits (Gen 1, 2, 3)
3. ✅ `PedigreeTree.tsx` - 1 edit (algorithm fix affects all generations)

### Result:
✅ All pedigree views now follow professional breeding standards  
✅ SIRE (father) always appears first/top  
✅ DAM (mother) always appears second/bottom  
✅ Consistent across horizontal, vertical, and PDF views  
✅ Applies to all generations (1, 2, 3, and beyond)  

---

**Fix Completed:** October 26, 2025  
**Status:** ✅ IMPLEMENTED  
**Tested:** ✅ All three pedigree views  
**Standard Compliance:** ✅ Follows industry convention
