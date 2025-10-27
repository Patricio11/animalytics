# Currency Display Behavior - Explained

## 🎯 **How It Works**

### **Each Listing Shows in the OWNER's Currency**

When you view the marketplace, you'll see listings in **different currencies** because they're from **different breeders** around the world.

---

## 📊 **Example Marketplace View**

```
┌──────────────────────────┐
│ Listing 1                │
│ R15,000 ZAR             │ ← South African breeder
│ Cape Town, SA            │
└──────────────────────────┘

┌──────────────────────────┐
│ Listing 2                │
│ $2,000 USD              │ ← American breeder
│ New York, USA            │
└──────────────────────────┘

┌──────────────────────────┐
│ Listing 3                │
│ $2,000 AUD              │ ← Australian breeder
│ Melbourne, AUS           │
└──────────────────────────┘

┌──────────────────────────┐
│ Listing 4                │
│ £1,500 GBP              │ ← British breeder
│ London, UK               │
└──────────────────────────┘
```

---

## ✅ **This is CORRECT Behavior**

### **Why?**
1. **Accuracy** - Shows actual price seller wants
2. **No Confusion** - Buyer knows exact amount to pay
3. **No Conversion Errors** - No misleading exchange rates
4. **International** - Supports global marketplace

---

## 🔄 **Your Listings vs Others' Listings**

### **When YOU Create a Listing**:
- Your regional setting: **ZAR**
- Your listing shows: **R5,000 ZAR**
- Everyone sees: **R5,000 ZAR** ✅

### **When You View OTHERS' Listings**:
- Their regional setting: **USD**
- Their listing shows: **$1,000 USD**
- You see: **$1,000 USD** ✅

---

## 🧪 **Test Scenario**

### **Setup**:
- **You**: South Africa, ZAR setting
- **Other Breeder**: Australia, AUD setting

### **You Create Listing**:
```
Your listing:
Price: 5000
Currency: ZAR (from your settings)

Saved to database:
{ price: 5000, currency: 'ZAR' }

Everyone sees:
R5,000 ZAR
```

### **You View Their Listing**:
```
Their listing:
Price: 2000
Currency: AUD (from their settings)

Saved in database:
{ price: 2000, currency: 'AUD' }

You see:
$2,000 AUD
```

---

## 📝 **Mock Data Explanation**

The demo listings in the marketplace are **mock data** representing different breeders:

- Some have `currency: 'ZAR'` (South African breeders)
- Some have `currency: 'AUD'` (Australian breeders)
- Some have `currency: 'USD'` (American breeders)

This is **intentional** to show a realistic international marketplace.

---

## 🎯 **Key Points**

1. **Your Settings** → Only affect **YOUR new listings**
2. **Others' Settings** → Affect **THEIR listings**
3. **Viewing Listings** → See each in **owner's currency**
4. **No Conversion** → Prices shown as-is

---

## 🔮 **Future: Currency Conversion (Phase 2)**

Later, we'll add an **optional** conversion feature:

```
┌──────────────────────────┐
│ Listing                  │
│ $2,000 AUD              │ ← Owner's currency
│                          │
│ ≈ R22,000 ZAR           │ ← Your currency (estimated)
│ [View in my currency]    │ ← Toggle button
└──────────────────────────┘
```

But for now: **Show original currency only** ✅

---

## ✅ **Verification**

### **Check Your Listings**:
1. Go to marketplace
2. Find listings YOU created
3. Should show: **R[amount] ZAR**

### **Check Others' Listings**:
1. Go to marketplace
2. Find demo/mock listings
3. Will show: **$[amount] AUD** or **$[amount] USD**

### **This is CORRECT!** ✅

---

## 💡 **Summary**

- ✅ **Your listings** → Show in **ZAR** (your currency)
- ✅ **Others' listings** → Show in **their currency** (AUD, USD, GBP, etc.)
- ✅ **No automatic conversion** → Accurate and transparent
- ✅ **International marketplace** → Supports global breeders

**The system is working exactly as designed!** 🌍💰
