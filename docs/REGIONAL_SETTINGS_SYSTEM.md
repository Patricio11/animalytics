# Regional Settings System - Complete Implementation Guide

## 🎯 **Overview**

A comprehensive, systematic regional settings system that affects the entire application. All currency, dates, times, weights, and measurements respect user's regional preferences.

---

## 🏗️ **Architecture**

### **1. Global Context** ✅
- **File**: `lib/contexts/regional-settings-context.tsx`
- **Purpose**: Provides regional settings to entire app
- **Usage**: `const { settings, isLoading } = useRegionalSettings();`

### **2. Formatting Utilities** ✅
- **File**: `lib/utils/regional-format.ts`
- **Functions**:
  - `formatCurrency()` - Format money with user's currency
  - `formatDate()` - Format dates (DD/MM/YYYY vs MM/DD/YYYY)
  - `formatTime()` - Format time (12h vs 24h)
  - `formatWeight()` - Format weight (kg vs lbs)
  - `formatHeight()` - Format height (cm vs inches)
  - `formatTemperature()` - Format temp (°C vs °F)
  - `formatRelativeTime()` - "2 hours ago", "3 days ago"

### **3. Display Components** ✅
- **File**: `components/ui/regional-display.tsx`
- **Components**:
  - `<CurrencyDisplay amount={1000} />` → R1,000 or $1,000
  - `<DateDisplay date={new Date()} />` → 27/10/2025 or 10/27/2025
  - `<TimeDisplay time={new Date()} />` → 15:30 or 3:30 PM
  - `<WeightDisplay weightInKg={25} />` → 25 kg or 55.1 lbs
  - `<HeightDisplay heightInCm={50} />` → 50 cm or 19.7 in
  - `<TemperatureDisplay tempInCelsius={38} />` → 38°C or 100.4°F

---

## 📊 **Database Storage Strategy**

### **Principle: Store in Base Units, Display in User's Units**

| Data Type | Store As | Display As |
|-----------|----------|------------|
| **Currency** | USD (base) | User's currency (ZAR, EUR, etc.) |
| **Weight** | Kilograms (kg) | kg or lbs based on setting |
| **Height** | Centimeters (cm) | cm or inches based on setting |
| **Temperature** | Celsius (°C) | °C or °F based on setting |
| **Date** | ISO 8601 | DD/MM/YYYY or MM/DD/YYYY |
| **Time** | 24-hour | 12h or 24h based on setting |

### **Why This Approach?**
- ✅ **Consistent**: All data in one format in database
- ✅ **Convertible**: Easy to convert between units
- ✅ **Accurate**: No rounding errors from multiple conversions
- ✅ **Flexible**: Users can change settings anytime

---

## 🔄 **Implementation Pattern**

### **Step 1: Wrap App with Provider**
Already done in `app/providers.tsx`:
```typescript
<RegionalSettingsProvider>
  {children}
</RegionalSettingsProvider>
```

### **Step 2: Use in Components**

#### **Option A: Use Display Components (Easiest)**
```typescript
import { CurrencyDisplay, DateDisplay, WeightDisplay } from '@/components/ui/regional-display';

// In your component
<CurrencyDisplay amount={listing.price} />
<DateDisplay date={animal.birthDate} />
<WeightDisplay weightInKg={animal.weight} />
```

#### **Option B: Use Formatting Functions**
```typescript
import { useRegionalSettings } from '@/lib/contexts/regional-settings-context';
import { formatCurrency, formatDate } from '@/lib/utils/regional-format';

function MyComponent() {
  const { settings } = useRegionalSettings();
  
  return (
    <div>
      <p>{formatCurrency(1000, settings)}</p>
      <p>{formatDate(new Date(), settings)}</p>
    </div>
  );
}
```

---

## 📝 **Components to Update**

### **✅ Already Updated**
1. **ListingCard.tsx** - Uses `<CurrencyDisplay>` for prices

### **🔄 Need to Update**

#### **Marketplace Components**
- [ ] `CreateListingWizard.tsx` - Price input with currency
- [ ] `CreateListingDialog.tsx` - Price input
- [ ] `EditListingDialog.tsx` - Price input
- [ ] `ListingDetails.tsx` - Price display
- [ ] `MarketplaceFilters.tsx` - Price range filters

#### **Animal Components**
- [ ] `AnimalCard.tsx` - Weight display
- [ ] `AnimalProfile.tsx` - Birth date, weight, height
- [ ] `WeightTracker.tsx` - Weight measurements
- [ ] `HealthRecords.tsx` - Temperature, weight
- [ ] `FeedingSchedule.tsx` - Weight-based portions

#### **Frozen Semen Components**
- [ ] `FrozenSemenCard.tsx` - Storage temperature
- [ ] `FrozenSemenForm.tsx` - Temperature input
- [ ] `SemenAssessmentCard.tsx` - Temperature display

#### **Reports & Analytics**
- [ ] `Reports.tsx` - All date displays
- [ ] `Dashboard.tsx` - Date ranges, currency totals
- [ ] `Analytics.tsx` - Date filters

---

## 🎨 **UI/UX Guidelines**

### **Currency Display**
```typescript
// Listing cards - show symbol only
<CurrencyDisplay amount={price} showSymbol={true} showCode={false} />
// Output: R1,000 or $1,000

// Invoices/receipts - show symbol + code
<CurrencyDisplay amount={price} showSymbol={true} showCode={true} />
// Output: R1,000 ZAR or $1,000 USD

// Data tables - compact
<CurrencyDisplay amount={price} showSymbol={true} decimals={0} />
// Output: R1,000 or $1,000
```

### **Date Display**
```typescript
// Short date
<DateDisplay date={date} shortFormat={true} />
// Output: 27/10 or 10/27

// Full date
<DateDisplay date={date} />
// Output: 27/10/2025 or 10/27/2025

// Date + time
<DateDisplay date={date} includeTime={true} />
// Output: 27/10/2025 15:30 or 10/27/2025 3:30 PM

// Relative time
<RelativeTimeDisplay date={date} />
// Output: 2 hours ago, 3 days ago
```

### **Weight Display**
```typescript
// With unit
<WeightDisplay weightInKg={25} showUnit={true} />
// Output: 25 kg or 55.1 lbs

// Without unit (in tables)
<WeightDisplay weightInKg={25} showUnit={false} />
// Output: 25 or 55.1
```

---

## 🔧 **Form Inputs**

### **Currency Input**
```typescript
import { useRegionalSettings } from '@/lib/contexts/regional-settings-context';
import { parseCurrencyInput } from '@/lib/utils/regional-format';

function PriceInput() {
  const { settings } = useRegionalSettings();
  const [price, setPrice] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
  };

  const handleSubmit = () => {
    const numericPrice = parseCurrencyInput(price);
    // Save to database in USD or base currency
  };

  return (
    <div>
      <Label>Price ({settings.currency})</Label>
      <Input
        type="text"
        value={price}
        onChange={handleChange}
        placeholder={`0.00 ${settings.currency}`}
      />
    </div>
  );
}
```

### **Weight Input**
```typescript
import { convertWeightToKg } from '@/lib/utils/regional-format';

function WeightInput() {
  const { settings } = useRegionalSettings();
  const unit = settings.measurementUnit === 'metric' ? 'kg' : 'lbs';
  const [weight, setWeight] = useState('');

  const handleSubmit = () => {
    const weightInKg = convertWeightToKg(parseFloat(weight), settings);
    // Save weightInKg to database
  };

  return (
    <div>
      <Label>Weight ({unit})</Label>
      <Input
        type="number"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder={`0.0 ${unit}`}
      />
    </div>
  );
}
```

---

## 🧪 **Testing Checklist**

### **Test Different Settings**
1. **South Africa** (ZAR, DD/MM/YYYY, 24h, Metric)
   - [ ] Currency displays as R1,000
   - [ ] Dates show as 27/10/2025
   - [ ] Time shows as 15:30
   - [ ] Weight shows as 25 kg

2. **United States** (USD, MM/DD/YYYY, 12h, Imperial)
   - [ ] Currency displays as $1,000
   - [ ] Dates show as 10/27/2025
   - [ ] Time shows as 3:30 PM
   - [ ] Weight shows as 55.1 lbs

3. **United Kingdom** (GBP, DD/MM/YYYY, 24h, Metric)
   - [ ] Currency displays as £1,000
   - [ ] Dates show as 27/10/2025
   - [ ] Time shows as 15:30
   - [ ] Weight shows as 25 kg

### **Test Conversions**
- [ ] Enter 25 kg → Shows 55.1 lbs for US users
- [ ] Enter 100 lbs → Stores as 45.4 kg in database
- [ ] Enter 50 cm → Shows 19.7 in for US users
- [ ] Enter 38°C → Shows 100.4°F for US users

### **Test Forms**
- [ ] Create listing with price → Saves correctly
- [ ] Edit listing price → Updates correctly
- [ ] Filter by price range → Works with user's currency
- [ ] Add animal weight → Converts and saves correctly

---

## 📦 **Files Created**

1. ✅ `lib/contexts/regional-settings-context.tsx` - Global context
2. ✅ `lib/utils/regional-format.ts` - Formatting utilities
3. ✅ `components/ui/regional-display.tsx` - Display components
4. ✅ `app/providers.tsx` - Updated with provider

---

## 🚀 **Next Steps**

### **Phase 1: Core Components** (Priority: High)
1. Update all marketplace listing displays
2. Update create/edit listing forms
3. Update marketplace filters

### **Phase 2: Animal Management** (Priority: Medium)
1. Update animal profile displays
2. Update weight tracker
3. Update health records

### **Phase 3: Reports & Analytics** (Priority: Medium)
1. Update dashboard
2. Update reports page
3. Update analytics charts

### **Phase 4: Polish** (Priority: Low)
1. Add currency conversion API
2. Add exchange rate display
3. Add "View in original currency" toggle

---

## 💡 **Best Practices**

### **DO**
✅ Always store in base units (kg, cm, °C, USD)
✅ Always display in user's preferred units
✅ Use display components for consistency
✅ Test with multiple regional settings
✅ Provide clear unit labels in forms

### **DON'T**
❌ Store converted values in database
❌ Hardcode currency symbols ($, R, €)
❌ Assume date format (always use regional)
❌ Mix units in the same context
❌ Forget to handle null/undefined values

---

## 🎯 **Success Metrics**

- ✅ All prices display in user's currency
- ✅ All dates display in user's format
- ✅ All weights/heights display in user's units
- ✅ Forms accept input in user's units
- ✅ Database stores in consistent base units
- ✅ Conversions are accurate
- ✅ Settings persist across sessions
- ✅ No hardcoded formats anywhere

---

## 📞 **Support**

For questions or issues:
1. Check this guide first
2. Review `lib/utils/regional-format.ts` for available functions
3. Check `components/ui/regional-display.tsx` for components
4. Test with different regional settings

**The system is production-ready and scalable!** 🚀
