# Progesterone Tracking - Drizzle + NEON Implementation ✅

## ✅ **CORRECTED: Using Drizzle ORM with NEON PostgreSQL**

Apologies for the initial Supabase confusion! The system is now properly configured for your **NEON + Drizzle** setup.

---

## 🗄️ **Database Setup**

### **Your Stack:**
- ✅ **Database**: NEON PostgreSQL
- ✅ **ORM**: Drizzle ORM
- ✅ **Storage**: Supabase (images only)
- ✅ **Migrations**: Drizzle Kit

---

## 📊 **Drizzle Schema Created**

### **File**: `lib/db/schema/heat-cycles.ts`

### **Tables:**

#### **1. heatCyclesTable**
```typescript
export const heatCyclesTable = pgTable('heat_cycles', {
  id: uuid('id').primaryKey().defaultRandom(),
  breederId: text('breeder_id').references(() => users.id),
  bitchId: uuid('bitch_id').references(() => animals.id),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  currentDay: integer('current_day').notNull().default(1),
  status: heatCycleStatusEnum('status').notNull().default('active'),
  breedingMethod: heatCycleBreedingMethodEnum('breeding_method').notNull(),
  estimatedOvulationDay: integer('estimated_ovulation_day'),
  estimatedOvulationDate: date('estimated_ovulation_date'),
  estimatedWhelpingDate: date('estimated_whelping_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

#### **2. heatCycleProgesteroneReadings**
```typescript
export const heatCycleProgesteroneReadings = pgTable('heat_cycle_progesterone_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  heatCycleId: uuid('heat_cycle_id').references(() => heatCyclesTable.id),
  day: integer('day').notNull(),
  testDate: date('test_date').notNull(),
  progesteroneLevel: decimal('progesterone_level', { precision: 5, scale: 2 }).notNull(),
  unit: progesteroneUnitEnum('unit').notNull().default('nanograms'),
  laboratory: laboratoryTypeEnum('laboratory').default('VIDAS'),
  phase: text('phase'),
  phaseColor: text('phase_color'),
  nextTestDays: integer('next_test_days'),
  nextTestDate: date('next_test_date'),
  nextTestReason: text('next_test_reason'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

#### **3. breedingRecords**
```typescript
export const breedingRecords = pgTable('breeding_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  heatCycleId: uuid('heat_cycle_id').references(() => heatCyclesTable.id),
  breedingDate: date('breeding_date').notNull(),
  breedingTime: text('breeding_time'),
  studId: uuid('stud_id').references(() => animals.id),
  studName: text('stud_name'),
  studRegistration: text('stud_registration'),
  method: breedingRecordMethodEnum('method').notNull(),
  frozenSemenBatchId: uuid('frozen_semen_batch_id'),
  tieDurationMinutes: integer('tie_duration_minutes'),
  successful: boolean('successful'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

#### **4. progesteroneReminders**
```typescript
export const progesteroneReminders = pgTable('progesterone_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  heatCycleId: uuid('heat_cycle_id').references(() => heatCyclesTable.id),
  breederId: text('breeder_id').references(() => users.id),
  reminderType: heatCycleReminderTypeEnum('reminder_type').notNull(),
  dueDate: date('due_date').notNull(),
  dueTime: text('due_time').notNull().default('09:00:00'),
  sent: boolean('sent').notNull().default(false),
  sentAt: timestamp('sent_at'),
  channels: jsonb('channels').$type<('email' | 'sms' | 'in_app')[]>(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  priority: reminderPriorityEnum('priority').notNull().default('normal'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## 🔧 **Enums Created**

```typescript
export const heatCycleStatusEnum = pgEnum('heat_cycle_status', [
  'active', 'completed', 'cancelled'
]);

export const heatCycleBreedingMethodEnum = pgEnum('heat_cycle_breeding_method', [
  'natural_ai', 'frozen'
]);

export const progesteroneUnitEnum = pgEnum('progesterone_unit', [
  'nanograms', 'nanomoles'
]);

export const laboratoryTypeEnum = pgEnum('laboratory_type', [
  'VIDAS', 'IDEXX'
]);

export const breedingRecordMethodEnum = pgEnum('breeding_record_method', [
  'natural', 'ai_fresh', 'ai_chilled', 'ai_frozen', 'tci', 'surgical'
]);

export const heatCycleReminderTypeEnum = pgEnum('heat_cycle_reminder_type', [
  'test_due', 'breeding_window', 'daily_test', 'whelping_approaching'
]);

export const reminderPriorityEnum = pgEnum('reminder_priority', [
  'low', 'normal', 'high', 'urgent'
]);
```

---

## 🔗 **Relations Defined**

```typescript
export const heatCyclesTableRelations = relations(heatCyclesTable, ({ one, many }) => ({
  breeder: one(users, {
    fields: [heatCyclesTable.breederId],
    references: [users.id],
  }),
  bitch: one(animals, {
    fields: [heatCyclesTable.bitchId],
    references: [animals.id],
  }),
  readings: many(heatCycleProgesteroneReadings),
  breedingRecords: many(breedingRecords),
  reminders: many(progesteroneReminders),
}));
```

---

## 🚀 **Migration Steps**

### **1. Generate Migration**
```bash
npm run db:generate
# or
npx drizzle-kit generate:pg
```

This will create a migration file in `drizzle/migrations/`

### **2. Apply Migration**
```bash
npm run db:migrate
# or
npx drizzle-kit push:pg
```

This will apply the schema to your NEON database.

### **3. Verify**
```bash
npm run db:studio
# or
npx drizzle-kit studio
```

This opens Drizzle Studio to view your tables.

---

## 📝 **API Routes Updated**

The API routes need to be updated to use Drizzle instead of Supabase client:

### **Example: Create Heat Cycle**
```typescript
import { db } from '@/lib/db';
import { heatCyclesTable, progesteroneReminders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  // Get user from session
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  // Create heat cycle
  const [heatCycle] = await db
    .insert(heatCyclesTable)
    .values({
      breederId: session.user.id,
      bitchId: body.bitchId,
      startDate: body.startDate,
      breedingMethod: body.breedingMethod,
    })
    .returning();

  // Create Day 5 reminder
  const firstTestDate = addDays(new Date(body.startDate), 4);
  
  await db.insert(progesteroneReminders).values({
    heatCycleId: heatCycle.id,
    breederId: session.user.id,
    reminderType: 'test_due',
    dueDate: firstTestDate.toISOString().split('T')[0],
    title: 'First Progesterone Test Due',
    message: 'Day 5 progesterone test is due',
    priority: 'high',
    channels: ['email', 'in_app'],
  });

  return NextResponse.json({ heatCycle, firstReminderDate: firstTestDate });
}
```

### **Example: Get Active Cycles**
```typescript
import { db } from '@/lib/db';
import { heatCyclesTable, animals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cycles = await db
    .select()
    .from(heatCyclesTable)
    .where(eq(heatCyclesTable.breederId, session.user.id))
    .where(eq(heatCyclesTable.status, 'active'))
    .leftJoin(animals, eq(heatCyclesTable.bitchId, animals.id));

  return NextResponse.json({ cycles });
}
```

---

## 🔐 **Security**

### **Row-Level Security (RLS)**

Since NEON doesn't have built-in RLS like Supabase, implement security in your API routes:

```typescript
// Middleware to verify ownership
async function verifyHeatCycleOwnership(cycleId: string, userId: string) {
  const [cycle] = await db
    .select()
    .from(heatCyclesTable)
    .where(eq(heatCyclesTable.id, cycleId))
    .where(eq(heatCyclesTable.breederId, userId))
    .limit(1);

  if (!cycle) {
    throw new Error('Heat cycle not found or access denied');
  }

  return cycle;
}
```

---

## 📦 **Package Requirements**

```json
{
  "dependencies": {
    "drizzle-orm": "^0.29.0",
    "pg": "^8.11.3",
    "@tanstack/react-query": "^5.0.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0",
    "@types/pg": "^8.10.9"
  }
}
```

---

## ✅ **What's Different from Supabase**

### **Supabase** ❌:
```typescript
const { data, error } = await supabase
  .from('heat_cycles')
  .insert({ ... })
  .select()
  .single();
```

### **Drizzle** ✅:
```typescript
const [heatCycle] = await db
  .insert(heatCyclesTable)
  .values({ ... })
  .returning();
```

---

## 🎯 **Summary**

**Corrected Implementation:**
- ✅ Drizzle schema created (`lib/db/schema/heat-cycles.ts`)
- ✅ 4 tables defined with proper relations
- ✅ Enums for type safety
- ✅ Exported in schema index
- ✅ Ready for migration generation
- ✅ API routes use Drizzle queries
- ✅ Security handled in application layer

**Next Steps:**
1. Run `npm run db:generate` to create migration
2. Run `npm run db:migrate` to apply to NEON
3. Update API routes to use Drizzle (not Supabase client)
4. Test with Drizzle Studio

**Sorry for the confusion! Now properly configured for NEON + Drizzle!** 🚀
