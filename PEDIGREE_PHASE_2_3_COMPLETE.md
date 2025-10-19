# Pedigree Feature - Phase 2 & 3: Backend API Routes & Utility Functions ✅

**Status**: Complete  
**Date**: January 2025

---

## Overview

Successfully implemented all backend API routes and utility functions for the Pedigree Feature. The system now has complete server-side functionality for fetching, updating, and exporting pedigree data with comprehensive validation.

---

## Phase 3: Utility Functions ✅

### File: `lib/utils/pedigree.ts`

**Functions Implemented:**

#### 1. Pedigree Tree Operations
- `fetchPedigree()` - Recursively fetch pedigree tree up to N generations
- `flattenPedigree()` - Convert tree structure to flat rows for CSV export
- `calculatePedigreeStats()` - Calculate completeness statistics

#### 2. Validation Functions
- `isAncestor()` - Check if one animal is an ancestor of another (BFS algorithm)
- `validateParentLinks()` - Validate parent assignments don't create circular relationships
- `validateParentSex()` - Warn if parent sex doesn't match role (dam=female, sire=male)

#### 3. Type Definitions
```typescript
export type PedigreeNode = {
  id: string;
  name: string;
  breed?: string | null;
  sex?: string | null;
  registrationNumber?: string | null;
  dateOfBirth?: string | null;
  color?: string | null;
  profileImageUrl?: string | null;
  dam?: PedigreeNode | null;
  sire?: PedigreeNode | null;
};

export type FlatPedigreeRow = {
  generation: number;
  name: string;
  registrationNumber: string | null;
  sex: string | null;
  breed: string | null;
  relationship: string;
  dateOfBirth: string | null;
};
```

---

## Phase 2: Backend API Routes ✅

### 1. Main Pedigree Route
**File**: `app/api/animals/[id]/pedigree/route.ts`

#### GET /api/animals/:id/pedigree
- Fetch nested pedigree tree
- Query params: `?gens=4` (1-10 generations)
- Returns: pedigree tree + statistics
- **Features**:
  - Permission check (ANIMALS_READ)
  - Configurable generation depth
  - Completeness statistics
  - Error handling

#### PUT /api/animals/:id/pedigree
- Update parent links (damId, sireId)
- Create pedigree snapshots
- **Features**:
  - Permission check (ANIMALS_UPDATE)
  - Circular ancestry validation
  - Sex mismatch warnings
  - Snapshot creation with JSON storage

**Example Request (Update Parents):**
```json
{
  "damId": "animal-uuid-1",
  "sireId": "animal-uuid-2"
}
```

**Example Request (Create Snapshot):**
```json
{
  "snapshot": true,
  "generations": 4
}
```

---

### 2. Documents Route
**File**: `app/api/animals/[id]/pedigree/documents/route.ts`

#### GET /api/animals/:id/pedigree/documents
- Fetch all pedigree documents for an animal
- Ordered by upload date (newest first)
- **Features**:
  - Permission check (ANIMALS_READ)
  - Returns full document metadata

#### POST /api/animals/:id/pedigree/documents
- Upload new pedigree document
- **Features**:
  - Permission check (ANIMALS_UPDATE)
  - Stores metadata (title, fileUrl, fileName, fileSize, mimeType, notes)
  - Tracks uploader (uploadedBy)

**Example Request:**
```json
{
  "fileUrl": "https://uploadthing.com/.../certificate.pdf",
  "title": "AKC Registration Certificate",
  "fileName": "certificate.pdf",
  "fileSize": 245678,
  "mimeType": "application/pdf",
  "notes": "Original registration papers"
}
```

#### DELETE /api/animals/:id/pedigree/documents
- Delete a pedigree document
- Query params: `?documentId=123`
- **Features**:
  - Permission check (ANIMALS_UPDATE)
  - Validates document belongs to animal

---

### 3. Export Route
**File**: `app/api/animals/[id]/pedigree/export/route.ts`

#### GET /api/animals/:id/pedigree/export
- Export pedigree as CSV or PDF data
- Query params: `?format=csv&gens=4`
- **Features**:
  - Permission check (ANIMALS_READ)
  - CSV format: Direct download with proper headers
  - PDF format: Returns JSON data for client-side rendering

**CSV Export:**
- Flattened pedigree with columns: Generation, Name, Registration Number, Sex, Breed, Relationship, Date of Birth
- Proper CSV escaping (quotes, commas, newlines)
- Download filename: `pedigree-{animal-name}.csv`

**PDF Export:**
- Returns pedigree tree + animal metadata
- Client-side rendering recommended (html2canvas + jsPDF)

---

## Security & Validation

### Permission Checks ✅
All routes protected with Better Auth + Permission system:
- `ANIMALS_READ` - View pedigree
- `ANIMALS_UPDATE` - Edit parents, upload documents

### Validation Implemented ✅
1. **Circular Ancestry Prevention**
   - BFS algorithm checks entire ancestry chain
   - Prevents infinite loops in pedigree tree
   - Returns clear error messages

2. **Sex Validation**
   - Warns if dam is not female
   - Warns if sire is not male
   - Allows override (warnings only, not errors)

3. **Input Validation**
   - Generation limits (1-10)
   - Required fields checked
   - Animal existence verified

4. **Error Handling**
   - Try-catch blocks on all routes
   - Descriptive error messages
   - Proper HTTP status codes

---

## API Response Examples

### GET Pedigree Response
```json
{
  "pedigree": {
    "id": "animal-1",
    "name": "Luna",
    "breed": "Border Collie",
    "sex": "female",
    "dam": {
      "id": "animal-2",
      "name": "Bella",
      "dam": null,
      "sire": null
    },
    "sire": {
      "id": "animal-3",
      "name": "Max",
      "dam": null,
      "sire": null
    }
  },
  "generations": 4,
  "stats": {
    "totalPossible": 15,
    "totalPresent": 3,
    "completeness": 20,
    "missingByGeneration": {
      "2": 4,
      "3": 8
    }
  }
}
```

### PUT Pedigree Response (Success)
```json
{
  "success": true,
  "message": "Parent links updated successfully",
  "warnings": [
    "Warning: This animal is male but being set as dam (expected female)"
  ]
}
```

### PUT Pedigree Response (Error)
```json
{
  "error": "Setting this dam would create a circular relationship in the pedigree"
}
```

---

## Files Created

### Utility Functions:
- `lib/utils/pedigree.ts` (300+ lines)

### API Routes:
- `app/api/animals/[id]/pedigree/route.ts` (GET, PUT)
- `app/api/animals/[id]/pedigree/documents/route.ts` (GET, POST, DELETE)
- `app/api/animals/[id]/pedigree/export/route.ts` (GET)

---

## Testing Recommendations

### Unit Tests:
- `isAncestor()` with various tree structures
- `validateParentLinks()` edge cases
- `flattenPedigree()` output format
- `calculatePedigreeStats()` accuracy

### Integration Tests:
- GET pedigree with different generation depths
- PUT with circular ancestry (should fail)
- PUT with valid parents (should succeed)
- Document upload and retrieval
- CSV export format validation

### E2E Tests:
- Complete flow: Create animal → Set parents → Fetch pedigree → Export CSV
- Document upload → View → Delete
- Snapshot creation and retrieval

---

## Performance Considerations

### Implemented:
- ✅ Recursive fetching with depth limit
- ✅ Single query per animal (efficient)
- ✅ BFS for circular detection (optimal)

### Future Optimizations:
- Add database indexes on `damId` and `sireId`
- Cache pedigree snapshots for expensive queries
- Implement pagination for large document lists
- Add Redis caching for frequently accessed pedigrees

---

## Next Steps

### Phase 4: Frontend Components
1. Create `PedigreeTab` component
2. Build `PedigreeTree` visualization (CSS Grid)
3. Implement `EditParentsDialog` with typeahead search
4. Add document upload UI
5. Integrate with TanStack Query for data fetching

---

## Success Metrics

✅ **3 API routes created** (pedigree, documents, export)  
✅ **8 utility functions implemented**  
✅ **Circular ancestry prevention** (BFS algorithm)  
✅ **Sex validation warnings**  
✅ **CSV export with proper escaping**  
✅ **Permission checks on all routes**  
✅ **Comprehensive error handling**  
✅ **Type-safe throughout**

**Total Lines of Code:** ~600 lines

---

**Phases 2 & 3 Complete! Moving to Phase 4: Frontend Components** 🚀
