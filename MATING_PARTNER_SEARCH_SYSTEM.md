# 🔍 Mating Partner Search System - Architecture

**Status:** ✅ API Created, Integration in Progress  
**Purpose:** Allow breeders to search for mating partners across the ENTIRE system  
**Integration:** Works with existing Mating Calculator

---

## 🎯 System Overview

### **Current System:**
```
Mating Calculator
  ↓
AnimalPickerDialog
  ↓
Shows ONLY breeder's own animals
```

### **Enhanced System:**
```
Mating Calculator
  ↓
AnimalPickerDialog (Enhanced)
  ├── Tab 1: My Animals (existing)
  └── Tab 2: Search System-Wide (NEW)
      ↓
      Mating Partners API
      ↓
      Shows ALL available dogs from ALL breeders
```

---

## 📊 Architecture

### **1. API Layer** ✅ CREATED

**Endpoint:** `/api/mating-partners`

**Features:**
- ✅ Search across entire system
- ✅ Filter by breed (exact or similar)
- ✅ Filter by sex (male/female)
- ✅ Filter by location (city, state, country)
- ✅ Filter by age range (min/max months)
- ✅ Filter by health status
- ✅ Filter champions only
- ✅ Exclude breeder's own dogs
- ✅ Premium breeders shown first
- ✅ Champions prioritized
- ✅ Includes breeder contact info

**Query Parameters:**
```typescript
{
  search?: string;           // Name, breed, or breeder
  breed?: string;            // Breed name
  sex?: 'male' | 'female';   // Dog sex
  location?: string;         // City, state, or country
  minAge?: number;           // Minimum age in months
  maxAge?: number;           // Maximum age in months
  healthStatus?: string;     // excellent, good, fair, poor
  championOnly?: boolean;    // Show only champions
  excludeBreederId?: string; // Exclude own dogs
  limit?: number;            // Results per page
  offset?: number;           // Pagination offset
}
```

**Response:**
```typescript
{
  success: true,
  partners: [
    {
      // Animal info
      id: string,
      name: string,
      breedName: string,
      sex: 'male' | 'female',
      dateOfBirth: string,
      color: string,
      profileImageUrl: string,
      bio: string,
      healthStatus: string,
      isChampion: boolean,
      titles: string[],
      registrationNumber: string,
      
      // Breeding info
      isBreedingActive: boolean,
      studFee: number,
      breedingNotes: string,
      healthCertifications: object,
      geneticTests: object,
      pedigreeInfo: object,
      
      // Breeder info
      breederId: string,
      breederName: string,
      breederSlug: string,
      breederLocation: { city, state, country },
      breederContactEmail: string,
      breederContactPhone: string,
      breederVerified: boolean,
      breederPremium: boolean,
      breederRating: number,
      breederTotalReviews: number,
      breederResponseRate: number,
      breederResponseTimeHours: number,
    }
  ],
  pagination: {
    total: number,
    limit: number,
    offset: number,
    hasMore: boolean
  },
  filters: { ... }
}
```

---

## 🎨 UI Components

### **2. Enhanced AnimalPickerDialog** 🔄 TO BE UPDATED

**Current Flow:**
```
1. Select Bitch (from my animals)
2. Select Dog (from my animals) OR Frozen Semen
3. Complete
```

**Enhanced Flow:**
```
1. Select Bitch (from my animals)
2. Select Dog Source:
   ├── Tab: My Animals (existing)
   └── Tab: Search System-Wide (NEW)
       ├── Search bar
       ├── Breed filter
       ├── Location filter
       ├── Age range filter
       ├── Champion filter
       └── Results grid with breeder contact
3. Complete (with external dog info)
```

---

## 🔧 Implementation Plan

### **Phase 1: API** ✅ DONE
- [x] Create `/api/mating-partners` endpoint
- [x] Add comprehensive filters
- [x] Include breeder contact info
- [x] Prioritize premium/champions
- [x] Exclude own dogs

### **Phase 2: UI Components** 🔄 IN PROGRESS
- [ ] Add tabs to AnimalPickerDialog
  - Tab 1: "My Animals"
  - Tab 2: "Search System-Wide"
- [ ] Create SystemWideSearch component
  - Search input
  - Breed dropdown (from breeds API)
  - Location input
  - Age range sliders
  - Champion checkbox
  - Health status filter
- [ ] Create ExternalDogCard component
  - Dog photo and info
  - Breeder info
  - Contact buttons (email, phone)
  - "Select for Mating" button

### **Phase 3: Integration** 📋 PENDING
- [ ] Update mating schema to handle external dogs
- [ ] Add `externalDogInfo` field to matings table
- [ ] Store breeder contact info with mating
- [ ] Add "Contact Breeder" feature in mating details
- [ ] Add notification system for mating requests

---

## 💡 Use Cases

### **Use Case 1: Find Stud Dog by Breed**
```
Breeder has a female Golden Retriever
  ↓
Opens Mating Calculator
  ↓
Selects their female
  ↓
Clicks "Search System-Wide" tab
  ↓
Filters: Breed = "Golden Retriever", Sex = "Male"
  ↓
Sees all available Golden Retriever studs
  ↓
Views breeder contact info
  ↓
Selects dog for mating record
  ↓
Calculator stores external dog info
  ↓
Breeder can contact dog owner
```

### **Use Case 2: Find Champion in Specific Location**
```
Breeder wants champion stud nearby
  ↓
Filters:
  - Breed: "German Shepherd"
  - Location: "California"
  - Champion Only: Yes
  ↓
Sees only champion German Shepherds in California
  ↓
Sorted by breeder rating
  ↓
Selects best match
```

### **Use Case 3: Find Young Healthy Male**
```
Breeder wants young, healthy stud
  ↓
Filters:
  - Breed: "Labrador Retriever"
  - Age: 12-36 months
  - Health Status: "Excellent"
  ↓
Sees only young, healthy Labs
  ↓
Reviews health certifications
  ↓
Contacts breeder
```

---

## 📋 Database Schema Updates

### **Current Matings Table:**
```sql
matings {
  bitchId: references own animal
  dogId: references own animal (nullable)
  frozenSemenId: references own frozen semen (nullable)
}
```

### **Enhanced Matings Table:**
```sql
matings {
  bitchId: references own animal
  dogId: references own animal (nullable)
  frozenSemenId: references own frozen semen (nullable)
  
  -- NEW FIELDS for external dogs
  externalDogId: text (nullable)
  externalDogInfo: jsonb {
    id: string,
    name: string,
    breedName: string,
    breederId: string,
    breederName: string,
    breederContactEmail: string,
    breederContactPhone: string,
    breederLocation: object,
    profileImageUrl: string,
    registrationNumber: string,
    isChampion: boolean,
    studFee: number,
  }
}
```

---

## 🎯 Key Features

### **For Dog Owners (Offering Stud Service):**
1. ✅ Mark dog as "Available for Breeding"
2. ✅ Set stud fee
3. ✅ Add breeding notes
4. ✅ Upload health certifications
5. ✅ Make profile public
6. ✅ Dog appears in system-wide search
7. 📧 Receive mating requests (future)

### **For Breeders (Looking for Stud):**
1. ✅ Search entire system
2. ✅ Filter by breed, location, age, health
3. ✅ See breeder contact info
4. ✅ View dog's health certifications
5. ✅ See breeder ratings/reviews
6. ✅ Select external dog for mating record
7. 📧 Send mating request (future)

---

## 🔐 Privacy & Permissions

### **What's Public:**
- ✅ Dog name, breed, photo
- ✅ Age, color, markings
- ✅ Champion status, titles
- ✅ Health status (general)
- ✅ Breeder name, rating
- ✅ Breeder location (city/state/country)
- ✅ Breeder public contact info

### **What's Private:**
- ❌ Exact address
- ❌ Personal breeder email (unless public)
- ❌ Detailed health records (unless shared)
- ❌ Microchip number
- ❌ Private breeder notes

---

## 🚀 Future Enhancements

### **Phase 4: Mating Requests**
- [ ] "Request Mating" button
- [ ] In-app messaging system
- [ ] Notification system
- [ ] Request approval workflow
- [ ] Calendar integration

### **Phase 5: Advanced Matching**
- [ ] AI-powered compatibility scoring
- [ ] Genetic diversity calculator
- [ ] Pedigree analysis
- [ ] Health compatibility check
- [ ] Temperament matching

### **Phase 6: Marketplace Integration**
- [ ] Stud service listings
- [ ] Pricing and availability calendar
- [ ] Booking system
- [ ] Payment integration
- [ ] Review system for stud services

---

## 📊 Benefits

### **For the Platform:**
- ✅ Increased user engagement
- ✅ More comprehensive mating records
- ✅ Better breeding outcomes
- ✅ Network effects (more users = more options)
- ✅ Foundation for marketplace features

### **For Breeders:**
- ✅ Access to wider gene pool
- ✅ Find better breeding matches
- ✅ Connect with other breeders
- ✅ Improve breeding programs
- ✅ Increase stud service opportunities

### **For Dog Owners:**
- ✅ Monetize stud services
- ✅ Reach more potential clients
- ✅ Build reputation
- ✅ Track breeding history
- ✅ Professional presentation

---

## 🎉 Summary

**Created:** System-wide mating partner search API  
**Purpose:** Find compatible breeding partners across entire platform  
**Integration:** Works with existing Mating Calculator  
**Filters:** Breed, sex, location, age, health, champion status  
**Privacy:** Public profiles only, breeder contact included  
**Next Steps:** Enhance AnimalPickerDialog UI  

**This creates a comprehensive breeding network where breeders can find the BEST mating partners, not just their own animals!** 🐕✨
