# Currency Display Strategy

## 🎯 **Core Principle**

**Each listing displays in the OWNER's currency, NOT the viewer's currency.**

---

## ✅ **Correct Behavior**

### **Example Scenario**

**User A** (South Africa):
- Regional setting: **ZAR**
- Creates listing: **R5,000 ZAR**

**User B** (United States):
- Regional setting: **USD**
- Views User A's listing: Sees **R5,000 ZAR** (not converted)

**User C** (United Kingdom):
- Regional setting: **GBP**
- Views User A's listing: Sees **R5,000 ZAR** (not converted)

---

## 🏗️ **Implementation**

### **1. Database Schema**

```typescript
interface MarketplaceListing {
  price: number;        // e.g., 5000
  currency: string;     // e.g., "ZAR" (owner's currency)
  // ... other fields
}
```

### **2. Creating a Listing**

When user creates listing:
```typescript
const listingData = {
  price: 5000,
  currency: settings.currency, // Owner's current currency (ZAR, USD, etc.)
};
```

### **3. Displaying a Listing**

Show listing in **owner's currency**:
```typescript
// ListingCard.tsx
<div>
  {CURRENCIES[listing.currency]?.symbol}
  {listing.price.toLocaleString()} {listing.currency}
</div>

// Output: R5,000 ZAR or $1,000 USD
```

---

## 📊 **Display Format**

### **Listing Cards**
```
R5,000 ZAR
$1,000 USD
£800 GBP
€900 EUR
```

### **Listing Details**
```
Price: R5,000 ZAR
Price: $1,000 USD
```

### **Create Listing Form**
```
Label: "Price (ZAR)" ← User's current currency
Input: 5000
Saved: { price: 5000, currency: "ZAR" }
```

---

## 🔄 **Future: Currency Conversion**

### **Phase 2 Implementation** (Later)

Add optional conversion toggle:

```typescript
// Future feature
<div>
  <div className="text-2xl font-bold">
    R5,000 ZAR
  </div>
  
  {showConversion && (
    <div className="text-sm text-muted-foreground">
      ≈ $280 USD (estimated)
      <Button size="sm" variant="ghost">
        View in my currency
      </Button>
    </div>
  )}
</div>
```

### **Conversion Features** (Future)
- [ ] Exchange rate API integration
- [ ] "View in my currency" toggle
- [ ] Conversion disclaimer
- [ ] Last updated timestamp
- [ ] Multiple currency display option

---

## 🎨 **UI Examples**

### **Marketplace Grid View**

```
┌─────────────────────────┐
│ [Image]                 │
│ Golden Retriever Stud   │
│ R5,000 ZAR             │ ← Owner's currency
│ Cape Town, SA           │
└─────────────────────────┘

┌─────────────────────────┐
│ [Image]                 │
│ Labrador Puppies        │
│ $1,200 USD             │ ← Owner's currency
│ New York, USA           │
└─────────────────────────┘
```

### **Listing Detail Page**

```
Price: R5,000 ZAR

[Future: Toggle conversion]
☐ Show in my currency (USD)
```

---

## 💾 **Database Storage**

### **Listings Table**
```sql
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY,
  price DECIMAL(10,2),
  currency VARCHAR(3),  -- ISO 4217 code (ZAR, USD, GBP, etc.)
  -- ... other fields
);
```

### **Example Records**
```sql
-- User from South Africa
INSERT INTO marketplace_listings VALUES
  ('...', 5000.00, 'ZAR', ...);

-- User from USA
INSERT INTO marketplace_listings VALUES
  ('...', 1000.00, 'USD', ...);

-- User from UK
INSERT INTO marketplace_listings VALUES
  ('...', 800.00, 'GBP', ...);
```

---

## 🧪 **Testing Scenarios**

### **Test 1: Create Listing**
1. User A (ZAR) creates listing with price 5000
2. ✅ Saved as: `{ price: 5000, currency: "ZAR" }`

### **Test 2: View Own Listing**
1. User A (ZAR) views their listing
2. ✅ Sees: **R5,000 ZAR**

### **Test 3: View Other's Listing**
1. User B (USD) views User A's listing
2. ✅ Sees: **R5,000 ZAR** (not converted to USD)

### **Test 4: Change Regional Settings**
1. User B changes currency from USD to EUR
2. User B views User A's listing
3. ✅ Still sees: **R5,000 ZAR** (listing doesn't change)

### **Test 5: Mixed Marketplace**
1. User views marketplace with listings from multiple countries
2. ✅ Sees:
   - Listing 1: **R5,000 ZAR**
   - Listing 2: **$1,000 USD**
   - Listing 3: **£800 GBP**

---

## 📝 **Components Updated**

### **✅ ListingCard.tsx**
```typescript
// Shows listing in owner's currency
{CURRENCIES[listing.currency]?.symbol}
{listing.price.toLocaleString()} {listing.currency}
```

### **✅ CreateListingWizard.tsx**
```typescript
// Saves owner's currency with listing
const listingData = {
  ...formData,
  currency: settings.currency, // Owner's currency
};
```

### **✅ Form Labels**
```typescript
// Shows user's current currency in form
<Label>Price ({settings.currency})</Label>
```

---

## 🎯 **Key Points**

1. **Listing Currency = Owner's Currency**
   - Set when listing is created
   - Never changes (even if owner changes settings later)

2. **Viewer's Currency = Irrelevant**
   - Viewer's regional settings don't affect listing display
   - All viewers see the same currency for each listing

3. **No Automatic Conversion**
   - Prices are NOT converted to viewer's currency
   - Conversion is a future feature (Phase 2)

4. **Clear Currency Labels**
   - Always show currency code (ZAR, USD, GBP)
   - Use currency symbol when available (R, $, £)

---

## 🚀 **Benefits**

✅ **Accurate** - No conversion errors
✅ **Transparent** - Buyers know exact price in seller's currency
✅ **Simple** - No exchange rate API needed yet
✅ **Flexible** - Easy to add conversion later
✅ **International** - Supports global marketplace

---

## 📞 **Summary**

**Current Implementation**:
- ✅ Each listing stores owner's currency
- ✅ All viewers see listing in owner's currency
- ✅ No automatic conversion

**Future Enhancement** (Phase 2):
- [ ] Optional currency conversion
- [ ] Exchange rate API
- [ ] "View in my currency" toggle

**This approach is correct and production-ready!** 🌍💰
