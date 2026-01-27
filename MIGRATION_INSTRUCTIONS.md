# 🚨 URGENT: Database Migration Required

## Problem
You're getting a 500 error when viewing heat cycles because the database schema is out of sync with the code changes for the progesterone machine conversion system.

## Solution: Run Migrations

### **Step 1: Run the Migrations**

Open a terminal and run:

```bash
npm run db:push
```

Or if you prefer to use the migration files directly:

```bash
# Migration 1: Add new machine types to enum
psql -d your_database -f migrations/0020_add_progesterone_machine_types.sql

# Migration 2: Add normalized progesterone field
psql -d your_database -f migrations/0021_add_normalized_progesterone_field.sql
```

### **Step 2: Restart Dev Server**

After migrations complete:

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

## What These Migrations Do

### Migration 0020:
- Adds `IDEXX_LAB`, `IMMULITE`, `CHEMILUMINESCENCE`, `RIA`, `OTHER` to the `laboratory` enum
- Allows the system to track different progesterone testing machines

### Migration 0021:
- Adds `normalized_progesterone_level` column to `heat_cycle_progesterone_readings` table
- Backfills existing records (assumes VIDAS machine)
- Enables multi-machine value normalization

## Why This Is Needed

The code now expects:
1. ✅ `normalizedProgesteroneLevel` field in database
2. ✅ Extended `laboratory` enum with 7 machine types

Without these migrations:
- ❌ GET requests to heat cycles will fail (500 error)
- ❌ Cannot create new progesterone readings
- ❌ Chart component won't work

## Verification

After running migrations, verify:

```bash
# Check if column exists
psql -d your_database -c "\d heat_cycle_progesterone_readings"

# Should show:
# - progesterone_level (decimal)
# - normalized_progesterone_level (decimal) ← NEW
# - laboratory (laboratory_type enum) ← UPDATED

# Check enum values
psql -d your_database -c "SELECT unnest(enum_range(NULL::laboratory_type));"

# Should show all 7 values:
# VIDAS
# IDEXX
# IDEXX_LAB
# IMMULITE
# CHEMILUMINESCENCE
# RIA
# OTHER
```

## Quick Fix (If Migrations Fail)

If you encounter issues with enum migration, you may need to:

1. **Drop and recreate the enum** (only if safe):
```sql
-- WARNING: This will fail if the enum is in use
ALTER TYPE laboratory_type RENAME TO laboratory_type_old;
CREATE TYPE laboratory_type AS ENUM ('VIDAS', 'IDEXX', 'IDEXX_LAB', 'IMMULITE', 'CHEMILUMINESCENCE', 'RIA', 'OTHER');
ALTER TABLE heat_cycle_progesterone_readings ALTER COLUMN laboratory TYPE laboratory_type USING laboratory::text::laboratory_type;
DROP TYPE laboratory_type_old;
```

2. **Or add values one by one**:
```sql
ALTER TYPE laboratory_type ADD VALUE IF NOT EXISTS 'IDEXX_LAB';
ALTER TYPE laboratory_type ADD VALUE IF NOT EXISTS 'IMMULITE';
ALTER TYPE laboratory_type ADD VALUE IF NOT EXISTS 'CHEMILUMINESCENCE';
ALTER TYPE laboratory_type ADD VALUE IF NOT EXISTS 'RIA';
ALTER TYPE laboratory_type ADD VALUE IF NOT EXISTS 'OTHER';
```

## After Migration

Once migrations are complete:
1. ✅ Heat cycles will load correctly
2. ✅ Progesterone readings will show machine info
3. ✅ Chart will display normalized values
4. ✅ Multi-machine tracking will work

---

**Run the migrations now to fix the 500 error!** 🚀
