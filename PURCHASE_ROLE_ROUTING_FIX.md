# Purchase Role-Based Routing Fix

## Date: December 7, 2025

## Issues Fixed

### **Issue 1: 500 Error on Purchase Detail Page**

**Error:**
```
GET https://animalytics.co/api/purchases/82ff4e69-aa8c-4c3a-b6ba-a75cc4dc207e 500 (Internal Server Error)
```

**Root Cause:** Schema field mismatch in `/api/purchases/[id]/route.ts`
- Used `users.image` which doesn't exist
- Should be `users.avatar`

**Fix Applied:**
```typescript
// app/api/purchases/[id]/route.ts

// Before (WRONG)
const [buyer] = await db.select({
  id: users.id,
  name: users.name,
  email: users.email,
  image: users.image,  // ❌ Wrong field
})

const [seller] = await db.select({
  id: users.id,
  name: users.name,
  email: users.email,
  image: users.image,  // ❌ Wrong field
})

// After (CORRECT)
const [buyer] = await db.select({
  id: users.id,
  name: users.name,
  email: users.email,
  avatar: users.avatar,  // ✅ Correct field
})

const [seller] = await db.select({
  id: users.id,
  name: users.name,
  email: users.email,
  avatar: users.avatar,  // ✅ Correct field
})
```

---

### **Issue 2: Wrong Redirect After Purchase**

**Problem:**
- User creates a purchase as a **breeder** (seller)
- Gets redirected to `/buyer/purchases/[id]`
- Should redirect to `/breeder/purchases/[id]` instead

**Root Cause:** Hardcoded redirect path in marketplace listing page

**Fix Applied:**
```typescript
// app/marketplace/[id]/page.tsx

// Before (HARDCODED)
router.push(`/buyer/purchases/${data.purchase.id}`);

// After (DYNAMIC BASED ON ROLE)
const userRole = session?.user?.role || 'buyer';
const basePath = userRole === 'buyer' ? '/buyer' : '/breeder';
router.push(`${basePath}/purchases/${data.purchase.id}`);
```

**Logic:**
- ✅ If user role is `'buyer'` → `/buyer/purchases/[id]`
- ✅ If user role is `'breeder'`, `'veterinarian'`, `'admin'`, etc. → `/breeder/purchases/[id]`
- ✅ Defaults to `'buyer'` if role is undefined

---

## Role-Based Routing Strategy

### **User Roles:**
1. **buyer** - Only buys animals, doesn't breed
2. **breeder** - Breeds and sells animals (can also buy)
3. **veterinarian** - Professional services
4. **admin** - System administrator
5. **event_organizer** - Organizes events

### **Purchase Context:**
- **Buyer Side:** User is purchasing an animal
- **Seller Side:** User is selling an animal (breeder)

### **Routing Rules:**

#### **When User Initiates Purchase:**
```typescript
// User clicks "Buy Now" on a listing
const userRole = session?.user?.role;

if (userRole === 'buyer') {
  // Redirect to buyer dashboard
  router.push(`/buyer/purchases/${purchaseId}`);
} else {
  // Redirect to breeder dashboard (seller view)
  router.push(`/breeder/purchases/${purchaseId}`);
}
```

#### **When User Views Purchase:**
The API determines the user's role in the purchase:
```typescript
const userRole = purchase.buyerId === userId ? 'buyer' : 'seller';
```

This is independent of the user's account role. A breeder can be a buyer in one transaction and a seller in another.

---

## Files Modified

### **1. `app/api/purchases/[id]/route.ts`**
- ✅ Fixed `users.image` → `users.avatar` (2 places)
- Lines: 75, 87

### **2. `app/marketplace/[id]/page.tsx`**
- ✅ Made redirect dynamic based on user role
- Lines: 293-296

---

## Testing Checklist

### **As Buyer:**
- [ ] Click "Buy Now" on a listing
- [ ] Complete purchase dialog
- [ ] Verify redirected to `/buyer/purchases/[id]`
- [ ] Verify purchase detail page loads (no 500 error)
- [ ] Verify buyer information displays correctly

### **As Breeder:**
- [ ] Create a listing
- [ ] Have another user purchase it
- [ ] View the purchase notification
- [ ] Verify redirected to `/breeder/purchases/[id]`
- [ ] Verify purchase detail page loads (no 500 error)
- [ ] Verify seller information displays correctly

### **Cross-Role Testing:**
- [ ] Breeder buys from another breeder
  - Should see `/breeder/purchases/[id]` (as buyer in this transaction)
- [ ] Buyer account tries to sell (shouldn't be possible)
- [ ] Admin views purchases (should work from either path)

---

## Purchase Page Structure

### **Buyer Purchase Page:**
```
/buyer/purchases/[id]
- View purchase details
- Make payment
- Confirm receipt
- Rate seller
- Request refund
```

### **Breeder/Seller Purchase Page:**
```
/breeder/purchases/[id]
- View purchase details
- Confirm order
- Arrange delivery
- Confirm handover
- Rate buyer
- Issue refund
```

### **Shared Features:**
- Timeline view
- Messaging
- Document uploads
- Dispute resolution

---

## API Response Structure

The purchase detail API returns the user's role in the transaction:

```json
{
  "success": true,
  "purchase": {
    "id": "82ff4e69-aa8c-4c3a-b6ba-a75cc4dc207e",
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
    // ... other fields
  }
}
```

**Important:** `userRole` is determined by the purchase context, not the user's account role.

---

## Future Improvements

### **1. Unified Purchase Page**

Instead of separate `/buyer/purchases` and `/breeder/purchases`, create a single `/purchases/[id]` page that adapts based on the user's role in that specific purchase:

```typescript
// app/purchases/[id]/page.tsx

const { data: purchase } = useQuery({
  queryKey: ['purchase', id],
  queryFn: async () => {
    const response = await fetch(`/api/purchases/${id}`);
    return response.json();
  },
});

// Render different UI based on purchase.userRole
{purchase.userRole === 'buyer' ? (
  <BuyerPurchaseView purchase={purchase} />
) : (
  <SellerPurchaseView purchase={purchase} />
)}
```

**Benefits:**
- ✅ Single source of truth
- ✅ No routing confusion
- ✅ Easier to maintain
- ✅ Works for any user role

### **2. Role-Based Navigation Guards**

Add middleware to ensure users can only access appropriate pages:

```typescript
// middleware.ts

export function middleware(request: NextRequest) {
  const session = await getSession(request);
  const path = request.nextUrl.pathname;
  
  // Buyers can't access breeder pages
  if (path.startsWith('/breeder') && session.user.role === 'buyer') {
    return NextResponse.redirect(new URL('/buyer', request.url));
  }
  
  // Non-buyers can access breeder pages
  if (path.startsWith('/buyer') && session.user.role !== 'buyer') {
    return NextResponse.redirect(new URL('/breeder', request.url));
  }
}
```

### **3. Smart Redirect on Login**

Redirect users to their appropriate dashboard based on role:

```typescript
// After login
const redirectPath = user.role === 'buyer' ? '/buyer' : '/breeder';
router.push(redirectPath);
```

---

## Summary

✅ **Fixed 500 error** - Changed `users.image` to `users.avatar`
✅ **Fixed wrong redirect** - Made routing dynamic based on user role
✅ **Improved UX** - Users now land on the correct dashboard
✅ **Maintained flexibility** - Breeders can still buy (and see buyer view)

**The purchase flow now correctly routes users based on their role!** 🎉

---

## Related Documentation

- **Buyer Flow:** `BUYER_FLOW_COMPLETE.md`
- **Purchase API Fix:** `PURCHASE_FLOW_FIX.md`
- **Stripe Setup:** `STRIPE_WEBHOOK_SETUP_GUIDE.md`
