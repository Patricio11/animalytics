# Progesterone Tracking - Phase 2 Implementation Plan

## ✅ **Corrected Understanding**

### **Day 1 = Heat Start (NO TEST)**
```
Day 1 (Oct 20):
├─ Breeder notices bleeding
├─ Marks: "Heat started on Oct 20"
├─ NO progesterone test
└─ System: "First test due Oct 25 (Day 5)"
```

### **Day 5 = First Test**
```
Day 5 (Oct 25):
├─ 🔔 Reminder: "Time for first test"
├─ Record: Progesterone level
├─ System analyzes result
└─ Calculates next test date
```

---

## 🎨 **Beautiful UI/UX Flow**

### **Step 1: Start Heat Cycle**
```
┌─────────────────────────────────────┐
│ 💗 Start New Heat Cycle             │
│                                     │
│ Select Bitch *                      │
│ ┌─────────────────────────────────┐ │
│ │ 🐕 Bella - Golden Retriever  ▼ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ 📷 Bella                      │   │
│ │    Golden Retriever           │   │
│ │    CH Golden Beauty           │   │
│ └───────────────────────────────┘   │
│                                     │
│ Day 1 - Heat Start Date *           │
│ When did you first notice bleeding? │
│ [10/20/2025]                        │
│                                     │
│ ℹ️ First progesterone test due:     │
│    Friday, October 25, 2025 (Day 5) │
│                                     │
│ Planned Breeding Method *           │
│ [Natural/AI (Fresh/Chilled)    ▼]  │
│                                     │
│ ℹ️ What happens next:                │
│ • Day 1 marks start (no test)       │
│ • Reminder on Day 5 for first test  │
│ • Guided testing schedule           │
│ • Breeding window alerts            │
│                                     │
│ [💗 Start Heat Cycle Tracking]      │
└─────────────────────────────────────┘
```

### **Step 2: Active Cycle Dashboard**
```
┌─────────────────────────────────────┐
│ Bella's Heat Cycle                  │
│ Started: Oct 20, 2025               │
│                                     │
│ ⏰ Day 1 - Heat Start               │
│ Status: Waiting for Day 5 test      │
│                                     │
│ 📅 Next Test Due:                   │
│ Oct 25, 2025 (Day 5)                │
│ 🔔 Reminder set                     │
│                                     │
│ Timeline:                           │
│ ✅ Day 1 (Oct 20) - Heat started    │
│ ⏳ Day 5 (Oct 25) - First test due  │
│ ⏳ Day 8+ - Based on results        │
└─────────────────────────────────────┘
```

### **Step 3: Day 5 Reminder**
```
┌─────────────────────────────────────┐
│ 🔔 Progesterone Test Due            │
│                                     │
│ 🐕 Bella - Golden Retriever         │
│                                     │
│ Day 5 test is due today!            │
│ Heat started: Oct 20, 2025          │
│                                     │
│ This is your first progesterone     │
│ test for this cycle.                │
│                                     │
│ [📝 Enter Test Results]             │
│ [⏰ Remind Me Later]                │
└─────────────────────────────────────┘
```

### **Step 4: Enter Day 5 Results**
```
┌─────────────────────────────────────┐
│ Day 5 - First Progesterone Test     │
│ Bella - Golden Retriever            │
│                                     │
│ Test Date *                         │
│ [10/25/2025]                        │
│                                     │
│ Progesterone Level *                │
│ [3.2] ng/mL                         │
│ Valid range: 0-50 ng/mL             │
│                                     │
│ 🟣 Phase: LH Surge                  │
│ Result: 3.2 ng/mL                   │
│                                     │
│ 📊 Recommendation:                  │
│ Test again in 3 days (Oct 28)       │
│                                     │
│ [💾 Save & Schedule Next Test]      │
└─────────────────────────────────────┘
```

### **Step 5: Breeding Window Alert**
```
┌─────────────────────────────────────┐
│ 🎯 BREEDING WINDOW OPEN!            │
│                                     │
│ 🐕 Bella - Golden Retriever         │
│ Day 11 - Oct 31, 2025               │
│                                     │
│ Current Reading: 18.5 ng/mL 🟢      │
│ Phase: Fertile Range                │
│                                     │
│ ✅ OPTIMAL TIME TO BREED            │
│                                     │
│ Recommendations:                    │
│ • Breed TODAY (Oct 31)              │
│ • Breed TOMORROW (Nov 1)            │
│ • Last optimal day: Nov 2           │
│                                     │
│ Expected Whelping:                  │
│ 📅 January 5, 2026 (±2 days)       │
│                                     │
│ [📝 Record Breeding]                │
│ [⏰ Remind Tomorrow]                │
└─────────────────────────────────────┘
```

---

## 🗂️ **Component Structure**

### **New Components:**

1. **HeatCycleStartCard.tsx** ✅
   - Bitch selection with avatar
   - Heat start date picker
   - Breeding method selector
   - Beautiful validation

2. **ActiveCycleCard.tsx** 🔜
   - Current cycle status
   - Next test countdown
   - Timeline visualization
   - Quick actions

3. **ProgesteroneTestForm.tsx** 🔜
   - Day-specific test entry
   - Phase detection
   - Next test recommendation
   - Beautiful results display

4. **BreedingWindowAlert.tsx** 🔜
   - Prominent alert card
   - Breeding recommendations
   - Whelping date calculator
   - Record breeding action

5. **CycleTimeline.tsx** 🔜
   - Visual timeline
   - Phase indicators
   - Test history
   - Breeding dates

---

## 📊 **Data Flow**

### **State Management:**
```typescript
interface HeatCycle {
  id: string;
  bitchId: string;
  bitchName: string;
  startDate: Date; // Day 1
  breedingMethod: 'natural_ai' | 'frozen';
  status: 'active' | 'completed';
  currentDay: number;
  nextTestDate: Date | null;
  readings: ProgesteroneReading[];
  breedingDates: Date[];
  estimatedOvulationDay?: number;
  estimatedWhelpingDate?: Date;
}

interface ProgesteroneReading {
  day: number;
  testDate: Date;
  level: number;
  phase: string;
  nextTestRecommendation: {
    days: number;
    date: Date;
    reason: string;
  };
}
```

---

## 🔔 **Notification System**

### **Reminder Types:**

1. **Day 5 First Test**
   - Sent 4 days after Day 1
   - Email + In-app
   - "Time for first progesterone test"

2. **Follow-up Tests**
   - Based on previous result
   - 1-3 days before due date
   - "Next test due in X days"

3. **Breeding Window**
   - When entering fertile range
   - Urgent notification
   - "Breeding window opening!"

4. **Daily Tests**
   - When in fertile range
   - Daily reminders
   - "Daily test required"

### **Mailtrap Setup:**
```typescript
// lib/email/progesterone-reminders.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export async function sendTestReminder(data: {
  email: string;
  bitchName: string;
  day: number;
  dueDate: Date;
}) {
  await transporter.sendMail({
    from: '"Animalytics" <noreply@animalytics.com>',
    to: data.email,
    subject: `🔔 Progesterone Test Due - ${data.bitchName} (Day ${data.day})`,
    html: `
      <h2>Progesterone Test Reminder</h2>
      <p><strong>${data.bitchName}</strong> - Day ${data.day} test is due!</p>
      <p>Due Date: ${format(data.dueDate, 'MMMM d, yyyy')}</p>
      <a href="${process.env.APP_URL}/calculators/progesterone">Enter Test Results</a>
    `,
  });
}
```

---

## 🎯 **Smart Recommendations**

### **Next Test Calculator:**
```typescript
function calculateNextTest(
  currentDay: number,
  progesteroneLevel: number,
  testDate: Date
): { days: number; date: Date; reason: string } {
  
  if (currentDay === 5) {
    // First test logic
    if (progesteroneLevel < 4) {
      return {
        days: 3,
        date: addDays(testDate, 3),
        reason: "Level below 4 ng/mL - test in 3 days"
      };
    } else if (progesteroneLevel >= 4 && progesteroneLevel < 10) {
      return {
        days: 2,
        date: addDays(testDate, 2),
        reason: "Approaching ovulation - test every 2 days"
      };
    } else {
      return {
        days: 1,
        date: addDays(testDate, 1),
        reason: "Fertile range - test daily"
      };
    }
  }
  
  // Subsequent tests follow same logic
  if (progesteroneLevel < 4) {
    return { days: 3, date: addDays(testDate, 3), reason: "Test in 3 days" };
  } else if (progesteroneLevel >= 4 && progesteroneLevel < 10) {
    return { days: 2, date: addDays(testDate, 2), reason: "Test every 2 days" };
  } else {
    return { days: 1, date: addDays(testDate, 1), reason: "Test daily" };
  }
}
```

### **Phase Detection:**
```typescript
function detectPhase(level: number): {
  phase: string;
  color: string;
  icon: string;
  description: string;
} {
  if (level < 1.5) {
    return {
      phase: "Anestrus",
      color: "gray",
      icon: "⚪",
      description: "Out of heat"
    };
  } else if (level >= 1.5 && level < 4) {
    return {
      phase: "LH Surge",
      color: "pink",
      icon: "🟣",
      description: "Hormone surge beginning"
    };
  } else if (level >= 4 && level < 9) {
    return {
      phase: "Estimated Ovulation",
      color: "red",
      icon: "🔴",
      description: "Ovulation occurring"
    };
  } else if (level >= 9 && level < 15) {
    return {
      phase: "Egg Maturation",
      color: "yellow",
      icon: "🟡",
      description: "Eggs maturing"
    };
  } else if (level >= 15 && level < 25) {
    return {
      phase: "Fertile Range",
      color: "lightgreen",
      icon: "🟢",
      description: "Optimal breeding time"
    };
  } else {
    return {
      phase: "Late Stage Fertility",
      color: "darkgreen",
      icon: "🟢",
      description: "Breeding window closing"
    };
  }
}
```

---

## 📱 **Mobile Responsive**

All components designed mobile-first:
- Touch-friendly buttons
- Large tap targets
- Swipe gestures for timeline
- Bottom sheet modals
- Native date pickers

---

## ✅ **Implementation Checklist**

### **Phase 2A: Core UI** (Current)
- ✅ HeatCycleStartCard component
- 🔜 ActiveCycleCard component
- 🔜 ProgesteroneTestForm component
- 🔜 Update main ProgesteroneInputForm

### **Phase 2B: Smart Features**
- 🔜 Next test calculator
- 🔜 Phase detection
- 🔜 Breeding window detector
- 🔜 Whelping date calculator

### **Phase 2C: Notifications**
- 🔜 Mailtrap email setup
- 🔜 In-app notifications
- 🔜 Reminder scheduling
- 🔜 SMS (future)

### **Phase 2D: Database**
- 🔜 Heat cycles table
- 🔜 Progesterone readings table
- 🔜 Reminders table
- 🔜 API routes

---

## 🚀 **Next Steps**

1. Create ActiveCycleCard component
2. Create ProgesteroneTestForm component
3. Integrate with main form
4. Add database schema
5. Implement notification system
6. Add breeding window alerts

**Beautiful, smooth UX guaranteed!** ✨
