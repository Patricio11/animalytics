# 🗄️ Progesterone Database Schema Redesign

## ✅ **New Dedicated Progesterone Schema**

Following the same clean pattern as `matings.ts`, we've created a dedicated `progesterone.ts` schema file for better organization and maintainability.

---

## 📊 **New Structure**

### **Before** (Mixed in heat-cycles.ts)
```
lib/db/schema/
├── heat-cycles.ts          ❌ Everything mixed together
│   ├── heatCyclesTable
│   ├── heatCycleProgesteroneReadings
│   ├── breedingRecords
│   └── progesteroneReminders
```

### **After** (Clean separation)
```
lib/db/schema/
├── progesterone.ts         ✅ Dedicated progesterone schema
│   ├── heatCycles
│   ├── progesteroneReadings
│   ├── breedingRecords
│   ├── progesteroneReminders
│   └── progesteroneTemplates
└── matings.ts              ✅ Similar clean pattern
    └── matings
```

---

## 🎯 **New Progesterone Schema** (`lib/db/schema/progesterone.ts`)

### **1. Heat Cycles Table** (`heatCycles`)
Main table for tracking heat cycles

```typescript
export const heatCycles = pgTable('heat_cycles', {
  id: uuid('id').primaryKey().defaultRandom(),
  breederId: text('breeder_id').references(() => users.id),
  bitchId: uuid('bitch_id').references(() => animals.id),
  
  // Cycle Information
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  currentDay: integer('current_day').default(1),
  status: heatCycleStatusEnum('status').default('active'),
  
  // Breeding Information
  breedingMethod: breedingMethodEnum('breeding_method'),
  estimatedOvulationDay: integer('estimated_ovulation_day'),
  estimatedOvulationDate: date('estimated_ovulation_date'),
  estimatedWhelpingDate: date('estimated_whelping_date'),
  
  // Success Tracking
  successful: boolean('successful'),
  actualWhelpingDate: date('actual_whelping_date'),
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

**Key Fields**:
- `startDate` - Day 1 of heat (first bleeding)
- `currentDay` - Auto-incremented daily
- `status` - active, completed, cancelled
- `breedingMethod` - natural_ai or frozen
- `successful` - Track pregnancy outcome
- `actualWhelpingDate` - Actual vs estimated

### **2. Progesterone Readings Table** (`progesteroneReadings`)
Individual test results with automatic analysis

```typescript
export const progesteroneReadings = pgTable('progesterone_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  heatCycleId: uuid('heat_cycle_id').references(() => heatCycles.id),
  breederId: text('breeder_id').references(() => users.id),
  
  // Reading Information
  day: integer('day').notNull(),
  testDate: date('test_date').notNull(),
  progesteroneLevel: decimal('progesterone_level', { precision: 5, scale: 2 }),
  unit: progesteroneUnitEnum('unit').default('nanograms'),
  laboratory: laboratoryTypeEnum('laboratory').default('VIDAS'),
  
  // Automatic Analysis
  phase: text('phase'),
  phaseColor: text('phase_color'),
  nextTestDays: integer('next_test_days'),
  nextTestDate: date('next_test_date'),
  nextTestReason: text('next_test_reason'),
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Key Fields**:
- `progesteroneLevel` - Test result (ng/mL or nmol/L)
- `laboratory` - VIDAS, IDEXX, IMMULITE, RIA, ELISA, OTHER
- `phase` - Auto-detected (Anestrus, LH Surge, Ovulation, etc.)
- `nextTestDays` - Smart recommendation (1, 2, or 3 days)

### **3. Breeding Records Table** (`breedingRecords`)
Track actual breeding dates and methods

```typescript
export const breedingRecords = pgTable('breeding_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  heatCycleId: uuid('heat_cycle_id').references(() => heatCycles.id),
  breederId: text('breeder_id').references(() => users.id),
  
  // Breeding Information
  breedingDate: date('breeding_date').notNull(),
  breedingDay: integer('breeding_day'),
  breedingMethod: breedingRecordMethodEnum('breeding_method'),
  
  // Stud Information
  studId: uuid('stud_id').references(() => animals.id),
  studName: text('stud_name'),
  studRegistration: text('stud_registration'),
  
  // Semen Information (for AI)
  frozenSemenId: uuid('frozen_semen_id'),
  semenQuality: text('semen_quality'),
  motility: integer('motility'),
  concentration: decimal('concentration', { precision: 10, scale: 2 }),
  
  // Progesterone at breeding
  progesteroneLevelAtBreeding: decimal('progesterone_level_at_breeding'),
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Key Fields**:
- `breedingMethod` - natural, ai_fresh, ai_chilled, ai_frozen, tci, surgical
- `studId` - Link to own stud
- `studName` - External stud name
- `semenQuality` - Track semen parameters
- `progesteroneLevelAtBreeding` - Level at time of breeding

### **4. Progesterone Reminders Table** (`progesteroneReminders`)
Automated notifications

```typescript
export const progesteroneReminders = pgTable('progesterone_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  heatCycleId: uuid('heat_cycle_id').references(() => heatCycles.id),
  breederId: text('breeder_id').references(() => users.id),
  
  // Reminder Information
  reminderType: reminderTypeEnum('reminder_type'),
  dueDate: date('due_date').notNull(),
  dueTime: text('due_time'),
  
  // Notification Content
  title: text('title').notNull(),
  message: text('message').notNull(),
  priority: reminderPriorityEnum('priority').default('normal'),
  
  // Delivery Channels
  channels: text('channels').array(),
  
  // Status
  sent: boolean('sent').default(false),
  sentAt: timestamp('sent_at'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Key Fields**:
- `reminderType` - test_due, breeding_window, daily_test, whelping_approaching
- `priority` - low, normal, high, urgent
- `channels` - ['email', 'sms', 'in_app']
- `sent` - Track delivery status

### **5. Progesterone Templates Table** (`progesteroneTemplates`) ✨ NEW
Reusable templates for common scenarios

```typescript
export const progesteroneTemplates = pgTable('progesterone_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  breederId: text('breeder_id').references(() => users.id),
  
  // Template Information
  name: text('name').notNull(),
  description: text('description'),
  breedingMethod: breedingMethodEnum('breeding_method'),
  
  // Template Settings
  firstTestDay: integer('first_test_day').default(5),
  preferredLaboratory: laboratoryTypeEnum('preferred_laboratory'),
  reminderChannels: text('reminder_channels').array(),
  
  // Usage Tracking
  timesUsed: integer('times_used').default(0),
  lastUsed: timestamp('last_used'),
  
  // Metadata
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

**Benefits**:
- Save preferred settings
- Quick cycle setup
- Track what works best
- Share templates between bitches

---

## 🔧 **Enums Defined**

### **Heat Cycle Status**
```typescript
'active'      // Currently tracking
'completed'   // Breeding completed, cycle ended
'cancelled'   // Cancelled/abandoned
```

### **Breeding Method**
```typescript
'natural_ai'  // Natural breeding or fresh AI
'frozen'      // Frozen semen AI
```

### **Progesterone Unit**
```typescript
'nanograms'   // ng/mL (most common)
'nanomoles'   // nmol/L
```

### **Laboratory Type**
```typescript
'VIDAS'       // VIDAS machine (most common)
'IDEXX'       // IDEXX machine
'IMMULITE'    // Immulite machine
'RIA'         // Radioimmunoassay
'ELISA'       // Enzyme-linked immunosorbent assay
'OTHER'       // Other methods
```

### **Breeding Record Method**
```typescript
'natural'     // Natural tie
'ai_fresh'    // Fresh AI
'ai_chilled'  // Chilled semen AI
'ai_frozen'   // Frozen semen AI
'tci'         // Transcervical insemination
'surgical'    // Surgical AI
```

### **Reminder Type**
```typescript
'test_due'                // Regular test reminder
'breeding_window'         // Breeding window detected
'daily_test'              // Daily testing required
'whelping_approaching'    // Whelping date approaching
```

### **Reminder Priority**
```typescript
'low'         // Can wait
'normal'      // Standard reminder
'high'        // Important
'urgent'      // Immediate attention needed
```

---

## 🔄 **Migration Steps**

### **Option 1: Clean Migration** (Recommended)
1. **Backup current data**
2. **Remove old tables** from `heat-cycles.ts`
3. **Keep only new** `progesterone.ts`
4. **Run migration**: `npm run db:generate && npm run db:push`

### **Option 2: Gradual Migration**
1. **Keep both files** temporarily
2. **Update imports** to use new `progesterone.ts`
3. **Test thoroughly**
4. **Remove old** `heat-cycles.ts` when ready

---

## 📝 **Benefits of New Structure**

### **1. Better Organization**
- ✅ Dedicated file for progesterone tracking
- ✅ Matches `matings.ts` pattern
- ✅ Easier to find and maintain

### **2. Cleaner Code**
- ✅ No mixed concerns
- ✅ Clear table names (`heatCycles` vs `heatCyclesTable`)
- ✅ Consistent naming conventions

### **3. Enhanced Features**
- ✅ **Templates table** - Save and reuse settings
- ✅ **Success tracking** - Track pregnancy outcomes
- ✅ **Better semen tracking** - Quality, motility, concentration
- ✅ **More laboratory options** - IMMULITE, RIA, ELISA

### **4. Scalability**
- ✅ Easy to add new fields
- ✅ Clear relationships
- ✅ Future-proof structure

### **5. Developer Experience**
- ✅ Autocomplete works better
- ✅ Type safety improved
- ✅ Less confusion about table names

---

## 🎯 **Usage Examples**

### **Create Heat Cycle**
```typescript
import { heatCycles } from '@/lib/db/schema/progesterone';

const newCycle = await db.insert(heatCycles).values({
  breederId: user.id,
  bitchId: bitch.id,
  startDate: '2025-10-28',
  breedingMethod: 'natural_ai',
}).returning();
```

### **Add Progesterone Reading**
```typescript
import { progesteroneReadings } from '@/lib/db/schema/progesterone';

const reading = await db.insert(progesteroneReadings).values({
  heatCycleId: cycle.id,
  breederId: user.id,
  day: 5,
  testDate: '2025-11-02',
  progesteroneLevel: '3.2',
  laboratory: 'VIDAS',
  phase: 'LH Surge',
  phaseColor: '#a855f7',
  nextTestDays: 2,
}).returning();
```

### **Record Breeding**
```typescript
import { breedingRecords } from '@/lib/db/schema/progesterone';

const breeding = await db.insert(breedingRecords).values({
  heatCycleId: cycle.id,
  breederId: user.id,
  breedingDate: '2025-11-05',
  breedingDay: 10,
  breedingMethod: 'natural',
  studId: stud.id,
  progesteroneLevelAtBreeding: '18.5',
}).returning();
```

### **Create Template**
```typescript
import { progesteroneTemplates } from '@/lib/db/schema/progesterone';

const template = await db.insert(progesteroneTemplates).values({
  breederId: user.id,
  name: 'Golden Retriever - Natural Breeding',
  breedingMethod: 'natural_ai',
  firstTestDay: 5,
  preferredLaboratory: 'VIDAS',
  reminderChannels: ['email', 'sms'],
  isDefault: true,
}).returning();
```

---

## ✅ **Summary**

**What's New**:
- ✅ Dedicated `progesterone.ts` schema file
- ✅ Clean table names (`heatCycles`, `progesteroneReadings`, etc.)
- ✅ New `progesteroneTemplates` table
- ✅ Enhanced tracking fields
- ✅ More laboratory options
- ✅ Better semen quality tracking
- ✅ Success/outcome tracking

**What's Better**:
- ✅ Follows `matings.ts` pattern
- ✅ Easier to maintain
- ✅ Better organized
- ✅ More scalable
- ✅ Improved type safety

**Next Steps**:
1. Review the new schema
2. Decide on migration strategy
3. Run database migration
4. Update imports in code
5. Test thoroughly

**The progesterone schema is now professional, organized, and ready for production!** 🎉
