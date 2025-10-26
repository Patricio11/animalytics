# Mating & Conception Workflow Guide
**Quick Reference for Developers & Breeders**

---

## Complete Workflow Overview

```
1. CREATE MATING RECORD
   ↓
2. ENTER PROGESTERONE READINGS (Optional but recommended)
   ↓
3. RUN CONCEPTION CALCULATOR (9-step wizard)
   ↓
4. VIEW OVERALL RATING & RECOMMENDATIONS
   ↓
5. TRACK PREGNANCY PROGRESS
   ↓
6. RECORD LITTER & PUPPIES
```

---

## Step 1: Create Mating Record

### User Flow:
1. Navigate to **Calculators** → **Mating Calculator**
2. Click **"New Mating"** button
3. Fill in the form:
   - **Bitch:** Select from your animals or search all
   - **Breeding Type:** Natural or Frozen Semen
   - **Dog/Semen:** Select stud dog or frozen semen batch
   - **Mating Date:** Date of breeding
   - **Breeding Method:** Natural AI, TCI, Surgical AI, or Frozen
   - **Notes:** Optional additional information
4. Click **"Create Mating"**

### Technical Details:
```typescript
// API Call
POST /api/matings
{
  bitchId: string,
  dogId?: string,
  frozenSemenId?: string,
  matingDate: string, // ISO date
  breedingMethod: 'natural_ai' | 'tci' | 'surgical_ai' | 'frozen',
  notes?: string
}

// Response
{
  success: true,
  data: {
    id: string,
    // ... mating record
  }
}
```

### Database:
- Record saved to `matings` table
- Status set to `'planned'`
- Ratings initially `null`

---

## Step 2: Enter Progesterone Readings

### User Flow:
1. Click on the mating record to view details
2. Navigate to **Progesterone Readings** section
3. Select:
   - **Laboratory:** VIDAS or IDEXX
   - **Unit:** Nanograms or Nanomoles
   - **Breeding Method:** (pre-filled from mating)
4. Enter readings for Day 0-5:
   - **Day:** 0, 1, 2, 3, 4, 5
   - **Value:** Progesterone level
   - **Date:** Date of test
5. Click **"Calculate"** to see rating
6. Click **"Save to Database"** to store

### Technical Details:
```typescript
// Calculation (Client-side)
import { calculateProgesteroneRating } from '@/lib/calculations';

const result = calculateProgesteroneRating({
  laboratory: 'VIDAS',
  unit: 'nanograms',
  breedingMethod: 'natural_ai',
  readings: [
    { day: 0, value: 2.5, date: new Date() },
    { day: 1, value: 4.2, date: new Date() },
    // ...
  ]
});

// Result
{
  rating: 8.5, // 0-10 scale
  alternativeRating: 7.2,
  matchedPattern: 'Optimal rising pattern',
  confidence: 92 // percentage
}

// API Call (Save to DB)
POST /api/progesterone-tests
{
  animalId?: string,
  matingId: string,
  testDate: string,
  laboratory: 'VIDAS' | 'IDEXX',
  unit: 'nanograms' | 'nanomoles',
  breedingMethod: string,
  readings: Array<{ day, value, date }>,
  rating: number,
  matchedPattern: string,
  confidence: number,
  // ... other calculated fields
}
```

### Rating Interpretation:
- **9-10:** Excellent - Optimal breeding window
- **7-8:** Good - Favorable timing
- **5-6:** Fair - Acceptable but not ideal
- **3-4:** Poor - Suboptimal timing
- **0-2:** Very Poor - Not recommended

---

## Step 3: Run Conception Calculator

### User Flow:
1. From mating detail page, click **"Run Conception Calculator"**
2. Complete 9-step wizard:

#### **Step 1: Animal Selection**
- Bitch and dog (pre-filled)
- Verify information

#### **Step 2: Bitch Information**
- Age at mating (years)
- Weight (kg)
- Body condition score (1-9, ideal: 5)
- Health status (excellent/good/fair/poor)
- **NEW:** Living condition (kennels/pack/alone)
- **NEW:** Position in pack (dominant/doesn't care/bottom)
- **NEW:** Runs with others? (yes/no)
- **NEW:** How many dogs runs with?
- **NEW:** Ran with others during previous pregnancies?

#### **Step 3: Bitch History**
- Has been bred before? (yes/no)
- Number of previous litters
- Months since last litter
- Previous complications? (yes/no)
- **NEW:** Previous pregnancies? (yes/no)
- **NEW:** Number of siblings (0/1-3/4-5/6+)
- **NEW:** Number of breedings
- **NEW:** Had mating that didn't produce? (yes/no)
- **NEW:** How many times didn't produce? (1/2/3+)

#### **Step 4: Litter History** (Optional)
- Previous litter details
- Puppy counts
- Complications

#### **Step 5: Dog History**
- Has been used for breeding? (yes/no)
- Previous litters sired
- Success rate (%)
- Age at first use
- **NEW:** Litters sired (0/1-2/3-5/5+)
- **NEW:** Father's litters sired (1-3/4-10/11+)
- **NEW:** Recent litter date (<1mo/1-6mo/6-18mo/>18mo)
- **NEW:** Pups in most recent sire (0/1-3/4-6/7+)

#### **Step 6: Breeder History** (Optional)
- Years of experience
- Total litters bred
- Breed familiarity

#### **Step 7: Semen Information**
- Type (fresh/chilled/frozen)
- Collection date
- **NEW:** Time between collection and insemination (<24hrs/24-48hrs/>48hrs) - for chilled
- **NEW:** Age of dog at collection (years)
- **NEW:** Batch used previously? (yes/no)
- **NEW:** Did produce pups? (yes/no)
- **NEW:** How many pups produced? (1-3/4-6/7+)

#### **Step 8: Semen Assessment**
- **NEW:** Inseminator name
- **NEW:** Semen assessed? (yes/no)
- Assessment type (full/visual/none)
- **For Full Assessment:**
  - Volume (ml)
  - Concentration (million/ml)
  - Motility (%)
  - Morphology (% normal)
- **For Visual Assessment:**
  - Quality (excellent/good/poor)
  - Notes

#### **Step 9: Results**
- View overall conception rating
- See breakdown by section
- Read recommendations

### Technical Details:
```typescript
// API Call
POST /api/matings/[id]/calculate
{
  progesterone?: {
    laboratory: 'VIDAS' | 'IDEXX',
    unit: 'nanograms' | 'nanomoles',
    breedingMethod: string,
    readings: Array<{ day, value }>
  },
  conception: {
    breed: string,
    dogBreed: string,
    bitchInformation: { ... },
    bitchHistory: { ... },
    litterHistory: { ... },
    dogHistory: { ... },
    breederHistory: { ... },
    semenInformation: { ... },
    semenAssessment: { ... }
  }
}

// Response
{
  success: true,
  data: {
    mating: { ... }, // Updated mating record
    progesterone: {
      rating: 8.5,
      ratingPercentage: 85,
      trend: 'rising',
      recommendation: '...'
    },
    conception: {
      overallRating: 78.5, // 0-100%
      informationAccuracy: 4.5, // 0-5 stars
      breakdown: {
        breed: { score, weight, contribution, percentage },
        bitchInformation: { ... },
        bitchHistory: { ... },
        litterHistory: { ... },
        dogHistory: { ... },
        breederHistory: { ... },
        semenQuality: { ... }
      },
      totalWeight: 95, // % of data provided
      missingWeight: 5 // % of data missing
    },
    overall: {
      rating: 81.2, // Weighted: 40% prog + 60% conception
      hasProgesterone: true,
      hasConception: true
    }
  }
}
```

### Rating Interpretation:
- **85-100%:** Excellent - High conception probability
- **70-84%:** Good - Favorable conditions
- **55-69%:** Fair - Moderate probability
- **40-54%:** Poor - Suboptimal conditions
- **0-39%:** Very Poor - Not recommended

### Information Accuracy (Stars):
- **5 stars:** All sections completed (100%)
- **4 stars:** Most sections completed (80%)
- **3 stars:** Half sections completed (60%)
- **2 stars:** Few sections completed (40%)
- **1 star:** Minimal data (<20%)

---

## Step 4: View Overall Rating

### What You See:
1. **Progesterone Cycle Rating** (0-100%)
   - Based on hormone levels
   - Breeding window timing

2. **Conception Rating** (0-100%)
   - Based on 7 factors
   - Weighted by importance

3. **Overall Rating** (0-100%)
   - Combined score
   - 40% progesterone + 60% conception

4. **Detailed Breakdown**
   - Each section's contribution
   - Missing data indicators
   - Recommendations

### Recommendations Examples:
- **Excellent (85%+):** "Optimal breeding conditions. Proceed with confidence."
- **Good (70-84%):** "Favorable conditions. Good conception probability."
- **Fair (55-69%):** "Acceptable conditions. Consider improving timing or semen quality."
- **Poor (40-54%):** "Suboptimal conditions. Recommend postponing or improving factors."
- **Very Poor (<40%):** "Not recommended. Address health, timing, or semen quality issues."

---

## Step 5: Track Pregnancy

### User Flow:
1. After mating confirmed, create litter record
2. Navigate to **Animals** → Select bitch → **Litters** tab
3. Click **"Add Litter"**
4. Fill in:
   - Mating date (pre-filled)
   - Expected whelping date (auto-calculated: +63 days)
   - Status: **Expected**
5. View **Pregnancy Tracker**:
   - Days since mating
   - Days until whelping
   - Progress percentage
   - Milestones

### Pregnancy Milestones:
- **Day 21:** Early ultrasound - First confirmation
- **Day 30:** Confirmed pregnancy - Clearly visible
- **Day 45:** X-ray for puppy count - Skeletal structures
- **Day 58:** Prepare whelping area - Setup time
- **Day 63:** Expected whelping - Average day

### Technical Details:
```typescript
// API Call
POST /api/litters
{
  bitchId: string,
  sireId: string,
  matingId: string,
  matingDate: string,
  expectedWhelpingDate: string, // +63 days
  status: 'expected'
}

// Pregnancy Progress Calculation
const daysSinceMating = differenceInDays(today, matingDate);
const daysUntilWhelping = differenceInDays(expectedWhelpingDate, today);
const progressPercentage = (daysSinceMating / 63) * 100;
```

---

## Step 6: Record Litter & Puppies

### After Whelping:
1. Update litter record:
   - **Actual whelping date**
   - **Status:** Whelped
   - **Puppy count**
   - **Males/Females count**
   - **Complications** (if any)

2. Add individual puppies:
   - Name
   - Sex
   - Birth weight
   - Color/markings
   - Status (alive/deceased)

### Technical Details:
```typescript
// Update Litter
PATCH /api/litters/[id]
{
  actualWhelpingDate: string,
  status: 'whelped',
  puppyCount: number,
  malesCount: number,
  femalesCount: number,
  complications: boolean,
  notes: string
}

// Add Puppies
POST /api/puppies
{
  litterId: string,
  name: string,
  sex: 'male' | 'female',
  birthWeight: number,
  color: string,
  markings: string,
  status: 'alive' | 'deceased'
}
```

---

## Key Features

### 1. Comprehensive Data Collection
- 22 new fields added to legacy system
- 106 factor constants based on research
- Covers all aspects of breeding

### 2. Smart Validation
- Required field checks
- Age range warnings
- Health status alerts
- Timing recommendations

### 3. Accurate Calculations
- Progesterone pattern matching
- Multi-factor conception rating
- Weighted section contributions
- Information accuracy tracking

### 4. Detailed Reporting
- Section-by-section breakdown
- Missing data indicators
- Actionable recommendations
- Historical tracking

### 5. Pregnancy Monitoring
- Milestone tracking
- Progress visualization
- Whelping countdown
- Complication alerts

---

## API Endpoints Summary

### Matings
- `GET /api/matings` - List all matings
- `GET /api/matings/[id]` - Get single mating
- `POST /api/matings` - Create mating
- `PATCH /api/matings/[id]` - Update mating
- `DELETE /api/matings/[id]` - Delete mating
- `POST /api/matings/[id]/calculate` - Run calculations

### Progesterone Tests
- `GET /api/progesterone-tests` - List tests
- `GET /api/progesterone-tests/[id]` - Get single test
- `POST /api/progesterone-tests` - Create test
- `PATCH /api/progesterone-tests/[id]` - Update test
- `DELETE /api/progesterone-tests/[id]` - Delete test

### Litters
- `GET /api/litters` - List litters
- `GET /api/litters/[id]` - Get single litter
- `POST /api/litters` - Create litter
- `PATCH /api/litters/[id]` - Update litter
- `DELETE /api/litters/[id]` - Delete litter

### Puppies
- `GET /api/puppies` - List puppies
- `POST /api/puppies` - Add puppy
- `PATCH /api/puppies/[id]` - Update puppy
- `DELETE /api/puppies/[id]` - Delete puppy

---

## Troubleshooting

### Issue: Progesterone rating is 0
**Solution:** Ensure readings are entered for at least 2 days with valid values.

### Issue: Conception rating is low despite good data
**Solution:** Check for:
- Age outside optimal range (2-7 years)
- Poor health status
- Recent complications
- Low semen quality
- Suboptimal timing

### Issue: Missing data warning
**Solution:** Complete more wizard steps. Aim for 5 stars (all sections).

### Issue: Can't create mating
**Solution:** Verify:
- Bitch and dog are selected
- Mating date is valid
- Breeding method is selected
- User owns the bitch

---

## Best Practices

### For Breeders:
1. **Complete all wizard steps** for most accurate rating
2. **Enter progesterone readings** for timing optimization
3. **Update litter records** promptly after whelping
4. **Track milestones** during pregnancy
5. **Record complications** for future reference

### For Developers:
1. **Always validate** user inputs
2. **Handle errors** gracefully with user-friendly messages
3. **Cache calculations** to avoid redundant processing
4. **Log important events** for debugging
5. **Test edge cases** (missing data, extreme values)

---

## Support & Documentation

- **Full Audit:** See `PRODUCTION_READINESS_AUDIT.md`
- **Calculation Details:** See `CALCULATION_UPDATES.md`
- **Type Definitions:** See `lib/types/`
- **API Documentation:** See API endpoint files

---

**Last Updated:** October 26, 2025  
**Version:** 1.0 (Production Ready)
