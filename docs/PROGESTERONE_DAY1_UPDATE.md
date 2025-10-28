# Progesterone Tracking - Day 1 Start & Smart Reminders

## ✅ **Phase 1: Core Changes COMPLETE**

Updated the progesterone tracking system to start from Day 1 (first day of heat) with intelligent reminder system based on Mini VIDAS chart.

---

## 🔄 **What Changed**

### **Before** ❌:
- Started at Day 0
- Fixed 6-day limit (Days 0-5)
- No context for what "Day 0" means
- No smart reminders

### **After** ✅:
- Starts at **Day 1** (Start of Heat)
- Extends to **Day 15** (full cycle)
- Clear labeling: "Day 1 (Start of Heat)"
- Smart reminders based on progesterone levels

---

## 📊 **Testing Schedule Logic**

### **Day 1** (Oct 20):
```
First Reading - Baseline
Record: Date + Progesterone Level
```

### **Day 5** (Oct 25):
```
System Reminder: "Time for Day 5 reading!"
Record: Date + Progesterone Level

Then based on result:
├─ 0-4 ng/mL   → Test again in 3 days (Day 8)
├─ 4-10 ng/mL  → Test every 2 days (Day 7, 9, 11...)
└─ 10+ ng/mL   → Test DAILY (Day 6, 7, 8...)
```

---

## 🎯 **Implementation Details**

### **1. Type Updates**
```typescript
// lib/calculations/types.ts
export type DayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
```

### **2. Form Initialization**
```typescript
// Start with Day 1 (Start of Heat)
const initializeReadings = (): DailyReading[] => {
  return [
    { day: 1, value: '', date: undefined },
  ];
};
```

### **3. Dynamic Day Addition**
```typescript
const addDay = () => {
  const nextDay = (readings[readings.length - 1]?.day || 0) + 1;
  if (nextDay <= 15) {
    setReadings([...readings, { day: nextDay as DayNumber, value: '', date: undefined }]);
  }
};
```

### **4. UI Labels**
```tsx
<Badge>
  Day {day}{day === 1 && " (Start of Heat)"}
</Badge>
```

---

## 📅 **Example Timeline**

### **Scenario: Bella's Heat Cycle**

```
Oct 20 (Day 1) - First day of heat
├─ Record: 1.5 ng/mL
├─ Status: Anestrus
└─ System: "Next test on Oct 25 (Day 5)"

Oct 25 (Day 5) - Automatic reminder sent
├─ Record: 3.2 ng/mL
├─ Status: LH Surge
└─ System: "Test again in 3 days (Oct 28)"

Oct 28 (Day 8) - Reminder sent
├─ Record: 7.5 ng/mL
├─ Status: Estimated Ovulation
└─ System: "Test every 2 days"

Oct 30 (Day 10) - Reminder sent
├─ Record: 12.8 ng/mL
├─ Status: Egg Maturation
└─ System: "TEST DAILY - Fertile window approaching"

Oct 31 (Day 11) - Daily reminder
├─ Record: 18.5 ng/mL
├─ Status: Fertile Range
└─ System: "🎯 BREED TODAY! Optimal window open"

Nov 1 (Day 12) - Daily reminder
├─ Record: 22.3 ng/mL
├─ Status: Fertile Range
└─ System: "🎯 BREED TODAY! Last optimal day"

Nov 2 (Day 13) - Daily reminder
├─ Record: 28.1 ng/mL
├─ Status: Late Stage Fertility
└─ System: "Breeding window closing"
```

---

## 🔔 **Smart Reminder System** (To Be Implemented)

### **Reminder Logic:**
```typescript
function calculateNextTestDate(currentDay: number, progesteroneLevel: number): Date {
  const baseDate = getCurrentDate();
  
  if (currentDay === 1) {
    // After Day 1, always remind on Day 5
    return addDays(baseDate, 4); // Day 5
  }
  
  if (progesteroneLevel < 4) {
    return addDays(baseDate, 3); // Test in 3 days
  } else if (progesteroneLevel >= 4 && progesteroneLevel < 10) {
    return addDays(baseDate, 2); // Test in 2 days
  } else {
    return addDays(baseDate, 1); // Test daily
  }
}
```

### **Notification Types:**
```typescript
interface ProgesteroneReminder {
  type: 'test_due' | 'breeding_window' | 'urgent';
  bitchId: string;
  bitchName: string;
  day: number;
  message: string;
  dueDate: Date;
  channels: ('email' | 'sms' | 'in_app')[];
}
```

---

## 📱 **User Experience**

### **Day 1 Entry:**
```
┌─────────────────────────────────────┐
│ Progesterone Calculator             │
│                                     │
│ Day 1 (Start of Heat)               │
│ ┌─────────────────┐                │
│ │ Test Date       │                │
│ │ 10/20/2025      │                │
│ └─────────────────┘                │
│ ┌─────────────────┐                │
│ │ Level: 1.5      │ ng/mL          │
│ └─────────────────┘                │
│                                     │
│ [Save Reading]                      │
│                                     │
│ ✅ System will remind you on        │
│    Oct 25 for Day 5 reading         │
└─────────────────────────────────────┘
```

### **Day 5 Reminder:**
```
┌─────────────────────────────────────┐
│ 🔔 Progesterone Test Due            │
│                                     │
│ Bella - Golden Retriever            │
│ Day 5 reading is due today!         │
│                                     │
│ Last reading (Day 1):               │
│ • 1.5 ng/mL (Anestrus)              │
│                                     │
│ [Enter Day 5 Reading]               │
└─────────────────────────────────────┘
```

### **Breeding Window Alert:**
```
┌─────────────────────────────────────┐
│ 🎯 BREEDING WINDOW OPEN!            │
│                                     │
│ Bella - Golden Retriever            │
│ Day 11 - 18.5 ng/mL                 │
│                                     │
│ ✅ OPTIMAL TIME TO BREED            │
│ • Natural/AI: Breed today & tomorrow│
│ • Frozen: Wait 1-2 more days        │
│                                     │
│ Expected Whelping: Jan 5, 2026      │
│                                     │
│ [Record Breeding] [Dismiss]         │
└─────────────────────────────────────┘
```

---

## ✅ **Phase 1 Complete**

- ✅ Day numbering: 1-15 (not 0-5)
- ✅ Day 1 labeled as "Start of Heat"
- ✅ Extended to 15 days for full cycle
- ✅ HTML5 date picker
- ✅ Updated all initialization logic
- ✅ Fixed reset functionality

---

## 🚀 **Next Steps (Phase 2)**

### **1. Bitch Selection**
```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select bitch" />
  </SelectTrigger>
  <SelectContent>
    {femaleAnimals.map(animal => (
      <SelectItem value={animal.id}>
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={animal.profilePhotoUrl} />
            <AvatarFallback>{animal.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{animal.name}</div>
            <div className="text-xs text-muted-foreground">{animal.breed}</div>
          </div>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### **2. Heat Cycle Tracking**
```typescript
interface HeatCycle {
  id: string;
  bitchId: string;
  startDate: Date; // Day 1
  progesteroneReadings: ProgesteroneReading[];
  breedingMethod: BreedingMethod;
  breedingDates?: Date[];
  estimatedOvulationDay?: number;
  estimatedWhelpingDate?: Date;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
}
```

### **3. Smart Notifications**
- Email via Mailtrap
- SMS (future)
- In-app notifications
- Reminder scheduling based on readings

### **4. Breeding Window Calculator**
```typescript
function calculateBreedingWindow(readings: ProgesteroneReading[], method: BreedingMethod) {
  const ovulationDay = findOvulationDay(readings); // When crosses 4-9 ng/mL
  
  if (method === 'natural_ai') {
    return {
      start: ovulationDay + 2,
      end: ovulationDay + 4,
      message: "Breed 2-4 days after ovulation"
    };
  } else if (method === 'frozen_semen') {
    return {
      start: ovulationDay + 3,
      end: ovulationDay + 5,
      message: "Breed 3-5 days after ovulation"
    };
  }
}
```

### **5. Whelping Date Calculator**
```typescript
function calculateWhelpingDate(ovulationDate: Date): Date {
  return addDays(ovulationDate, 63); // ±2 days
}
```

### **6. Historical Comparison**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Previous Cycles</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Last Cycle (Aug 2025)</span>
        <span>Ovulation: Day 10</span>
      </div>
      <div className="flex justify-between">
        <span>Cycle Before (May 2025)</span>
        <span>Ovulation: Day 9</span>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 📋 **Database Schema Needed**

```sql
-- Heat Cycles Table
CREATE TABLE heat_cycles (
  id UUID PRIMARY KEY,
  bitch_id UUID REFERENCES animals(id),
  breeder_id UUID REFERENCES users(id),
  start_date DATE NOT NULL,
  breeding_method VARCHAR(50),
  estimated_ovulation_day INTEGER,
  estimated_whelping_date DATE,
  status VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Progesterone Readings Table
CREATE TABLE progesterone_readings (
  id UUID PRIMARY KEY,
  heat_cycle_id UUID REFERENCES heat_cycles(id),
  day INTEGER NOT NULL,
  test_date DATE NOT NULL,
  progesterone_level DECIMAL(5,2) NOT NULL,
  unit VARCHAR(20),
  laboratory VARCHAR(50),
  phase VARCHAR(50),
  created_at TIMESTAMP
);

-- Breeding Records Table
CREATE TABLE breeding_records (
  id UUID PRIMARY KEY,
  heat_cycle_id UUID REFERENCES heat_cycles(id),
  breeding_date DATE NOT NULL,
  stud_id UUID REFERENCES animals(id),
  method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP
);

-- Reminders Table
CREATE TABLE progesterone_reminders (
  id UUID PRIMARY KEY,
  heat_cycle_id UUID REFERENCES heat_cycles(id),
  breeder_id UUID REFERENCES users(id),
  reminder_type VARCHAR(50),
  due_date DATE NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  channels JSONB, -- ['email', 'sms', 'in_app']
  created_at TIMESTAMP
);
```

---

## 🎯 **Summary**

**Phase 1 Complete:**
- ✅ Day 1-15 structure implemented
- ✅ "Day 1 (Start of Heat)" labeling
- ✅ HTML5 date picker
- ✅ Foundation for smart reminders

**Phase 2 Next:**
- 🔜 Bitch selection
- 🔜 Heat cycle tracking
- 🔜 Smart notifications (Email/SMS/In-app)
- 🔜 Breeding window calculator
- 🔜 Whelping date calculator
- 🔜 Historical cycle comparison

**Ready to proceed with Phase 2!** 🚀
