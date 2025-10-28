# 🔍 Animal Detail Page - Comprehensive Audit

**Status:** System audit in progress  
**Goal:** Make all functionality work with real API data

---

## 📊 Current Data Sources

### **Main Page:**
- ❌ Uses `mockAnimals` from `@/data/mockData`
- ❌ Uses `getAnimalProfileDetails` from `@/lib/mock-data/animal-profile-details`
- ✅ API endpoint exists: `GET /api/animals/[id]`
- ✅ Returns all related data (photos, docs, feeding, semen, seasons, litters, health, reminders)

---

## 🗂️ Tabs Analysis

### **1. Profile Tab** (`ProfileTab.tsx`)
**Current Status:** Uses mock data
**Data Needed:**
- ✅ Basic info (name, breed, sex, DOB, weight, color, markings)
- ✅ Microchip & registration numbers
- ❌ Photos (commented out by user)
- ✅ Health status
- ✅ Temperament
- ✅ Bio/description

**API Support:**
- ✅ All fields available in `animals` table
- ✅ GET `/api/animals/[id]` returns all data

**Actions Needed:**
- Replace mock data with API data
- Use `useAnimal(id)` hook

---

### **2. Pedigree Tab** (`PedigreeTab.tsx`)
**Current Status:** Unknown
**Data Needed:**
- Dam (mother) information
- Sire (father) information
- Grandparents
- Great-grandparents

**API Support:**
- ✅ `damId` and `sireId` in animals table
- ✅ GET `/api/animals/[id]/pedigree` endpoint exists
- ✅ Can fetch related animals

**Actions Needed:**
- Check if using API or mock data
- Implement pedigree tree visualization

---

### **3. Photos & Docs Tab** (`PhotosDocsTab.tsx`)
**Current Status:** Unknown
**Data Needed:**
- Photos by category (7 categories, 10 each)
- Documents (pedigree, health certs, etc.)

**API Support:**
- ✅ `animalPhotos` table with categories
- ✅ `animalDocuments` table
- ✅ GET `/api/animals/[id]/photos` endpoint exists
- ✅ Returned in main animal query

**Actions Needed:**
- Check current implementation
- Implement photo upload
- Implement document upload
- Category-based organization

---

### **4. Feeding Plan Tab** (`FeedingPlanTab.tsx`)
**Current Status:** Unknown
**Data Needed:**
- Food type/brand
- Meal times & amounts
- Special diet requirements
- Supplements
- Calorie targets

**API Support:**
- ✅ `feedingPlans` table
- ✅ Returned in main animal query
- ❌ No dedicated CRUD endpoints yet

**Actions Needed:**
- Check current implementation
- Create API endpoints for CRUD
- Implement add/edit/delete feeding plans

---

### **5. Semen Tab** (`SemenTab.tsx`)
**Current Status:** Unknown
**Data Needed:**
- Semen assessments (visual & lab)
- Quality ratings
- Volume, concentration, motility, morphology
- Frozen semen inventory

**API Support:**
- ✅ `semenAssessments` table
- ✅ `frozenSemen` table
- ✅ Returned in main animal query
- ❌ No dedicated CRUD endpoints yet

**Actions Needed:**
- Check current implementation
- Create API endpoints for CRUD
- Implement add/edit/delete assessments

---

### **6. Seasons Tab** (`SeasonsTab.tsx`) - Bitches Only
**Current Status:** Unknown
**Data Needed:**
- Heat cycle start/end dates
- Duration
- Progesterone readings
- Status (active/completed)

**API Support:**
- ✅ `seasons` table
- ✅ `progesteroneReadings` table
- ✅ Returned in main animal query
- ❌ No dedicated CRUD endpoints yet

**Actions Needed:**
- Check current implementation
- Create API endpoints for CRUD
- Implement add/edit/delete seasons
- Implement progesterone tracking

---

### **7. Litter Details Tab** (`LitterDetailsTab.tsx`) - Bitches Only
**Current Status:** Unknown
**Data Needed:**
- Mating information
- Expected/actual whelping dates
- Puppy counts (total, surviving, male, female)
- Individual puppy records
- Complications

**API Support:**
- ✅ `litters` table
- ✅ `puppies` table
- ✅ Returned in main animal query
- ❌ No dedicated CRUD endpoints yet

**Actions Needed:**
- Check current implementation
- Create API endpoints for CRUD
- Implement add/edit/delete litters
- Implement puppy management

---

### **8. Reminders Tab** (`RemindersTab.tsx`)
**Current Status:** Unknown
**Data Needed:**
- Reminder type (vaccination, vet, etc.)
- Due date
- Completion status
- Notes

**API Support:**
- ✅ `reminders` table (in schema)
- ✅ Returned in main animal query
- ❌ No dedicated CRUD endpoints yet

**Actions Needed:**
- Check current implementation
- Create API endpoints for CRUD
- Implement add/edit/delete reminders
- Implement completion toggle

---

## 🔧 Database Schema Summary

### **Tables Available:**
1. ✅ `animals` - Main animal data
2. ✅ `breeds` - Breed reference
3. ✅ `animalPhotos` - 7 categories, 10 images each
4. ✅ `animalDocuments` - Documents & certificates
5. ✅ `feedingPlans` - Feeding schedules
6. ✅ `semenAssessments` - Semen quality data
7. ✅ `seasons` - Heat cycles (bitches)
8. ✅ `progesteroneReadings` - Linked to seasons
9. ✅ `litters` - Breeding records
10. ✅ `puppies` - Individual puppy data
11. ✅ `frozenSemen` - Frozen semen inventory
12. ✅ `healthRecords` - Health history
13. ✅ `reminders` - Task reminders

---

## 📡 API Endpoints Available

### **Main Animal:**
- ✅ `GET /api/animals/[id]` - Get animal with all relations
- ✅ `PATCH /api/animals/[id]` - Update animal
- ✅ `DELETE /api/animals/[id]` - Delete animal

### **Pedigree:**
- ✅ `GET /api/animals/[id]/pedigree` - Get pedigree tree
- ✅ `GET /api/animals/[id]/pedigree/documents` - Get pedigree docs
- ✅ `GET /api/animals/[id]/pedigree/export` - Export pedigree

### **Photos:**
- ✅ `GET /api/animals/[id]/photos` - Get all photos
- ✅ `POST /api/animals/[id]/photos` - Upload photo
- ✅ `DELETE /api/animals/[id]/photos/[photoId]` - Delete photo

### **Missing Endpoints (Need to Create):**
- ❌ Feeding plans CRUD
- ❌ Semen assessments CRUD
- ❌ Seasons CRUD
- ❌ Progesterone readings CRUD
- ❌ Litters CRUD
- ❌ Puppies CRUD
- ❌ Reminders CRUD
- ❌ Health records CRUD
- ❌ Documents CRUD

---

## 🎯 Implementation Plan

### **Phase 1: Convert to API Data** (Priority)
1. ✅ Update main page to use `useAnimal(id)` hook
2. ✅ Update ProfileTab to use API data
3. ✅ Update PedigreeTab to use API data
4. ✅ Update PhotosDocsTab to use API data

### **Phase 2: Create Missing API Endpoints**
1. ❌ Feeding plans endpoints
2. ❌ Semen assessments endpoints
3. ❌ Seasons endpoints
4. ❌ Litters endpoints
5. ❌ Reminders endpoints
6. ❌ Health records endpoints
7. ❌ Documents endpoints

### **Phase 3: Implement CRUD in Tabs**
1. ❌ FeedingPlanTab - Add/Edit/Delete
2. ❌ SemenTab - Add/Edit/Delete
3. ❌ SeasonsTab - Add/Edit/Delete
4. ❌ LitterDetailsTab - Add/Edit/Delete
5. ❌ RemindersTab - Add/Edit/Delete
6. ❌ PhotosDocsTab - Upload/Delete

### **Phase 4: Seed Data**
1. ❌ Create comprehensive seed data
2. ❌ Match mock data structure
3. ❌ Populate all tables
4. ❌ Test all relationships

---

## 📝 Next Steps

1. **Audit each tab component** - Check what data they're using
2. **Create missing API endpoints** - For CRUD operations
3. **Update components** - Replace mock data with API calls
4. **Create seed data** - Populate database with test data
5. **Test functionality** - Ensure all CRUD works
6. **Document changes** - Update documentation

---

## 🚀 Quick Wins

**Can be done immediately:**
1. ✅ Replace mock data in main page with `useAnimal(id)`
2. ✅ Update ProfileTab to use API data
3. ✅ Update PedigreeTab (API already exists)
4. ✅ Update PhotosDocsTab (API already exists)

**Requires API work:**
1. ❌ Feeding plans functionality
2. ❌ Semen assessments functionality
3. ❌ Seasons functionality
4. ❌ Litters functionality
5. ❌ Reminders functionality

---

This audit will guide the systematic implementation of full functionality.
