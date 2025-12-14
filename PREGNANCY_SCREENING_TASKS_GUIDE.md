# 🎯 Pregnancy Screening Tasks - Auto-Generation System

## Overview

When you mark a progesterone reading as **"Last Mating"**, the system automatically generates **6 pregnancy screening tasks** that appear in your **Upcoming Tasks** dashboard. This ensures you never miss critical pregnancy checkpoints.

## How It Works

### 1. Mark Reading as Last Mating

When adding a progesterone reading in the breeding window (P4: 15-35 ng/mL):

```
┌─────────────────────────────────────────┐
│ Add Progesterone Reading                │
├─────────────────────────────────────────┤
│ Test Date: Dec 14, 2024                 │
│ P4 Level: 20.5 ng/mL                    │
│ Laboratory: VIDAS                        │
│                                          │
│ ✅ Breeding Window Detected!            │
│                                          │
│ ☐ Mark as Mating                        │
│ ☑ Mark as LAST Mating ← CHECK THIS!    │
│                                          │
│ [Cancel] [Save Reading]                 │
└─────────────────────────────────────────┘
```

### 2. System Auto-Generates 6 Tasks

The moment you save, the system creates:

```
✅ Day 28: Scan & Bloods
✅ Day 28: Relaxin Blood Test
✅ Day 30: Progesterone Check
✅ Day 45: Mid-Pregnancy Checkup
✅ Day 50: X-Ray for Puppy Count
✅ Day 55: Pre-Whelping Checkup
```

### 3. Success Notification

You'll see a detailed toast notification:

```
┌──────────────────────────────────────────────────┐
│ 🎯 Last Mating Recorded!                         │
├──────────────────────────────────────────────────┤
│ ✅ Reading saved successfully                    │
│                                                  │
│ 📋 6 pregnancy screening tasks created:         │
│                                                  │
│ • Day 28: Scan & Bloods - Jan 11, 2025         │
│ • Day 28: Relaxin Blood Test - Jan 11, 2025    │
│ • Day 30: Progesterone Check - Jan 13, 2025    │
│ • Day 45: Mid-Pregnancy Checkup - Jan 28, 2025 │
│ • Day 50: X-Ray for Puppy Count - Feb 2, 2025  │
│ • Day 55: Pre-Whelping Checkup - Feb 7, 2025   │
│                                                  │
│ Check your Upcoming Tasks to view all           │
│ pregnancy screening appointments.                │
└──────────────────────────────────────────────────┘
```

## The 6 Auto-Generated Tasks

### Task 1: Day 28 - Scan & Bloods (HIGH Priority)
**Due:** 28 days after last mating  
**Type:** Ultrasound  
**Description:** CRITICAL: Ultrasound scan to confirm pregnancy and blood test for relaxin hormone. This is the primary pregnancy confirmation at 28 days post-last mating.

**Why Day 28?**
- Embryos are visible on ultrasound
- Heartbeats can be detected
- Most reliable confirmation window

---

### Task 2: Day 28 - Relaxin Blood Test (HIGH Priority)
**Due:** 28 days after last mating  
**Type:** Blood Test  
**Description:** Blood test for relaxin hormone (done same day as ultrasound). Confirms pregnancy hormonally.

**Why Relaxin?**
- Hormone only present during pregnancy
- Detectable from day 25-30
- Confirms pregnancy biochemically

---

### Task 3: Day 30 - Progesterone Check (HIGH Priority)
**Due:** 30 days after last mating  
**Type:** Checkup  
**Description:** Progesterone test to check for plateau. If P4 plateaus at 21-28 ng/mL = PREGNANT. If P4 drops = NOT PREGNANT.

**Why Check P4?**
- Pregnant bitches maintain high P4 (21-28 ng/mL)
- Non-pregnant bitches drop to <2 ng/mL
- Confirms pregnancy via hormone levels

---

### Task 4: Day 45 - Mid-Pregnancy Checkup (MEDIUM Priority)
**Due:** 45 days after last mating  
**Type:** Checkup  
**Description:** Mid-pregnancy veterinary checkup. Monitor bitch health and fetal development.

**What to Check:**
- Bitch's overall health
- Weight gain (should be noticeable)
- Appetite and behavior
- Any complications

---

### Task 5: Day 50 - X-Ray for Puppy Count (MEDIUM Priority)
**Due:** 50 days after last mating  
**Type:** X-Ray  
**Description:** X-ray to count puppies and assess skeletal development. Best done after day 45 when bones are calcified.

**Why Day 50?**
- Puppy skeletons are fully calcified
- Accurate puppy count possible
- Helps prepare for whelping
- Identifies potential complications

---

### Task 6: Day 55 - Pre-Whelping Checkup (HIGH Priority)
**Due:** 55 days after last mating  
**Type:** Checkup  
**Description:** Final checkup before whelping. Prepare for delivery and assess readiness. Expected whelping: ~63 days from ovulation.

**Final Preparations:**
- Confirm whelping date (~63 days from ovulation)
- Check bitch's readiness
- Discuss whelping plan
- Emergency contact information
- Whelping box setup

---

## Where to Find Your Tasks

### 1. Dashboard - Upcoming Tasks Widget
```
┌─────────────────────────────────────┐
│ 📋 Upcoming Tasks                   │
├─────────────────────────────────────┤
│ 🔴 Day 28: Scan & Bloods - Bella   │
│    Due: Jan 11, 2025 (in 3 days)   │
│                                     │
│ 🔴 Day 28: Relaxin Blood Test      │
│    Due: Jan 11, 2025 (in 3 days)   │
│                                     │
│ 🔴 Day 30: Progesterone Check      │
│    Due: Jan 13, 2025 (in 5 days)   │
│                                     │
│ [View All Tasks →]                  │
└─────────────────────────────────────┘
```

### 2. Tasks Page - Full List
Navigate to **Tasks** in the main menu to see all pregnancy screening tasks with:
- Due dates
- Priority levels
- Task descriptions
- Mark as complete
- Add notes

### 3. Animal Profile - Reminders Tab
Each task is linked to the specific bitch, so you can view them in her profile under the **Reminders** tab.

## Task Details & Metadata

Each auto-generated task includes:

**Standard Fields:**
- ✅ Title with bitch name
- ✅ Detailed description
- ✅ Due date (calculated from last mating)
- ✅ Due time (default: 9:00 AM)
- ✅ Priority level (HIGH or MEDIUM)
- ✅ Status (pending by default)

**Special Metadata:**
```json
{
  "eventType": "pregnancy_ultrasound",
  "pregnancyScreeningData": {
    "heatCycleId": "uuid",
    "breedingRecordId": "uuid",
    "lastMatingDate": "2024-12-14",
    "daysPostMating": 28,
    "screeningType": "ultrasound",
    "autoGenerated": true,
    "generatedDate": "2024-12-14T10:30:00Z"
  }
}
```

**Auto-Generation Tracking:**
- `isAutoGenerated`: true
- `generatedBy`: "pregnancy_screening_generator"
- `generationBatchId`: "pregnancy_{breedingRecordId}"

## Technical Implementation

### Database Schema

**breeding_records table:**
```sql
is_last_mating BOOLEAN DEFAULT FALSE
pregnancy_screening_tasks_generated BOOLEAN DEFAULT FALSE
pregnancy_screening_tasks_generated_at TIMESTAMP
```

**tasks table:**
```sql
is_auto_generated BOOLEAN DEFAULT FALSE
generated_by TEXT
generation_batch_id TEXT
task_data JSONB -- Contains pregnancy screening metadata
```

### Service Layer

**File:** `lib/services/pregnancy-screening-tasks.ts`

**Main Function:**
```typescript
generatePregnancyScreeningTasks(
  breedingRecordId: string,
  userId: string
): Promise<TaskGenerationResult>
```

**Returns:**
```typescript
{
  success: boolean;
  tasksCreated: number;
  tasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    type: string;
  }>;
  error?: string;
}
```

### API Integration

**Endpoint:** `POST /api/progesterone-readings`

**Request:**
```json
{
  "heatCycleId": "uuid",
  "testDate": "2024-12-14",
  "progesteroneLevel": 20.5,
  "markAsLastMating": true
}
```

**Response:**
```json
{
  "reading": { ... },
  "breedingRecordCreated": true,
  "breedingRecordId": "uuid",
  "isLastMating": true,
  "pregnancyTasksGenerated": true,
  "pregnancyTasksCount": 6,
  "pregnancyTasks": [
    {
      "id": "uuid",
      "title": "Day 28: Scan & Bloods - Bella",
      "dueDate": "2025-01-11",
      "type": "ultrasound"
    },
    // ... 5 more tasks
  ]
}
```

## Important Notes

### ✅ Tasks Only Generated Once
- System checks if tasks already generated
- Prevents duplicate task creation
- Safe to mark multiple readings as "last mating"

### ✅ Automatic Query Invalidation
When tasks are created, the system automatically refreshes:
- Dashboard upcoming tasks widget
- Tasks page
- Animal profile reminders
- Heat cycle data

### ✅ Task Customization
After generation, you can:
- Edit task titles
- Modify due dates
- Add custom notes
- Change priority levels
- Mark as complete
- Delete if needed

### ✅ Linked to Breeding Record
All tasks are linked to:
- Specific heat cycle
- Specific breeding record
- Specific bitch
- Last mating date

## Pregnancy Timeline Reference

```
Day 0:  Last Mating (marked in progesterone reading)
        ↓
Day 28: 🔴 SCAN + BLOODS (confirm pregnancy)
        ↓
Day 30: 🔴 P4 CHECK (plateau = pregnant)
        ↓
Day 45: 🟡 MID-PREGNANCY CHECKUP
        ↓
Day 50: 🟡 X-RAY (count puppies)
        ↓
Day 55: 🔴 PRE-WHELPING CHECKUP
        ↓
Day 63: 🎉 EXPECTED WHELPING DATE
```

## Benefits

### For Breeders
✅ **Never Miss Critical Dates** - All appointments auto-scheduled  
✅ **Complete Pregnancy Tracking** - From confirmation to whelping  
✅ **Professional Timeline** - Based on veterinary best practices  
✅ **Organized Workflow** - All tasks in one place  
✅ **Peace of Mind** - System reminds you of everything  

### For Veterinarians
✅ **Standardized Protocol** - Consistent pregnancy monitoring  
✅ **Optimal Timing** - Tests scheduled at ideal windows  
✅ **Complete Records** - Full breeding and pregnancy history  
✅ **Better Outcomes** - Early detection of complications  

## Troubleshooting

### Tasks Not Appearing?

**Check:**
1. Did you mark reading as "Last Mating"? (not just "Mating")
2. Was the reading in breeding window (P4: 15-35 ng/mL)?
3. Check browser console for errors
4. Refresh the Tasks page
5. Check the specific bitch's Reminders tab

### Tasks Generated Twice?

**This shouldn't happen because:**
- System checks `pregnancyScreeningTasksGenerated` flag
- Only generates if flag is `false`
- Flag is set to `true` after generation
- Safe to mark multiple readings as last mating

### Wrong Dates?

**Tasks are calculated from:**
- Last mating date (not ovulation date)
- If dates seem off, verify the test date of the reading marked as last mating
- You can manually edit task due dates after creation

## Migration Required

**Before using this feature, run the migration:**

```bash
# Apply the pregnancy screening fields migration
psql -d your_database < migrations/add_pregnancy_screening_fields.sql
```

**What it adds:**
- New event types (pregnancy_ultrasound, pregnancy_blood_test, etc.)
- New columns to breeding_records table
- Indexes for performance
- Comments for documentation

---

**Status:** ✅ Fully Implemented and Working  
**Version:** 1.0  
**Last Updated:** December 14, 2024  

**Ready to use!** Mark your next progesterone reading as "Last Mating" and watch the magic happen! 🎉
