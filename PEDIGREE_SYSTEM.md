# Pedigree Management System Documentation

## Overview

The Pedigree Management System is a comprehensive solution for tracking and managing animal genealogy across unlimited generations. It combines system-linked animals with manual entries for external animals, providing a complete family tree visualization and professional PDF certificate generation.

---

## Features

### 🌳 **Interactive Pedigree Tree**
- **3-Generation Display**: Visual horizontal tree layout showing parents, grandparents, and great-grandparents
- **Click-to-Edit**: Click any animal card to edit its parents
- **Color-Coded Cards**: Blue for males, pink for females
- **Real-Time Updates**: Automatic refresh after changes

### 🔗 **Dual Entry System**
- **System Animals**: Link existing animals from your database
- **Manual Entries**: Add external animals not in your system
- **Mixed Trees**: Seamlessly combine both types in one pedigree
- **Smart Filtering**: Sex-based filtering (dams=female, sires=male)

### 📄 **PDF Certificate Generation**
- **Professional Layout**: Print-ready certificate design
- **Company Branding**: Animalytics logo and branding
- **High Quality**: 2x scale rendering for crisp output
- **Metadata**: Searchable PDF properties
- **One-Click Download**: Simple icon button

### 🛡️ **Data Validation**
- **Circular Relationship Prevention**: Prevents setting descendants as parents
- **Sex Validation**: Warns if sex doesn't match role
- **Required Fields**: Ensures data integrity
- **Duplicate Prevention**: Checks for existing entries

---

## Architecture

### Database Schema

#### **animals table**
```sql
- id (uuid, primary key)
- name (text, required)
- registeredName (text)
- registrationNumber (text)
- microchipNumber (text)
- breed (text)
- sex (enum: male/female)
- dateOfBirth (date)
- color (text)
- damId (uuid, FK → animals.id)
- sireId (uuid, FK → animals.id)
- profileImageUrl (text)
- timestamps
```

#### **manual_pedigree_entries table**
```sql
- id (uuid, primary key)
- animalId (uuid, FK → animals.id)
- userId (text, FK → users.id)
- position (text: 'dam', 'sire', 'dam.dam', etc.)
- generation (integer: 1, 2, 3...)
- name (text, required)
- registeredName (text)
- registrationNumber (text)
- microchipNumber (text)
- breed (text)
- sex (enum: male/female)
- dateOfBirth (date)
- color (text)
- titles (jsonb)
- notes (text)
- timestamps
```

### API Endpoints

#### **GET /api/animals/[id]/pedigree**
Fetch complete pedigree tree for an animal.

**Query Parameters:**
- `gens` (optional): Number of generations (default: 4)

**Response:**
```json
{
  "pedigree": {
    "id": "uuid",
    "name": "Champion Max",
    "dam": { ... },
    "sire": { ... }
  },
  "generations": 3,
  "stats": {
    "totalAnimals": 14,
    "completeness": 87.5,
    "missingAnimals": 2
  }
}
```

#### **PUT /api/animals/[id]/pedigree**
Update parent links for an animal.

**Request Body:**
```json
{
  "damId": "uuid or null",
  "sireId": "uuid or null"
}
```

**Validation:**
- Checks for circular relationships
- Validates parent sex
- Returns warnings if sex mismatch

#### **POST /api/animals/[id]/pedigree/manual**
Create a manual pedigree entry.

**Request Body:**
```json
{
  "position": "dam.dam",
  "generation": 2,
  "name": "External Champion",
  "registeredName": "CH. External Champion of Excellence",
  "registrationNumber": "ABC123",
  "microchipNumber": "123456789",
  "breed": "Labrador Retriever",
  "sex": "female",
  "dateOfBirth": "2020-01-15",
  "color": "Yellow",
  "notes": "Imported from abroad"
}
```

#### **PUT /api/animals/[id]/pedigree/manual**
Update an existing manual entry.

**Request Body:**
```json
{
  "entryId": "uuid",
  "name": "Updated Name",
  ...
}
```

#### **DELETE /api/animals/[id]/pedigree/manual?entryId=uuid**
Delete a manual pedigree entry.

---

## Components

### **PedigreeTreeHorizontal**
Main interactive pedigree display component.

**Props:**
```typescript
{
  node: PedigreeNode;
  generations?: number;
  onUpdate?: () => void;
}
```

**Features:**
- Horizontal tree layout
- Click-to-edit functionality
- Add manual entries via "+" buttons
- PDF download button
- Real-time updates

### **EditParentsDialog**
Dialog for editing an animal's parents.

**Props:**
```typescript
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalName: string;
  currentDamId?: string;
  currentSireId?: string;
  onSuccess?: () => void;
}
```

**Features:**
- Searchable animal dropdown
- Current parent display
- Remove parent option
- Quick add buttons for manual entries

### **AddPedigreeEntryDialog**
Unified dialog for adding parents (system or manual).

**Props:**
```typescript
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  position: string;
  generation: number;
  positionLabel: string;
  requiredSex?: "male" | "female";
  onSuccess?: () => void;
}
```

**Features:**
- **Two modes:**
  1. Select from System - Searchable dropdown
  2. Add Manual Entry - Full form
- Tabbed interface
- Sex-based filtering
- Pre-filled sex for manual entries
- Validation and error handling

### **PedigreeCertificatePDF**
PDF-optimized certificate component.

**Props:**
```typescript
{
  node: PedigreeNode;
  generations?: number;
  breederName?: string;
  breederKennel?: string;
}
```

**Features:**
- Professional certificate layout
- Animalytics logo
- Color-coded animals
- Complete pedigree information
- Footer with signature and certificate ID

---

## Utilities

### **fetchPedigree()**
Recursively fetch pedigree tree with manual entries.

```typescript
async function fetchPedigree(
  nodeId: string | null,
  depth: number = 0,
  maxGens: number = 4,
  rootAnimalId?: string,
  currentPath: string = ''
): Promise<PedigreeNode | null>
```

**Features:**
- Recursive tree building
- Merges system animals + manual entries
- Path tracking (dam, dam.dam, sire.sire, etc.)
- Depth limiting

### **validateParentLinks()**
Validate parent assignments to prevent circular relationships.

```typescript
async function validateParentLinks(
  animalId: string,
  damId: string | null,
  sireId: string | null
): Promise<string | null>
```

**Checks:**
- Self-parent prevention
- Circular relationship detection
- Returns error message or null

### **isDescendant()**
Check if an animal is a descendant of another.

```typescript
async function isDescendant(
  candidateId: string,
  targetId: string
): Promise<boolean>
```

**Logic:**
- Traverses DOWN the tree (to children)
- Prevents setting descendants as parents
- Uses breadth-first search

### **generatePDFWithMetadata()**
Generate PDF from HTML element with metadata.

```typescript
async function generatePDFWithMetadata(
  element: HTMLElement,
  metadata: {
    title?: string;
    subject?: string;
    author?: string;
    keywords?: string;
    creator?: string;
  },
  options: GeneratePDFOptions
): Promise<void>
```

**Features:**
- High-quality rendering (2x scale)
- JPEG compression
- Custom metadata
- Landscape orientation
- Loading feedback

---

## Position Naming Convention

Manual entries use a dot-notation path system:

```
dam              → Mother
sire             → Father
dam.dam          → Maternal grandmother
dam.sire         → Maternal grandfather
sire.dam         → Paternal grandmother
sire.sire        → Paternal grandfather
dam.dam.dam      → Maternal great-grandmother (dam's side)
dam.dam.sire     → Maternal great-grandfather (dam's side)
dam.sire.dam     → Maternal great-grandmother (sire's side)
dam.sire.sire    → Maternal great-grandfather (sire's side)
sire.dam.dam     → Paternal great-grandmother (dam's side)
sire.dam.sire    → Paternal great-grandfather (dam's side)
sire.sire.dam    → Paternal great-grandmother (sire's side)
sire.sire.sire   → Paternal great-grandfather (sire's side)
```

This system supports unlimited generations by continuing the pattern.

---

## User Workflows

### **Adding a Parent from System**

1. Navigate to animal's pedigree page
2. Click empty slot with "+" button OR click animal → "Edit Parents"
3. Dialog opens with "Select from System" tab active
4. Search and select animal from dropdown
5. Click "Link Animal"
6. Tree refreshes automatically

### **Adding a Manual Entry**

1. Navigate to animal's pedigree page
2. Click empty slot with "+" button
3. Switch to "Add Manual Entry" tab
4. Fill in animal details:
   - Name (required)
   - Registered name
   - Registration number
   - Microchip number
   - Breed, sex, DOB, color
   - Notes
5. Click "Add Entry"
6. Tree refreshes with new entry marked as "(External)"

### **Editing Parents**

1. Click any animal card in the tree
2. EditParentsDialog opens
3. Select new dam/sire from dropdown OR click "+ Add Dam/Sire"
4. Click "Save Changes"
5. Validation runs (circular check, sex check)
6. Tree updates if valid

### **Downloading PDF Certificate**

1. Navigate to animal's pedigree page
2. Click download icon (top right)
3. Button shows spinner "Generating..."
4. PDF downloads automatically
5. Toast notification confirms success
6. File named: `pedigree-{animal-name}-{timestamp}.pdf`

---

## Validation Rules

### **Circular Relationship Prevention**

**Rule:** An animal cannot have a descendant as a parent.

**Examples:**
```
✅ Valid:
   Max → parent: Bella (unrelated)
   Max → parent: Champion (grandparent)

❌ Invalid:
   Max → parent: Max (self)
   Max → parent: Puppy (Max's child)
   Max → parent: GrandPuppy (Max's grandchild)
```

**Implementation:**
- Traverses DOWN the tree from target animal
- Checks if candidate appears in descendants
- Uses breadth-first search with cycle detection

### **Sex Validation**

**Rule:** Dams should be female, sires should be male (warning only).

**Behavior:**
- Shows warning if sex doesn't match role
- Does NOT prevent saving (allows data flexibility)
- User can proceed with warning acknowledged

---

## PDF Certificate Specifications

### **Layout**
- **Format:** Landscape
- **Dimensions:** Auto-fit content
- **Quality:** 2x scale (high resolution)
- **Compression:** JPEG 95%
- **File Size:** ~200-500 KB

### **Sections**
1. **Header:**
   - Animalytics logo (gradient shield)
   - Company name and tagline
   - Generation date
   - Breeder kennel name

2. **Title:**
   - "Three Generation Pedigree Certificate"
   - Decorative divider

3. **Subject Animal:**
   - Featured card with amber gradient background
   - "SUBJECT" badge
   - Complete animal details

4. **Pedigree Tree:**
   - 3 columns (Gen 1, Gen 2, Gen 3)
   - Color-coded cards (blue/pink)
   - Position labels (DAM, SIRE, GRANDDAM, etc.)
   - External animal indicators

5. **Footer:**
   - Breeder signature line
   - Certificate ID (first 8 chars of animal UUID)
   - Copyright notice

### **Metadata**
```json
{
  "title": "Pedigree Certificate - Champion Max",
  "subject": "Three Generation Pedigree for Champion Max",
  "author": "Animalytics",
  "keywords": "pedigree, certificate, breeding, genealogy",
  "creator": "Animalytics Professional Pedigree System"
}
```

---

## Error Handling

### **Circular Relationship Error**
```json
{
  "error": "Setting this dam would create a circular relationship in the pedigree",
  "status": 400
}
```

**User sees:** Toast notification with error message

### **Sex Mismatch Warning**
```json
{
  "warnings": [
    "Selected dam is marked as male. Please verify the sex is correct."
  ]
}
```

**User sees:** Alert in dialog (non-blocking)

### **PDF Generation Error**
```json
{
  "error": "Failed to generate PDF. Please try again."
}
```

**User sees:** Toast notification with error message

---

## Performance Considerations

### **Pedigree Fetching**
- Recursive queries limited by `maxGens` parameter
- Manual entries fetched once per root animal
- Uses Map for O(1) position lookups
- Breadth-first traversal prevents deep recursion

### **PDF Generation**
- Hidden component renders off-screen
- html2canvas uses requestAnimationFrame
- JPEG compression reduces file size
- Async operation with loading feedback

### **Validation**
- Circular check uses Set for visited tracking
- Early termination on match found
- Database queries batched where possible

---

## Future Enhancements

### **Potential Features**
- [ ] Pedigree comparison tool
- [ ] Coefficient of inbreeding calculator
- [ ] Ancestor search across all animals
- [ ] Batch PDF generation
- [ ] Custom certificate templates
- [ ] Multi-language support
- [ ] Pedigree sharing via link
- [ ] Print optimization mode
- [ ] Mobile-responsive tree layout
- [ ] Export to other formats (Excel, CSV)

### **Database Optimizations**
- [ ] Materialized pedigree paths
- [ ] Cached completeness scores
- [ ] Indexed position fields
- [ ] Denormalized ancestor counts

---

## Troubleshooting

### **"Circular relationship" error when adding valid parent**

**Cause:** The validation logic was checking ancestors instead of descendants.

**Fix:** Updated `isDescendant()` function to traverse DOWN the tree (to children) instead of UP (to parents).

**Verify:** The candidate should only be rejected if it's a descendant of the target, not an ancestor.

### **PDF not downloading**

**Possible causes:**
1. Browser blocking pop-ups/downloads
2. Element not rendered (check ref)
3. html2canvas CORS issues with images

**Solutions:**
1. Check browser console for errors
2. Ensure pdfRef is attached to element
3. Add `useCORS: true` to html2canvas options

### **Manual entries not appearing**

**Check:**
1. Position string matches expected format
2. `rootAnimalId` passed to `fetchPedigree()`
3. Database query successful
4. Generation number correct

### **Sex filtering not working**

**Verify:**
1. `requiredSex` prop passed correctly
2. Animals have `sex` field populated
3. Filter logic: `animal.sex === requiredSex`

---

## Dependencies

```json
{
  "jspdf": "^2.x",
  "html2canvas": "^1.x",
  "@tanstack/react-query": "^5.x",
  "drizzle-orm": "^0.x",
  "date-fns": "^3.x",
  "lucide-react": "^0.x"
}
```

---

## File Structure

```
components/breeder/animals/
├── PedigreeTreeHorizontal.tsx      # Main interactive tree
├── PedigreeCertificatePDF.tsx      # PDF certificate layout
├── EditParentsDialog.tsx           # Edit parents dialog
├── AddPedigreeEntryDialog.tsx      # Unified add dialog
└── AddManualEntryDialog.tsx        # (deprecated - use AddPedigreeEntryDialog)

lib/utils/
├── pedigree.ts                     # Pedigree utilities
└── pdf-generator.ts                # PDF generation utilities

lib/db/schema/
└── animals.ts                      # Database schema

app/api/animals/[id]/pedigree/
├── route.ts                        # Main pedigree API
└── manual/
    └── route.ts                    # Manual entries API

drizzle/migrations/
└── 0008_add_manual_pedigree_entries.sql
```

---

## Testing Checklist

### **Basic Functionality**
- [ ] View pedigree tree
- [ ] Click animal to edit parents
- [ ] Select dam from system
- [ ] Select sire from system
- [ ] Remove parent
- [ ] Add manual dam entry
- [ ] Add manual sire entry
- [ ] Download PDF certificate

### **Validation**
- [ ] Prevent self as parent
- [ ] Prevent child as parent
- [ ] Prevent grandchild as parent
- [ ] Allow grandparent as parent
- [ ] Show sex mismatch warning
- [ ] Allow saving with warning

### **Manual Entries**
- [ ] Create entry with all fields
- [ ] Create entry with minimal fields
- [ ] Sex pre-filled correctly
- [ ] Entry appears in tree
- [ ] Entry marked as "(External)"
- [ ] Microchip field saves

### **PDF Generation**
- [ ] PDF downloads successfully
- [ ] Logo appears correctly
- [ ] All animals rendered
- [ ] Colors correct (blue/pink)
- [ ] External indicators show
- [ ] Footer information correct
- [ ] Filename correct format

### **Edge Cases**
- [ ] Empty pedigree (no parents)
- [ ] Partial pedigree (some missing)
- [ ] Complete pedigree (all filled)
- [ ] Mixed system + manual entries
- [ ] Very long names
- [ ] Special characters in names
- [ ] Missing optional fields

---

## License

Copyright © 2025 Animalytics. All rights reserved.

---

## Support

For issues or questions, please contact the development team or create an issue in the repository.

**Last Updated:** October 23, 2025
**Version:** 1.0.0
