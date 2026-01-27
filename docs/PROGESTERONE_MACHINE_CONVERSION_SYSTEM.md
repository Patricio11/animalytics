# Progesterone Machine Conversion System

## Overview

The progesterone machine conversion system allows breeders to use different progesterone testing machines (Vidas, IDEXX, IDEXX Lab, etc.) and have all readings normalized to a standard reference scale for consistent interpretation and graphing.

## Problem Solved

Different progesterone testing machines use different calibrations and methodologies, resulting in different numerical values for the same biological progesterone level. For example:
- **VIDAS reads 10 ng/mL** → Same sample on **IDEXX reads ~13 ng/mL**
- This makes it difficult to interpret results when switching between machines
- Charts would show inconsistent trends if mixing machine types

## Solution

All progesterone readings are:
1. **Stored with both raw and normalized values**
2. **Normalized to Mini VIDAS standard** (industry reference)
3. **Displayed consistently** on charts and phase detection
4. **Converted automatically** based on machine type

## Supported Machines

| Machine | Manufacturer | Conversion Factor | Notes |
|---------|-------------|-------------------|-------|
| **VIDAS** | bioMérieux | 1.0 (reference) | Mini VIDAS - Industry standard |
| **IDEXX** | IDEXX | 0.77 | Catalyst - Reads ~30% higher than VIDAS |
| **IDEXX_LAB** | IDEXX | 0.95 | Reference Lab - Closer to VIDAS |
| **IMMULITE** | Siemens | 0.85 | Tends to read higher |
| **CHEMILUMINESCENCE** | Generic | 0.90 | Generic chemiluminescence |
| **RIA** | Generic | 1.0 | Radioimmunoassay - Comparable to VIDAS |
| **OTHER** | Unknown | 1.0 | No conversion applied |

## Conversion Formula

```typescript
VIDAS_equivalent = machine_value × conversion_factor

Example:
IDEXX reading: 13 ng/mL
VIDAS equivalent: 13 × 0.77 = 10 ng/mL
```

## Database Schema Updates

### Matings Table (Enum Expansion)
```sql
ALTER TYPE laboratory ADD VALUE 'IDEXX_LAB';
ALTER TYPE laboratory ADD VALUE 'IMMULITE';
ALTER TYPE laboratory ADD VALUE 'CHEMILUMINESCENCE';
ALTER TYPE laboratory ADD VALUE 'RIA';
ALTER TYPE laboratory ADD VALUE 'OTHER';
```

### Progesterone Tests Table (Reading Structure)
```typescript
readings: {
  day: number;
  value: number;              // Raw value from machine
  normalizedValue: number;    // Normalized to VIDAS standard
  date: string;
  machine: string;            // Machine type for this reading
}[]
```

## User Interface

### Progesterone Test Form

**New Fields:**
1. **Testing Machine Dropdown**
   - Shows all available machines with descriptions
   - Defaults to VIDAS
   - Icon: Beaker (🧪)

2. **Conversion Info Alert** (shown when using non-VIDAS machines)
   - Shows: "13 ng/mL on IDEXX Catalyst = 10 ng/mL VIDAS equivalent"
   - Helps user understand the conversion

3. **Phase Detection Badge**
   - Shows raw value: "13 ng/mL"
   - Shows normalized value below: "(10 VIDAS)"

### Chart Display

**All readings normalized to VIDAS standard:**
- X-axis: Day of heat cycle
- Y-axis: Progesterone (ng/mL VIDAS equivalent)
- Tooltip shows both raw and normalized values
- Phase zones based on normalized values

## Implementation Files

### Core Utilities
- **`lib/utils/progesterone-machine-conversion.ts`**
  - Machine definitions
  - Conversion functions
  - Validation helpers
  - Display formatters

### Database Schema
- **`lib/db/schema/matings.ts`** - Expanded laboratory enum
- **`lib/db/schema/progesterone-tests.ts`** - Updated readings structure

### UI Components
- **`components/breeder/calculators/ProgesteroneTestForm.tsx`** - Machine selection
- **`components/breeder/calculators/ProgesteroneChart.tsx`** - Normalized display

### Migration
- **`migrations/0020_add_progesterone_machine_types.sql`** - Database migration

## Usage Example

### Recording a Test

```typescript
// User enters:
Machine: IDEXX Catalyst
Value: 13 ng/mL
Date: 2024-01-15

// System stores:
{
  value: 13,                    // Raw IDEXX value
  normalizedValue: 10,          // VIDAS equivalent (13 × 0.77)
  machine: 'IDEXX',
  date: '2024-01-15'
}

// Phase detection uses: 10 ng/mL (normalized)
// Result: "Egg Maturation" phase
```

### Mixing Machines

```typescript
// Day 5: VIDAS test
{ value: 2.0, normalizedValue: 2.0, machine: 'VIDAS' }

// Day 8: IDEXX test (clinic visit)
{ value: 13.0, normalizedValue: 10.0, machine: 'IDEXX' }

// Day 10: IDEXX Lab (sent out)
{ value: 21.0, normalizedValue: 20.0, machine: 'IDEXX_LAB' }

// Chart shows smooth progression: 2 → 10 → 20 ng/mL
// All on same VIDAS-equivalent scale
```

## Breeding Decision Points (Cross-Machine Reference)

| Phase | VIDAS | IDEXX | IDEXX Lab | Notes |
|-------|-------|-------|-----------|-------|
| **LH Surge** | 1.5 | 1.9 | 1.6 | Hormone surge beginning |
| **Ovulation Start** | 4.0 | 5.2 | 4.2 | Test every 2 days |
| **Ovulation Peak** | 9.0 | 11.7 | 9.5 | Test daily |
| **Breeding Window (Natural/AI)** | 15.0 | 19.5 | 15.8 | Optimal for fresh/chilled |
| **Breeding Window (Frozen)** | 25.0 | 32.5 | 26.3 | Optimal for frozen semen |
| **Window End** | 35.0 | 45.5 | 36.8 | Breeding window closing |

## API Integration

### Saving a Reading

```typescript
POST /api/progesterone-readings

{
  animalId: "uuid",
  testDate: "2024-01-15",
  machine: "IDEXX",
  rawValue: 13.0,
  unit: "ng/mL"
}

// Backend automatically calculates:
{
  normalizedValue: 10.0,
  phase: "Egg Maturation",
  nextTestDate: "2024-01-16",
  breedingRecommendation: "Test daily - approaching breeding window"
}
```

## Customization

### Adjusting Conversion Factors

If your lab has specific correlation data, update the conversion factors in:

```typescript
// lib/utils/progesterone-machine-conversion.ts

export const CONVERSION_TO_VIDAS: Record<ProgesteroneMachine, number> = {
  VIDAS: 1.0,
  IDEXX: 0.77,  // ← Adjust based on your lab's correlation
  // ... other machines
};
```

### Adding New Machines

1. **Add to enum** in `lib/db/schema/matings.ts`
2. **Add machine info** in `progesterone-machine-conversion.ts`
3. **Add conversion factor** with correlation data
4. **Run migration** to update database

## Benefits

✅ **Consistency** - All readings on same scale regardless of machine
✅ **Flexibility** - Use any available testing machine
✅ **Accuracy** - Phase detection based on normalized values
✅ **Transparency** - Shows both raw and normalized values
✅ **Reliability** - Smooth chart progression when mixing machines

## Testing Checklist

- [ ] Record test with VIDAS machine
- [ ] Record test with IDEXX machine
- [ ] Verify conversion displayed correctly
- [ ] Check chart shows normalized values
- [ ] Verify phase detection uses normalized values
- [ ] Test mixing multiple machines in one cycle
- [ ] Confirm breeding recommendations are consistent

## Migration Instructions

1. **Run migration**: `npm run db:migrate`
2. **Restart dev server**: Required for enum changes
3. **Test form**: Verify machine dropdown appears
4. **Record test**: Try different machines
5. **Check chart**: Ensure normalized display works

## Support

For questions about conversion factors or adding new machines, consult:
- Veterinary progesterone testing literature
- Your laboratory's correlation studies
- IDEXX/bioMérieux technical documentation
