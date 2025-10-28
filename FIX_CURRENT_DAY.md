# Fix CurrentDay for Existing Cycles

## Problem
Existing heat cycles were created with calendar-based `currentDay` calculation (Day 6 instead of Day 1).

## Solution Options

### Option 1: Delete and Recreate (Recommended)
1. Go to the cycle detail page
2. Click the delete button
3. Create a new cycle with the same start date
4. Add your readings again (they will auto-calculate to correct days)

### Option 2: Database Update (If you want to keep existing data)

Run this SQL in your NEON database console:

```sql
-- Reset all active cycles to Day 1 (if they have no readings)
UPDATE heat_cycles 
SET current_day = 1 
WHERE status = 'active' 
AND id NOT IN (
  SELECT DISTINCT heat_cycle_id 
  FROM heat_cycle_progesterone_readings
);

-- For cycles with readings, set currentDay to the latest reading's day
UPDATE heat_cycles hc
SET current_day = (
  SELECT MAX(day) 
  FROM heat_cycle_progesterone_readings 
  WHERE heat_cycle_id = hc.id
)
WHERE id IN (
  SELECT DISTINCT heat_cycle_id 
  FROM heat_cycle_progesterone_readings
);
```

### Option 3: Fix Individual Cycle via API

If you know the cycle ID, you can update it:

```bash
# Replace YOUR_CYCLE_ID with the actual ID
curl -X PATCH http://localhost:3000/api/heat-cycles/YOUR_CYCLE_ID \
  -H "Content-Type: application/json" \
  -d '{"currentDay": 5}'
```

## Verification

After fixing, you should see:
- **No readings**: "Next Test Due: Day 5"
- **With Day 5 reading**: "Latest Test: Day 5"
- **With Day 7 reading**: "Latest Test: Day 7"

## Prevention

✅ **Fixed in code** - New cycles will always start at Day 1
✅ **Auto-calculation** - Readings auto-calculate day from test date
✅ **Display logic** - Shows correct day based on readings or expected next test
