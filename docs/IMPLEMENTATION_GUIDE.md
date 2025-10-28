# 🚀 PRIORITY 1 IMPLEMENTATION GUIDE
**Systematic Implementation of All Critical Features**

---

## ✅ COMPLETED TASKS

### 1.1 ✅ Progesterone Tests Database Schema
**Status:** COMPLETE
**Files Created:**
- `lib/db/schema/progesterone-tests.ts` - Full schema with all fields
- Updated `lib/db/schema/index.ts` - Export added

**Schema Features:**
- Links to animals (optional)
- Links to matings (optional)
- Stores all 6 days of readings
- Stores calculation results (rating, trend, recommendations)
- Stores breeding window
- Timestamps for tracking

**Next Step:** Run database migration to create table

---

### 1.2 ✅ Progesterone Tests API Routes
**Status:** COMPLETE
**Files Created:**
- `app/api/progesterone-tests/route.ts` - POST (create) and GET (list) endpoints
- `app/api/progesterone-tests/[id]/route.ts` - GET, PATCH, DELETE for individual tests
- `lib/api/queries/progesterone-tests.ts` - React Query hooks

**API Features:**
- Full CRUD operations
- Filter by animal or mating
- Limit results
- Proper authentication
- Error handling
- Joins with animal data

**React Query Hooks:**
- `useProgesteroneTests()` - Fetch all tests
- `useProgesteroneTest(id)` - Fetch single test
- `useCreateProgesteroneTest()` - Create new test
- `useUpdateProgesteroneTest()` - Update existing test
- `useDeleteProgesteroneTest()` - Delete test

---

## 🔄 IN PROGRESS TASKS

### 1.3 🔄 Update ProgesteroneInputForm with Database Integration
**Status:** PARTIALLY COMPLETE (imports added, needs UI implementation)
**File:** `components/breeder/calculators/ProgesteroneInputForm.tsx`

**What's Done:**
- ✅ Imports added for database hooks
- ✅ State variables added (`selectedAnimal`, `isSaving`)
- ✅ `useCreateProgesteroneTest()` hook initialized

**What's Needed:**
Add this UI section after the LabSelectorCard (around line 386):

```tsx
{/* Animal Selection - NEW SECTION */}
<Card className="shadow-card border-primary/10">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Database className="w-5 h-5 text-primary" />
      Link to Animal (Optional)
    </CardTitle>
    <p className="text-sm text-muted-foreground mt-1">
      Select a bitch to link this progesterone test to her record
    </p>
  </CardHeader>
  <CardContent>
    {selectedAnimal ? (
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
        <Avatar className="h-10 w-10">
          <AvatarImage src={selectedAnimal.avatarUrl || undefined} />
          <AvatarFallback>{selectedAnimal.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{selectedAnimal.name}</p>
          {selectedAnimal.breed && (
            <p className="text-sm text-muted-foreground">{selectedAnimal.breed.name}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedAnimal(null)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    ) : (
      <Select
        onValueChange={(value) => {
          const animal = animalsData?.find((a: any) => a.id === value);
          setSelectedAnimal(animal);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a bitch..." />
        </SelectTrigger>
        <SelectContent>
          {animalsData?.filter((a: any) => a.sex === 'female').map((animal: any) => (
            <SelectItem key={animal.id} value={animal.id}>
              <div className="flex items-center gap-2">
                <span>{animal.name}</span>
                {animal.breed && (
                  <Badge variant="outline" className="text-xs">
                    {animal.breed.name}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  </CardContent>
</Card>
```

**Update the handleSaveReadings function (around line 259):**

```tsx
const handleSaveReadings = async () => {
  const filledReadings = readings.filter(r => r.value && r.value.trim() !== '');

  if (filledReadings.length === 0) {
    toast({
      variant: "destructive",
      title: "No readings to save",
      description: "Please enter at least one progesterone reading."
    });
    return;
  }

  // Check for validation errors
  if (Object.keys(validationErrors).length > 0) {
    toast({
      variant: "destructive",
      title: "Validation errors",
      description: "Please fix validation errors before saving."
    });
    return;
  }

  setIsSaving(true);

  try {
    // Save to Zustand store (local backup)
    filledReadings.forEach(reading => {
      if (reading.date) {
        progesteroneStore.addReading({
          day: reading.day,
          value: parseFloat(reading.value),
          date: reading.date
        });
      }
    });

    // Prepare readings for database
    const dbReadings = filledReadings.map(r => ({
      day: r.day,
      value: parseFloat(r.value),
      date: r.date!.toISOString()
    }));

    // Save to database
    await createTestMutation.mutateAsync({
      animalId: selectedAnimal?.id,
      testDate: readings[0].date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      laboratory,
      unit,
      breedingMethod,
      readings: dbReadings,
      rating: calculationResult?.rating.rating,
      alternativeRating: calculationResult?.rating.alternativeRating,
      matchedPattern: calculationResult?.rating.matchedPattern,
      confidence: calculationResult?.rating.confidence,
      trend: calculationResult?.trend.trend,
      averageChange: calculationResult?.trend.averageChange,
      isOptimal: calculationResult?.trend.isOptimal ? 'true' : 'false',
      recommendation: calculationResult?.recommendation.recommendation,
      recommendationMessage: calculationResult?.recommendation.message,
      suggestedAction: calculationResult?.recommendation.suggestedAction,
      breedingWindow: calculationResult?.breedingWindow,
    });

    setLastSaved(new Date());

    toast({
      title: "Test saved successfully",
      description: `Saved ${filledReadings.length} progesterone reading(s) to database.`
    });
  } catch (error) {
    console.error('Error saving test:', error);
    toast({
      variant: "destructive",
      title: "Failed to save",
      description: "Could not save to database. Data is saved locally."
    });
  } finally {
    setIsSaving(false);
  }
};
```

**Add `useAnimals` hook at top of component (around line 48):**

```tsx
// Fetch animals for selection
const { data: animalsData } = useAnimals();
```

**Update Save button to show loading state (find the Save button and update):**

```tsx
<Button
  onClick={handleSaveReadings}
  disabled={!hasAnyReadings || Object.keys(validationErrors).length > 0 || isSaving}
  className="bg-gradient-brand hover:opacity-90"
>
  {isSaving ? (
    <>
      <Database className="w-4 h-4 mr-2 animate-spin" />
      Saving to Database...
    </>
  ) : (
    <>
      <Save className="w-4 h-4 mr-2" />
      Save Readings
    </>
  )}
</Button>
```

---

### 1.4 ⏳ Add Progesterone Test History View
**Status:** NOT STARTED
**Estimated Time:** 2 hours

**Create New Component:** `components/breeder/calculators/ProgesteroneTestHistory.tsx`

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProgesteroneTests, useDeleteProgesteroneTest } from "@/lib/api/queries/progesterone-tests";
import { Calendar, TrendingUp, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

export function ProgesteroneTestHistory() {
  const { data: tests, isLoading } = useProgesteroneTests({ limit: 10 });
  const deleteTest = useDeleteProgesteroneTest();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!tests || tests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No progesterone tests yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Test History</h3>
      {tests.map((test) => (
        <Card key={test.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {test.animal && (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={test.animal.avatarUrl || undefined} />
                    <AvatarFallback>
                      {test.animal.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <p className="font-medium">
                    {test.animal?.name || 'Unnamed Test'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(test.testDate), 'MMM dd, yyyy')}
                    <Badge variant="outline" className="text-xs">
                      {test.readings.length} readings
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {test.rating && (
                  <div className="text-right">
                    <div className="text-2xl font-bold">{parseFloat(test.rating).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">rating</div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm('Delete this test?')) {
                      deleteTest.mutate(test.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Add to main calculators page** (`app/(breeder)/calculators/page.tsx`):

Import and use in the Progesterone tab:

```tsx
import { ProgesteroneTestHistory } from "@/components/breeder/calculators/ProgesteroneTestHistory";

// In the Progesterone tab content:
<TabsContent value="progesterone" className="space-y-6">
  <ProgesteroneInputForm />
  <ProgesteroneTestHistory />
</TabsContent>
```

**Update recent progesterone tests in overview** (line 30-32):

```tsx
// Fetch real progesterone tests
const { data: progesteroneTestsData } = useProgesteroneTests({ limit: 2 });

const recentProgesteroneTests = progesteroneTestsData?.map(test => ({
  id: test.id,
  bitchName: test.animal?.name || 'Unknown',
  date: test.testDate,
  readings: test.readings.length,
  rating: parseFloat(test.rating || '0'),
})) || [];
```

---

## 📋 REMAINING TASKS (Task 2: Auto-Fill Wizard Steps)

### 2.1 ⏳ Create API Route for Bitch Breeding History
**File to Create:** `app/api/animals/[id]/breeding-history/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { matings, litters } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const animalId = params.id;

    // Get mating history
    const matingHistory = await db
      .select()
      .from(matings)
      .where(eq(matings.bitchId, animalId))
      .orderBy(desc(matings.matingDate));

    // Get litter history
    const litterHistory = await db
      .select()
      .from(litters)
      .where(eq(litters.damId, animalId))
      .orderBy(desc(litters.whelpingDate));

    // Calculate statistics
    const hasBeenBred = matingHistory.length > 0 ? 'yes' : 'no';
    const previousLitters = litterHistory.length;
    const lastLitter = litterHistory[0];
    const monthsSinceLastLitter = lastLitter
      ? Math.floor((Date.now() - new Date(lastLitter.whelpingDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
      : undefined;
    const hasComplications = litterHistory.some(l => l.hasComplications) ? 'yes' : 'no';

    return NextResponse.json({
      success: true,
      history: {
        hasBeenBred,
        previousLitters,
        monthsSinceLastLitter,
        hasComplications,
        matings: matingHistory,
        litters: litterHistory,
      },
    });
  } catch (error) {
    console.error('Error fetching breeding history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breeding history' },
      { status: 500 }
    );
  }
}
```

### 2.2 ⏳ Auto-fill BitchHistoryStep
**File:** `components/breeder/calculators/wizard/steps/BitchHistoryStep.tsx`

Add at the top:

```tsx
import { useEffect, useState } from 'react';

// Inside component, after props:
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchHistory = async () => {
    if (!data?.bitchId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/animals/${data.bitchId}/breeding-history`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const result = await response.json();
      
      // Auto-fill form
      onUpdate({
        hasBeenBred: result.history.hasBeenBred,
        previousLitters: result.history.previousLitters,
        lastLitterDate: result.history.monthsSinceLastLitter,
        complications: result.history.hasComplications === 'yes',
      });
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchHistory();
}, [data?.bitchId]);
```

### 2.3 ⏳ Create API Route for Dog Breeding History
**File to Create:** `app/api/animals/[id]/stud-history/route.ts`

Similar to bitch history but for sires:

```typescript
// Count matings where this dog was the sire
const studHistory = await db
  .select()
  .from(matings)
  .where(eq(matings.dogId, animalId))
  .orderBy(desc(matings.matingDate));

const litterHistory = await db
  .select()
  .from(litters)
  .where(eq(litters.sireId, animalId));

const hasBeenUsed = studHistory.length > 0 ? 'yes' : 'no';
const previousLittersCount = litterHistory.length;
const successfulLitters = litterHistory.filter(l => !l.hasComplications).length;
const successRate = previousLittersCount > 0
  ? (successfulLitters / previousLittersCount) * 100
  : 0;
```

### 2.4 ⏳ Auto-fill DogHistoryStep
Similar pattern to BitchHistoryStep

### 2.5 ⏳ Auto-fill BreederHistoryStep
**Fetch from:** `app/api/breeder/profile/route.ts` (already exists!)

```tsx
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/breeder/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const result = await response.json();
      
      // Calculate years of experience
      const yearsExperience = result.profile.establishedYear
        ? new Date().getFullYear() - result.profile.establishedYear
        : 0;
      
      onUpdate({
        yearsExperience,
        breedFamiliarity: yearsExperience > 10 ? 'expert' : yearsExperience > 5 ? 'experienced' : 'moderate',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  fetchProfile();
}, []);
```

### 2.6 & 2.7 ⏳ Auto-fill Semen Steps
**Check if frozen semen table exists and create API routes**

---

## 📋 TASK 3: Edit Functionality

### 3.1 ⏳ Add Edit Button to ConceptionRatingCard
**File:** `components/breeder/calculators/ConceptionRatingCard.tsx`

Add edit button next to delete button:

```tsx
import { Edit } from 'lucide-react';

// In the header section, add:
<Button
  variant="ghost"
  size="icon"
  onClick={() => onEdit?.(rating.id)}
  className="text-muted-foreground hover:text-primary"
>
  <Edit className="w-4 h-4" />
</Button>
```

Update interface:

```tsx
interface ConceptionRatingCardProps {
  // ... existing props
  onEdit?: (id: string) => void;
}
```

### 3.2 ⏳ Create UPDATE API Endpoint
**File:** `app/api/conception-ratings/[id]/route.ts`

```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Similar to POST but update existing record
  const [updated] = await db
    .update(matings)
    .set({
      // ... update fields
      updatedAt: new Date(),
    })
    .where(and(
      eq(matings.id, params.id),
      eq(matings.userId, userId)
    ))
    .returning();
    
  return NextResponse.json({ success: true, mating: updated });
}
```

### 3.3 ⏳ Pre-populate Wizard with Saved Data
**File:** `app/(breeder)/calculators/conception-rating/page.tsx`

Add edit state:

```tsx
const [editingRating, setEditingRating] = useState<StoredRating | null>(null);

const handleEdit = (id: string) => {
  const rating = ratings.find(r => r.id === id);
  if (rating) {
    setEditingRating(rating);
    setShowWizard(true);
  }
};

// Pass to wizard:
<ConceptionRatingWizard
  open={showWizard}
  onOpenChange={setShowWizard}
  onComplete={handleWizardComplete}
  initialData={editingRating?.calculationData} // NEW PROP
  editingId={editingRating?.id} // NEW PROP
/>
```

**Update Wizard to accept initialData:**

```tsx
interface ConceptionRatingWizardProps {
  // ... existing props
  initialData?: any;
  editingId?: string;
}

// In wizard, use initialData to pre-populate:
const zustandStore = useConceptionWizardStore();

useEffect(() => {
  if (initialData) {
    // Pre-populate store with saved data
    Object.keys(initialData).forEach(key => {
      zustandStore.updateData({ [key]: initialData[key] });
    });
  }
}, [initialData]);
```

---

## 🎯 IMPLEMENTATION ORDER

### Phase 1: Complete Progesterone (2-3 hours)
1. ✅ Schema (DONE)
2. ✅ API Routes (DONE)
3. 🔄 Update ProgesteroneInputForm UI (30 min)
4. ⏳ Add ProgesteroneTestHistory component (1 hour)
5. ⏳ Update main page to show real data (30 min)

### Phase 2: Auto-Fill Wizard (4-5 hours)
1. ⏳ Bitch breeding history API + auto-fill (1 hour)
2. ⏳ Dog breeding history API + auto-fill (1 hour)
3. ⏳ Breeder profile auto-fill (30 min)
4. ⏳ Semen data auto-fill (1-2 hours)

### Phase 3: Edit Functionality (2-3 hours)
1. ⏳ Add edit button to cards (15 min)
2. ⏳ Create UPDATE API endpoint (30 min)
3. ⏳ Pre-populate wizard logic (1-2 hours)

---

## 🗄️ DATABASE MIGRATION NEEDED

Run this SQL to create the progesterone_tests table:

```sql
CREATE TABLE progesterone_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
  mating_id UUID REFERENCES matings(id) ON DELETE SET NULL,
  test_date DATE NOT NULL,
  laboratory TEXT NOT NULL,
  unit TEXT NOT NULL,
  breeding_method TEXT NOT NULL,
  readings JSONB NOT NULL,
  rating DECIMAL(5,2),
  alternative_rating DECIMAL(5,2),
  matched_pattern TEXT,
  confidence DECIMAL(5,2),
  trend TEXT,
  average_change DECIMAL(10,4),
  is_optimal TEXT,
  recommendation TEXT,
  recommendation_message TEXT,
  suggested_action TEXT,
  breeding_window JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_progesterone_tests_user_id ON progesterone_tests(user_id);
CREATE INDEX idx_progesterone_tests_animal_id ON progesterone_tests(animal_id);
CREATE INDEX idx_progesterone_tests_mating_id ON progesterone_tests(mating_id);
CREATE INDEX idx_progesterone_tests_test_date ON progesterone_tests(test_date);
```

---

## ✅ TESTING CHECKLIST

### Progesterone Calculator
- [ ] Create test without animal link
- [ ] Create test with animal link
- [ ] View test history
- [ ] Delete test
- [ ] Verify calculations save correctly
- [ ] Check loading states
- [ ] Test error handling

### Conception Wizard Auto-Fill
- [ ] Select bitch - verify auto-fill
- [ ] Select dog - verify auto-fill
- [ ] Check breeder profile loads
- [ ] Verify all steps populate correctly

### Edit Functionality
- [ ] Click edit on saved rating
- [ ] Verify wizard pre-populates
- [ ] Make changes and save
- [ ] Verify update in database
- [ ] Check list refreshes

---

## 📊 PROGRESS TRACKER

**Overall Progress: 20% Complete**

- ✅ Task 1.1: Schema (100%)
- ✅ Task 1.2: API Routes (100%)
- 🔄 Task 1.3: Form Integration (30%)
- ⏳ Task 1.4: History View (0%)
- ⏳ Task 2.1-2.7: Auto-Fill (0%)
- ⏳ Task 3.1-3.3: Edit (0%)

**Estimated Remaining Time: 10-12 hours**

---

## 🎉 COMPLETION CRITERIA

System is 100% complete when:
- ✅ All progesterone tests save to database
- ✅ Test history displays correctly
- ✅ All wizard steps auto-fill from database
- ✅ Users can edit saved conception ratings
- ✅ No mock data anywhere
- ✅ All API endpoints working
- ✅ Proper error handling
- ✅ Loading states everywhere
- ✅ Tests passing

---

**This guide provides a complete roadmap for implementing all Priority 1 features systematically. Follow the phases in order for best results.**
