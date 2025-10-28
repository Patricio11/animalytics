# Animalyzer Implementation Plan for Claude CLI

## Project Context
Building the core breeding analytics features for Animalyzer, focusing on Breeder role functionality. The design system and basic navigation are complete. Need to implement the critical calculation engines and complete animal profile management.

---

## PHASE 1: Progesterone Calculator Foundation (CRITICAL)

### Task 1.1: Create Calculation Logic Infrastructure
**Goal**: Implement the 4 progesterone calculation matrices from Excel specifications

**Files to Create/Modify:**
```
lib/calculations/
  ├── progesterone-matrices.ts          # All 4 calculation matrices
  ├── progesterone-calculator.ts        # Core calculation logic
  └── types.ts                          # Calculation type definitions
```

**Implementation Details:**

1. **Create `lib/calculations/types.ts`**
```typescript
export type Laboratory = 'VIDAS' | 'IDEXX';
export type Unit = 'nanograms' | 'nanomoles';
export type BreedingMethod = 'natural_ai' | 'tci' | 'surgical_ai' | 'frozen';
export type DayNumber = 0 | 1 | 2 | 3 | 4 | 5;

export interface ProgesteroneReading {
  day: DayNumber;
  value: number;
  date: Date;
}

export interface ProgesteroneCalculationInput {
  laboratory: Laboratory;
  unit: Unit;
  breedingMethod: BreedingMethod;
  readings: ProgesteroneReading[];
}

export interface ProgesteroneRating {
  rating: number; // 1-10
  alternativeRating?: number;
  matchedPattern: string;
  confidence: number;
}
```

2. **Create `lib/calculations/progesterone-matrices.ts`**
```typescript
// Implement all 4 matrices from Excel:
// - VIDAS nanograms (Fresh/Chilled Natural AI, Surgical AI, Frozen)
// - VIDAS nanomoles (Fresh/Chilled Natural AI, Surgical AI, Frozen)
// - IDEXX nanograms (Fresh/Chilled Natural AI, Surgical AI, Frozen)
// - IDEXX nanomoles (Fresh/Chilled Natural AI, Surgical AI, Frozen)

// Structure example:
export const VIDAS_NANOGRAMS = {
  natural_ai: {
    patterns: [
      {
        days: { 0: [2.8, 3.5], 1: [3.5, 6], 2: [6, 9.5], 3: [9.5, 12], 4: [12, 20], 5: [20, 30] },
        rating: 9,
        alternativeRating: 8,
        description: "First Mating"
      },
      // ... all other patterns from Excel
    ]
  },
  surgical_ai: { /* ... */ },
  frozen: { /* ... */ }
};

// Repeat for all 4 lab/unit combinations
```

3. **Create `lib/calculations/progesterone-calculator.ts`**
```typescript
import { ProgesteroneCalculationInput, ProgesteroneRating } from './types';
import { VIDAS_NANOGRAMS, VIDAS_NANOMOLES, IDEXX_NANOGRAMS, IDEXX_NANOMOLES } from './progesterone-matrices';

export function calculateProgesteroneRating(input: ProgesteroneCalculationInput): ProgesteroneRating {
  // 1. Select correct matrix based on laboratory and unit
  // 2. Get breeding method patterns
  // 3. Match readings against patterns
  // 4. Return rating with confidence score
}

export function validateProgesteroneReading(value: number, laboratory: Laboratory, unit: Unit): boolean {
  // Validate reading is within expected ranges for lab/unit
}
```

**Acceptance Criteria:**
- All 4 calculation matrices accurately coded from Excel data
- Calculator function returns correct ratings for test cases
- Unit tests pass for sample progesterone sequences

---

### Task 1.2: Build Progesterone Input UI Components
**Goal**: Create form components for entering daily progesterone readings with beautiful UX/UI

**Files to Create:**
```
components/breeder/calculators/
  ├── ProgesteroneInputForm.tsx          # Main form component
  ├── DailyReadingInput.tsx              # Individual day input
  ├── LabSelectorCard.tsx                # Laboratory/unit selection
  └── ProgesteroneRatingDisplay.tsx      # Rating visualization
```

**Implementation Details:**

1. **Create `components/breeder/calculators/ProgesteroneInputForm.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { DailyReadingInput } from './DailyReadingInput';
import { LabSelectorCard } from './LabSelectorCard';
import { ProgesteroneRatingDisplay } from './ProgesteroneRatingDisplay';

export function ProgesteroneInputForm() {
  // State for lab, unit, breeding method, and 6 daily readings
  // Calculate rating in real-time as readings are entered
  // Show validation errors for out-of-range values
  // Display rating with confidence indicator
}
```

2. **Create daily reading inputs with date pickers and numeric validation**
3. **Add visual feedback for rating quality (color-coded: red/yellow/green)**
4. **Implement "Save Reading" to persist to mating record**

**Design Requirements:**
- Use BreedBook Pro styling (shadow-card, bg-gradient-brand)
- Responsive layout for mobile data entry
- Clear visual hierarchy for Day 0 → Day 5 progression
- Inline validation with helpful error messages

**Acceptance Criteria:**
- Can input readings for all 6 days with date selection
- Laboratory/unit switching updates validation ranges
- Rating displays in real-time as readings are entered
- Form saves data to local state (backend integration later)

---

### Task 1.3: Create Mating Calculator Dashboard
**Goal**: Build the mating calculator page with empty state and mating list

**Files to Create:**
```
app/(breeder)/calculators/mating/
  ├── page.tsx                          # Main mating calculator page
  ├── [id]/page.tsx                     # Individual mating detail view
  └── new/page.tsx                      # Create new mating flow

components/breeder/calculators/
  ├── MatingCard.tsx                    # Mating summary card
  ├── MatingEmptyState.tsx              # Empty state with CTA
  └── AnimalPickerDialog.tsx            # Select bitch + dog/frozen semen
```

**Implementation Details:**

1. **Mating Calculator Dashboard** (`app/(breeder)/calculators/mating/page.tsx`)
   - Display existing matings with conception ratings
   - Show empty state when no matings exist
   - "Create New Mating" button → animal picker dialog

2. **Animal Picker Dialog** (select bitch, then dog or frozen semen)
   - Filter by sex (bitches vs dogs)
   - Search by name
   - Display animal photos and key info
   - Support frozen semen selection as alternative to dog

3. **Mating Detail Page** (`app/(breeder)/calculators/mating/[id]/page.tsx`)
   - Display selected animals
   - Show progesterone input form
   - Display three ratings: Progesterone Cycle, Conception, Overall
   - Link to full conception calculator wizard

**Mock Data Required:**
```typescript
// lib/mock-data/matings.ts
export const mockMatings = [
  {
    id: '1',
    bitchId: 'animal-1',
    dogId: 'animal-2',
    matingDate: new Date('2024-01-15'),
    progesteroneRating: 95.0,
    conceptionRating: 42.7,
    overallRating: 67.5,
    status: 'confirmed' | 'planned' | 'unsuccessful'
  }
];
```

**Acceptance Criteria:**
- Empty state displays with proper CTA
- Animal picker filters and searches correctly
- Can create new mating with bitch + dog selection
- Mating cards show key info and ratings
- Navigation to detail view works

---

## PHASE 2: Conception Rating Calculator Wizard

### Task 2.1: Build Multi-Step Wizard Framework
**Goal**: Create reusable wizard component for multi-step forms with state persistence

**Files to Create:**
```
components/breeder/calculators/wizard/
  ├── WizardContainer.tsx               # Main wizard wrapper
  ├── WizardStep.tsx                    # Individual step component
  ├── WizardProgress.tsx                # Progress indicator
  └── WizardNavigation.tsx              # Back/Next/Save buttons

lib/hooks/
  └── use-wizard-state.ts               # State management hook
```

**Implementation Details:**

1. **Wizard State Management** (`lib/hooks/use-wizard-state.ts`)
```typescript
export function useWizardState(initialData: any) {
  // Track current step (0-indexed)
  // Store form data for all steps
  // Handle validation before step transitions
  // Implement "Save & Continue" with localStorage persistence
  // Return: { currentStep, data, nextStep, prevStep, updateData, saveProgress }
}
```

2. **Wizard Container** - handles layout, progress, navigation
3. **Step Components** - individual form screens
4. **Progress Indicator** - shows current position in wizard (e.g., "Step 3 of 9")

**Design Requirements:**
- Visual progress bar at top
- Step titles clickable (if previous steps valid)
- "Save & Exit" preserves partial progress
- "Update Animal" button links to animal profile tabs

**Acceptance Criteria:**
- Can navigate forward/backward through steps
- Form data persists across step changes
- Validation prevents advancing with errors
- "Save & Continue" stores progress to localStorage
- Progress indicator updates correctly

---

### Task 2.2: Implement Mating Calculator Wizard Steps
**Goal**: Create all 9 wizard steps for the full mating calculator

**Files to Create:**
```
components/breeder/calculators/wizard/steps/
  ├── BreedSelectionStep.tsx            # Step 1: Confirm breed details
  ├── BitchInformationStep.tsx          # Step 2: Age, weight, health
  ├── BitchHistoryStep.tsx              # Step 3: Breeding history
  ├── LitterHistoryStep.tsx             # Step 4: Previous litters
  ├── DogHistoryStep.tsx                # Step 5: Dog breeding history
  ├── BreederHistoryStep.tsx            # Step 6: Breeder experience
  ├── SemenInformationStep.tsx          # Step 7: Semen type/timing
  ├── SemenAssessmentStep.tsx           # Step 8: Quality assessment
  └── ConceptionRatingStep.tsx          # Step 9: Final rating display
```

**Step-by-Step Requirements:**

**Step 1: Breed Selection**
- Display breed from animal profile (read-only)
- Show breed success rating (1-3 from dog breeds data)
- Highlight missing required data with "Update Animal" links

**Step 2: Bitch Information**
- Age (calculated from DOB, editable override)
- Current weight
- Body condition score
- Health status questions (pre-populated from previous calculations)

**Step 3: Bitch History**
- Has been bred before? (yes/no)
- Number of previous litters
- Time since last litter
- Any breeding complications

**Step 4: Litter History**
- Table of previous litters from animal profile
- For each litter: date, sire, puppy count, complications
- "Add Litter" button → links to animal profile litter tab
- Used in conception rating calculation

**Step 5: Dog History**
- Has been used for breeding? (yes/no)
- Number of previous litters sired
- Success rate
- Age at first use

**Step 6: Breeder History**
- Years of breeding experience
- Number of litters produced total
- Breed familiarity rating

**Step 7: Semen Information**
- Type: Fresh, Chilled, or Frozen
- If Chilled: time between collection and insertion
- If Frozen: age of dog at collection, batch usage history
- Collection date

**Step 8: Semen Assessment**
- Assessment type: Visual or Full Assessment
- If Visual: semen quality dropdown (poor/fair/good/excellent)
- If Full: select from saved assessments or add new one
- Shows: volume, concentration, motility, morphology

**Step 9: Conception Rating Display**
- Overall conception rating percentage (large display)
- Information accuracy rating (5-star system)
- Section breakdown with contribution percentages:
  - Breed (XX%)
  - Bitch Information (XX%)
  - Bitch History (XX%)
  - Litter History (XX%)
  - Dog History (XX%)
  - Breeder History (XX%)
  - Semen Quality (XX%)
- Each section title is clickable to return to that step

**Mock Data Required:**
```typescript
// lib/mock-data/conception-factors.ts
export const mockConceptionFactors = {
  breedRatings: { 'Labrador': 3, 'Bulldog': 1, 'German Shepherd': 2 },
  ageFactors: { '2-3': 1.0, '4-6': 0.9, '7+': 0.7 },
  experienceFactors: { '0-2': 0.8, '3-5': 1.0, '6+': 1.1 }
};
```

**Acceptance Criteria:**
- All 9 steps render with proper form fields
- Pre-population works from animal profile data
- Data flows correctly from step to step
- Final rating calculates based on all inputs
- Section breakdown shows contribution percentages

---

### Task 2.3: Implement Conception Rating Calculation
**Goal**: Create the algorithm that combines all factors into a conception rating

**Files to Create:**
```
lib/calculations/
  ├── conception-rating.ts              # Main calculation function
  ├── conception-factors.ts             # Factor weightings
  └── conception-types.ts               # Type definitions
```

**Implementation Details:**

1. **Conception Rating Algorithm** (`lib/calculations/conception-rating.ts`)
```typescript
export function calculateConceptionRating(inputs: ConceptionInputs): ConceptionRating {
  // 1. Calculate breed factor (1-3 from dog breeds)
  // 2. Calculate age factor (optimal age = higher rating)
  // 3. Calculate breeding history factor
  // 4. Calculate litter history factor (previous success)
  // 5. Calculate dog quality factor
  // 6. Calculate semen quality factor
  // 7. Calculate breeder experience factor
  // 8. Combine weighted factors into overall percentage
  // 9. Calculate information accuracy based on completed fields
  
  return {
    overallRating: number, // 0-100%
    informationAccuracy: number, // 0-5 stars
    breakdown: {
      breed: { contribution: number, maxPossible: number },
      bitchInfo: { contribution: number, maxPossible: number },
      // ... for all sections
    }
  };
}
```

2. **Factor Weightings** - define how much each section contributes
3. **Information Accuracy** - calculate based on filled vs skipped fields

**Note**: Exact calculation formula needs veterinary validation. For now, implement a reasonable weighted average system that can be tuned later.

**Acceptance Criteria:**
- Calculation returns percentage between 0-100%
- Information accuracy reflects form completion
- Section breakdown totals to 100%
- Test cases pass for sample input combinations

---

## PHASE 3: Animal Profile Enhancements

### Task 3.1: Implement Tab-Based Animal Profile
**Goal**: Convert single-page animal view to tabbed interface with sex-specific tabs

**Files to Modify/Create:**
```
app/(breeder)/animals/[id]/
  └── page.tsx                          # Main profile page with tabs

components/breeder/animals/
  ├── AnimalProfileTabs.tsx             # Tab navigation component
  ├── ProfileTab.tsx                    # Basic info (existing)
  ├── PhotosDocsTab.tsx                 # Photos & documents
  ├── FeedingPlanTab.tsx                # Feeding schedule
  ├── SemenTab.tsx                      # Semen assessments
  ├── SeasonsTab.tsx                    # Heat cycles (bitches only)
  ├── LitterDetailsTab.tsx              # Litter history (bitches only)
  └── RemindersTab.tsx                  # Reminder settings
```

**Implementation Details:**

1. **Tab Navigation** (`components/breeder/animals/AnimalProfileTabs.tsx`)
```typescript
const dogTabs = ['Profile', 'Photos & Docs', 'Feeding', 'Semen', 'Reminders'];
const bitchTabs = ['Profile', 'Photos & Docs', 'Feeding', 'Semen', 'Seasons', 'Litter Details', 'Reminders'];

// Render appropriate tabs based on animal sex
// Highlight active tab with gradient styling
```

2. **Photos & Documents Tab** (`PhotosDocsTab.tsx`)
   - Categories: Shelter, Whelping Areas, Vaccinations, Pedigree, Council registration, Parents, Baby photos
   - Upload limit: 10 items per category, 30MB per file
   - Grid layout with thumbnails
   - Click to view full size

3. **Feeding Plan Tab** (`FeedingPlanTab.tsx`)
   - Customizable feeding schedule
   - Food type and amount per feeding
   - Time of day for each feeding
   - Special dietary notes

4. **Semen Tab** (`SemenTab.tsx`)
   - List of semen assessments
   - Add new assessment button
   - Display: date, volume, concentration, motility, morphology
   - Link assessments to mating calculations

5. **Seasons Tab** (`SeasonsTab.tsx` - Bitches only)
   - List of heat cycles
   - For each season: start date, end date, notes
   - Associated progesterone readings
   - Add new season button

6. **Litter Details Tab** (`LitterDetailsTab.tsx` - Bitches only)
   - List of previous litters
   - For each: mating date, sire, whelping date, puppy count, complications
   - Pregnancy tracking for current litter
   - Add new litter button

7. **Reminders Tab** (`RemindersTab.tsx`)
   - Enable/disable reminders for this animal
   - Customize reminder types and frequencies

**Mock Data Required:**
```typescript
// Extend lib/mock-data/animals.ts
export const mockAnimalDetails = {
  photos: { shelter: [...], whelpingAreas: [...] },
  feedingPlan: { schedule: [...] },
  semenAssessments: [...],
  seasons: [...],
  litters: [...]
};
```

**Acceptance Criteria:**
- Tabs render correctly for dogs vs bitches
- Each tab displays mock data properly
- Can navigate between tabs without data loss
- Upload UI shows (functional upload in Phase 4)
- Mobile-responsive tab navigation

---

### Task 3.2: Create Semen Assessment Form
**Goal**: Build form for recording detailed semen assessments

**Files to Create:**
```
components/breeder/animals/
  ├── SemenAssessmentDialog.tsx         # Modal form
  └── SemenAssessmentCard.tsx           # Display card
```

**Form Fields:**
- Assessment date (required)
- Assessment type: Visual or Full Assessment (required)
- **If Visual**: Semen quality dropdown (Poor/Fair/Good/Excellent)
- **If Full Assessment**:
  - Volume (ml)
  - Concentration (million/ml)
  - Motility (%)
  - Morphology (% normal)
  - Progressive motility (%)
  - Notes (optional)

**Acceptance Criteria:**
- Form validates required fields
- Conditional fields show based on assessment type
- Saves to mock data structure
- Displays in list on Semen tab
- Can edit/delete existing assessments

---

### Task 3.3: Create Season/Heat Cycle Tracker
**Goal**: Build UI for tracking bitch heat cycles and progesterone readings

**Files to Create:**
```
components/breeder/animals/
  ├── SeasonDialog.tsx                  # Add/edit season
  ├── SeasonCard.tsx                    # Season summary card
  └── SeasonProgesteroneChart.tsx       # Chart of readings
```

**Implementation Details:**

1. **Season Form** (`SeasonDialog.tsx`)
   - Start date (required)
   - End date (optional - may still be in season)
   - Notes (optional)
   - Associated progesterone readings (optional)

2. **Season Card** - displays in list on Seasons tab
   - Date range
   - Number of progesterone readings
   - Link to view readings chart
   - Edit/delete buttons

3. **Progesterone Chart** - line chart showing readings over days
   - X-axis: Day 0-5
   - Y-axis: Progesterone level
   - Color-coded by laboratory type

**Acceptance Criteria:**
- Can add new season with validation
- Season list displays chronologically
- Progesterone readings link to season
- Chart renders correctly with sample data

---

### Task 3.4: Create Litter Management Interface
**Goal**: Build comprehensive litter tracking for bitches

**Files to Create:**
```
components/breeder/animals/
  ├── LitterDialog.tsx                  # Add/edit litter
  ├── LitterCard.tsx                    # Litter summary
  └── PregnancyTracker.tsx              # Current pregnancy widget
```

**Litter Form Fields:**
- Sire (select from dogs or frozen semen)
- Mating date (required)
- Expected whelping date (calculated: mating date + 63 days)
- Actual whelping date (optional)
- Number of puppies (optional until whelped)
- Number of puppies surviving
- Complications (optional text)
- Notes (optional)

**Pregnancy Tracker Widget:**
- For current pregnancy: show day count and expected whelping date
- Visual progress bar
- Milestone reminders (ultrasound dates, vet checks)

**Mock Data:**
```typescript
export const mockLitters = [
  {
    id: '1',
    bitchId: 'animal-1',
    sireId: 'animal-2',
    matingDate: new Date('2024-01-15'),
    expectedWhelping: new Date('2024-03-18'),
    actualWhelping: new Date('2024-03-20'),
    puppyCount: 6,
    survivingPuppies: 6,
    complications: 'None',
    notes: 'All healthy'
  }
];
```

**Acceptance Criteria:**
- Can add litter with sire selection
- Expected whelping date auto-calculates
- Litter cards show key info
- Pregnancy tracker shows for in-progress pregnancies
- Data links to conception calculator

---

## PHASE 4: Task & Report Systems

### Task 4.1: Enhanced Task Management
**Goal**: Expand basic task page to support all task types with specific forms

**Files to Create/Modify:**
```
app/(breeder)/tasks/page.tsx            # Enhanced task list

components/breeder/tasks/
  ├── FeedingTaskDialog.tsx             # Feeding task form
  ├── ExerciseTaskDialog.tsx            # Exercise log form
  ├── GroomingTaskDialog.tsx            # Grooming reminder
  ├── WeightTaskDialog.tsx              # Weight tracking
  ├── CleaningTaskDialog.tsx            # Cleaning schedule
  ├── PuppyFeedingGenerator.tsx         # Auto-generate puppy schedule
  └── EventTaskDialog.tsx               # Vet visits, treatments
```

**Task Type Implementations:**

1. **Feeding Task**
   - Animal selection
   - Food type
   - Amount (grams/cups)
   - Time of day
   - Completed checkbox

2. **Exercise Task**
   - Animal selection
   - Exercise type (walk, play, training)
   - Duration
   - Notes

3. **Grooming Task**
   - Animal selection
   - Grooming type (bath, brush, nails, ears)
   - Frequency (one-time or recurring)

4. **Weight Task**
   - Animal selection
   - Weight (auto-generated weekly for each animal)
   - Chart showing weight over time

5. **Cleaning Task**
   - Area (kennel, whelping box, yard)
   - Cleaning type (daily, deep clean)
   - Frequency

6. **Puppy Feeding Auto-Generator**
   - Based on puppy age (from litter whelping date)
   - 3-4 months: 3 feedings/day
   - 4-6 months: 2 feedings/day
   - Auto-creates tasks

7. **Event Tasks**
   - Type: Vet visit, Worming, Heartworm, Flea/Tick, Rugging, Pest management
   - Auto-setup monthly for Worming, Heartworm, Flea/Tick
   - Date/time
   - Notes

**Acceptance Criteria:**
- Each task type has appropriate form
- Tasks display with type-specific icons
- Can filter by task type
- Completed tasks marked visually
- Puppy feeding generator creates correct schedule

---

### Task 4.2: Implement Reports System
**Goal**: Create all 7 report types with filtering and export
Note: the 7 reports can be Tabs in reports page, instead of creating pages for eachone I think will be best, what you think
**Files to Create:**
```
app/(breeder)/reports/
  ├── page.tsx                          # Reports dashboard
  ├── feeding/page.tsx                  # Feeding report
  ├── exercise/page.tsx                 # Exercise report
  ├── grooming/page.tsx                 # Grooming report
  ├── cleaning/page.tsx                 # Cleaning report
  ├── events/page.tsx                   # Events calendar
  ├── puppies/page.tsx                  # Puppy tracking
  └── mating-history/page.tsx           # Mating history comparison

components/breeder/reports/
  ├── ReportFilterBar.tsx               # Date range + animal filter
  ├── ReportTable.tsx                   # Generic table component
  ├── MatingHistoryComparison.tsx       # Multi-mating progesterone chart
  └── ReportExportButton.tsx            # CSV/PDF export
```

**Report Specifications:**

1. **Events Report**
   - Calendar view + table view
   - Shows all scheduled events
   - Filter by event type and date range

2. **Feeding Report**
   - Table: Date, Animal, Food, Amount, Time
   - Filter by animal and date range
   - Summary: total food consumed per animal

3. **Exercise/Grooming/Cleaning Reports**
   - Similar table structure
   - Activity completion tracking

4. **Puppies Report**
   - List of all puppies from litters
   - Growth tracking
   - Feeding schedule adherence

5. **Mating History Report** (CRITICAL)
   - Multi-mating comparison table
   - Columns: Mating date, Bitch, Dog, Progesterone readings (Day 0-5), Conception rating
   - Chart comparing progesterone curves across matings
   - Export functionality

**Acceptance Criteria:**
- All 7 reports render with mock data
- Filtering works correctly
- Tables are sortable
- Mating history shows multi-mating comparison
- Export buttons present (functional export in later phase)

---

## PHASE 5: Marketplace & Polish

### Task 5.1: Complete Marketplace Features
**Goal**: Implement listing creation wizard and enhanced marketplace browsing

**Files to Create/Modify:**
```
app/(breeder)/marketplace/
  ├── page.tsx                          # Enhanced marketplace listing
  ├── create/page.tsx                   # Create listing wizard
  └── [id]/page.tsx                     # Listing detail page

components/breeder/marketplace/
  ├── CreateListingWizard.tsx           # 3-step wizard
  ├── ListingCard.tsx                   # Enhanced listing card
  ├── ListingCategorySelector.tsx       # Category selection
  └── ClinicSelector.tsx                # For reproductive services
```

**Listing Categories:**
- Dog for Sale
- Pups for Sale
- Reproductive Services (requires clinic selection)
- Frozen Semen for Sale (requires clinic selection)
- Stud Dog

**Create Listing Wizard Steps:**

1. **Animal Selection**
   - Select from user's animals or frozen semen
   - Choose category

2. **Contact Details**
   - Contact name
   - Phone
   - Email
   - Location
   - Availability notes

3. **Listing Details**
   - Price (optional)
   - Description
   - Additional photos (beyond animal profile)
   - For Reproductive Services/Frozen Semen: clinic dropdown
   - Visibility settings

**Acceptance Criteria:**
- Can create listings via 3-step wizard
- Listings display in marketplace
- Category filtering works
- Clinic selector shows for appropriate categories
- Listing detail page shows full information

---

### Task 5.2: Frozen Semen Management
**Goal**: Implement separate entity type for frozen semen inventory

**Files to Create:**
```
app/(breeder)/frozen-semen/
  ├── page.tsx                          # Frozen semen inventory
  ├── [id]/page.tsx                     # Frozen semen detail
  └── new/page.tsx                      # Add new frozen semen

components/breeder/frozen-semen/
  ├── FrozenSemenCard.tsx               # Inventory card
  ├── FrozenSemenForm.tsx               # Add/edit form
  └── FrozenSemenProfileTabs.tsx        # Similar to animal tabs
```

**Frozen Semen Profile Tabs:**
- Profile (dog info, collection date, clinic)
- Photos & Docs
- Semen Assessment (for this batch)

**Form Fields:**
- Source animal (select from dogs)
- Collection date
- Clinic/storage location
- Number of straws
- Batch identifier
- Storage notes

**Acceptance Criteria:**
- Can add frozen semen inventory
- Separate from live animals
- Can be selected in mating calculator
- Links to marketplace listings
- Shows in reports

---

## Implementation Order Summary

```
Progesterone Calculator
  ├── Task 1.1: Calculation matrices and logic ✓
  ├── Task 1.2: Progesterone input UI ✓
  └── Task 1.3: Mating calculator dashboard ✓

Conception Rating Wizard
  ├── Task 2.1: Wizard framework ✓
  ├── Task 2.2: All 9 wizard steps ✓
  └── Task 2.3: Conception rating calculation ✓

Animal Profile Enhancements
  ├── Task 3.1: Tab-based profile ✓
  ├── Task 3.2: Semen assessment form ✓
  ├── Task 3.3: Season tracker ✓
  └── Task 3.4: Litter management ✓

Tasks & Reports
  ├── Task 4.1: Enhanced task types ✓
  └── Task 4.2: All 7 reports ✓

Marketplace & Polish
  ├── Task 5.1: Complete marketplace ✓
  ├── Task 5.2: Frozen semen management ✓
  └── QA, bug fixes, mobile testing ✓
```

---

## Critical Dependencies & Notes

**Mock Data Files Needed:**
- `lib/mock-data/progesterone-readings.ts` (samples for all 4 lab types)
- `lib/mock-data/matings.ts` (expanded with full calculation inputs)
- `lib/mock-data/semen-assessments.ts`
- `lib/mock-data/seasons.ts`
- `lib/mock-data/litters.ts`
- `lib/mock-data/tasks.ts` (expanded with all types)
- `lib/mock-data/frozen-semen.ts`

**Design Consistency:**
- Maintain BreedBook Pro