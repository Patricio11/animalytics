# Buyer & Breeder Complete Separation

## Date: December 7, 2025

## Overview

Complete separation of buyer and breeder purchase flows with proper routing, pages, and links throughout the application.

---

## Route Structure

### **Buyer Routes** (under `/buyer/` prefix)
```
/buyer/purchases              → List of purchases (as buyer)
/buyer/purchases/[id]         → Purchase detail (buyer view)
/buyer/dashboard              → Buyer dashboard
/buyer/saved                  → Saved listings
/buyer/messages               → Messages
```

### **Breeder Routes** (under route group `(breeder)` - no prefix in URL)
```
/purchases                    → List of purchases/sales (as seller)
/purchases/[id]               → Purchase detail (seller view)
/dashboard                    → Breeder dashboard
/sales                        → Sales management
/animals                      → Animal management
/messages                     → Messages
```

**Important:** The `(breeder)` folder is a Next.js route group, so URLs don't include `/breeder/` - they're at the root level.

---

## Files Created/Modified

### **1. Created Breeder Purchase Detail Page**
**File:** `app/(breeder)/purchases/[id]/page.tsx`

**Purpose:** Seller's view of a purchase transaction

**Key Differences from Buyer View:**
- Back button goes to `/purchases` (not `/buyer/purchases`)
- Shows "Message Buyer" (not "Message Seller")
- Seller-specific actions (confirm order, arrange delivery, etc.)
- Links to `/messages` (not `/buyer/messages`)

---

### **2. Updated Breeder Purchases List**
**File:** `app/(breeder)/purchases/page.tsx`

**Changes:**
```typescript
// Before
<Link href={`/buyer/purchases/${purchase.id}`}>

// After
<Link href={`/purchases/${purchase.id}`}>
```

---

### **3. Updated Breeder Sales Page**
**File:** `app/(breeder)/sales/page.tsx`

**Changes:**
```typescript
// Before
<Link href={`/buyer/purchases/${sale.id}`}>

// After
<Link href={`/purchases/${sale.id}`}>
```

---

### **4. Updated Marketplace Redirect**
**File:** `app/marketplace/[id]/page.tsx`

**Changes:**
```typescript
// Before (hardcoded to buyer)
router.push(`/buyer/purchases/${data.purchase.id}`);

// After (dynamic based on role)
const userRole = (session?.user as any)?.role || 'buyer';
const purchasePath = userRole === 'buyer' 
  ? `/buyer/purchases/${data.purchase.id}` 
  : `/purchases/${data.purchase.id}`;
router.push(purchasePath);
```

**Logic:**
- ✅ Buyer role → `/buyer/purchases/[id]`
- ✅ Breeder/other roles → `/purchases/[id]`
- ✅ Default (no role) → `/buyer/purchases/[id]`

---

### **5. Fixed API Schema Issues**
**Files:**
- `app/api/purchases/route.ts`
- `app/api/purchases/[id]/route.ts`
- `app/api/marketplace/saved/route.ts`

**Changes:**
- ✅ `users.image` → `users.avatar`
- ✅ `animals.breed` → `animals.breedId`
- ✅ Removed `animals.primaryPhotoUrl` (doesn't exist)
- ✅ Fixed `breeds` import path
- ✅ Made `paymentMethod` optional with default

---

## URL Mapping

### **For Buyers:**
| Action | URL |
|--------|-----|
| View purchases | `/buyer/purchases` |
| View purchase detail | `/buyer/purchases/[id]` |
| View dashboard | `/buyer/dashboard` |
| View saved listings | `/buyer/saved` |
| View messages | `/buyer/messages` |

### **For Breeders:**
| Action | URL |
|--------|-----|
| View purchases/sales | `/purchases` |
| View purchase detail | `/purchases/[id]` |
| View dashboard | `/dashboard` |
| View sales | `/sales` |
| View animals | `/animals` |
| View messages | `/messages` |

---

## User Flow Examples

### **Buyer Purchases an Animal:**

1. **Browse marketplace** → `/marketplace`
2. **Click listing** → `/marketplace/[id]`
3. **Click "Buy Now"** → Purchase dialog opens
4. **Confirm purchase** → Redirects to `/buyer/purchases/[id]`
5. **View purchase details** → Buyer-specific view
6. **Make payment** → Payment flow
7. **Confirm receipt** → Complete transaction

### **Breeder Sells an Animal:**

1. **Create listing** → `/marketplace/create`
2. **Buyer purchases** → Notification received
3. **View purchase** → `/purchases/[id]`
4. **Confirm order** → Update status
5. **Arrange delivery** → Coordinate with buyer
6. **Confirm handover** → Complete transaction

### **Breeder Buys from Another Breeder:**

1. **Browse marketplace** → `/marketplace`
2. **Click listing** → `/marketplace/[id]`
3. **Click "Buy Now"** → Purchase dialog opens
4. **Confirm purchase** → Redirects to `/purchases/[id]` (as buyer in this transaction)
5. **View purchase details** → Buyer-specific view (even though user is a breeder)

**Note:** The view shown depends on the user's role in that specific transaction, not their account role.

---

## Page Differences

### **Buyer Purchase Detail Page**
**Location:** `/buyer/purchases/[id]/page.tsx`

**Features:**
- ✅ View purchase status
- ✅ Make payment
- ✅ Track delivery
- ✅ Confirm receipt
- ✅ Rate seller
- ✅ Request refund
- ✅ Message seller
- ✅ View timeline
- ✅ Upload documents

**Navigation:**
- Back button → `/buyer/purchases`
- Messages → `/buyer/messages`

---

### **Breeder Purchase Detail Page**
**Location:** `/(breeder)/purchases/[id]/page.tsx`

**Features:**
- ✅ View purchase status
- ✅ Confirm order
- ✅ Arrange delivery
- ✅ Confirm handover
- ✅ Rate buyer
- ✅ Issue refund
- ✅ Message buyer
- ✅ View timeline
- ✅ Upload documents

**Navigation:**
- Back button → `/purchases`
- Messages → `/messages`

---

## API Response Structure

The purchase detail API returns the user's role in the transaction:

```json
{
  "success": true,
  "purchase": {
    "id": "...",
    "status": "pending",
    "userRole": "buyer",  // or "seller"
    "buyer": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://..."
    },
    "seller": {
      "id": "...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "avatar": "https://..."
    },
    "listing": { ... },
    "animal": { ... },
    "timeline": [ ... ],
    "documents": [ ... ]
  }
}
```

**Important:** The API determines `userRole` based on the purchase context:
- If `purchase.buyerId === userId` → `userRole = 'buyer'`
- If `purchase.sellerId === userId` → `userRole = 'seller'`

This is independent of the user's account role.

---

## Testing Checklist

### **As Buyer:**
- [ ] Navigate to `/buyer/purchases`
- [ ] Click on a purchase
- [ ] Verify URL is `/buyer/purchases/[id]`
- [ ] Verify "Message Seller" button exists
- [ ] Click back button → Returns to `/buyer/purchases`
- [ ] Click "Message Seller" → Goes to `/buyer/messages`

### **As Breeder:**
- [ ] Navigate to `/purchases`
- [ ] Click on a purchase
- [ ] Verify URL is `/purchases/[id]`
- [ ] Verify "Message Buyer" button exists
- [ ] Click back button → Returns to `/purchases`
- [ ] Click "Message Buyer" → Goes to `/messages`

### **As Breeder Buying:**
- [ ] Go to marketplace
- [ ] Click "Buy Now" on a listing
- [ ] Complete purchase
- [ ] Verify redirected to `/purchases/[id]`
- [ ] Verify buyer-specific view is shown

### **Cross-Links:**
- [ ] Sales page → Click "View Details" → Goes to `/purchases/[id]`
- [ ] Dashboard → Click purchase → Goes to correct path based on role
- [ ] Marketplace → Complete purchase → Redirects to correct path

---

## Common Issues & Solutions

### **Issue: Breeder redirected to `/buyer/purchases/[id]`**

**Cause:** Hardcoded redirect in marketplace or other pages

**Solution:** Check for hardcoded `/buyer/purchases/` links and make them dynamic:
```typescript
const userRole = (session?.user as any)?.role || 'buyer';
const path = userRole === 'buyer' ? `/buyer/purchases/${id}` : `/purchases/${id}`;
```

---

### **Issue: 404 on `/purchases/[id]` for breeders**

**Cause:** Missing `(breeder)/purchases/[id]/page.tsx` file

**Solution:** Ensure the file exists and is properly configured

---

### **Issue: Wrong user shown (buyer vs seller)**

**Cause:** API not correctly determining `userRole`

**Solution:** Check API logic:
```typescript
const userRole = purchase.buyerId === userId ? 'buyer' : 'seller';
```

---

## Future Improvements

### **1. Unified Purchase Page**

Create a single `/purchases/[id]` page that adapts based on the user's role in that transaction:

```typescript
// app/purchases/[id]/page.tsx

const { userRole } = purchase;

return (
  <>
    {userRole === 'buyer' ? (
      <BuyerPurchaseView purchase={purchase} />
    ) : (
      <SellerPurchaseView purchase={purchase} />
    )}
  </>
);
```

**Benefits:**
- ✅ Single source of truth
- ✅ No routing confusion
- ✅ Easier maintenance
- ✅ Works for any user role

---

### **2. Role-Based Middleware**

Add middleware to enforce role-based access:

```typescript
// middleware.ts

if (path.startsWith('/buyer') && session.user.role !== 'buyer') {
  return NextResponse.redirect('/purchases');
}

if (path.startsWith('/purchases') && session.user.role === 'buyer') {
  return NextResponse.redirect('/buyer/purchases');
}
```

---

### **3. Smart Dashboard Redirect**

Redirect users to their appropriate dashboard on login:

```typescript
const dashboardPath = user.role === 'buyer' ? '/buyer/dashboard' : '/dashboard';
router.push(dashboardPath);
```

---

## Summary

✅ **Created** breeder purchase detail page at `(breeder)/purchases/[id]/page.tsx`
✅ **Fixed** all hardcoded `/buyer/purchases/` links in breeder pages
✅ **Updated** marketplace redirect to be role-based
✅ **Fixed** API schema issues (users.avatar, animals.breedId, etc.)
✅ **Separated** buyer and breeder purchase flows completely
✅ **Maintained** flexibility for breeders to buy (and see buyer view)

**The buyer and breeder flows are now completely separated!** 🎉

---

## Quick Reference

### **URL Patterns:**

**Buyers:**
- List: `/buyer/purchases`
- Detail: `/buyer/purchases/[id]`

**Breeders:**
- List: `/purchases`
- Detail: `/purchases/[id]`

### **File Locations:**

**Buyer Pages:**
- `app/buyer/purchases/page.tsx`
- `app/buyer/purchases/[id]/page.tsx`

**Breeder Pages:**
- `app/(breeder)/purchases/page.tsx`
- `app/(breeder)/purchases/[id]/page.tsx`

### **Redirect Logic:**

```typescript
const userRole = (session?.user as any)?.role || 'buyer';
const path = userRole === 'buyer' 
  ? `/buyer/purchases/${id}` 
  : `/purchases/${id}`;
```

---

## Related Documentation

- **Purchase Flow Fix:** `PURCHASE_FLOW_FIX.md`
- **Role-Based Routing:** `PURCHASE_ROLE_ROUTING_FIX.md`
- **Buyer Flow:** `BUYER_FLOW_COMPLETE.md`
- **Stripe Setup:** `STRIPE_WEBHOOK_SETUP_GUIDE.md`
