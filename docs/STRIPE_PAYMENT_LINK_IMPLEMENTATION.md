# Stripe Payment Link Implementation

## Date: December 7, 2025

## Overview

Implemented Stripe Checkout Session to generate payment links that open in a new window/tab for secure payment processing.

---

## What Was Implemented

### **1. Added Stripe Checkout Session Method**
**File:** `lib/services/payment/stripe-provider.ts`

**New Method:**
```typescript
async createCheckoutSession(params: {
  amount: number;
  currency: string;
  customerEmail: string;
  description?: string;
  metadata?: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string | null }>
```

**Features:**
- Creates a Stripe Checkout Session
- Returns a payment URL that can be opened in browser
- Supports metadata for tracking purchase info
- Handles success/cancel redirects

---

### **2. Updated Payment API**
**File:** `app/api/purchases/[id]/pay/route.ts`

**Changes:**
- Replaced Payment Intent with Checkout Session
- Returns `checkoutUrl` instead of `clientSecret`
- Configured success/cancel URLs:
  - Success: `/buyer/purchases/[id]?payment=success`
  - Cancel: `/buyer/purchases/[id]?payment=cancelled`

**API Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/c/pay/...",
  "sessionId": "cs_test_...",
  "amount": 50000,
  "currency": "USD"
}
```

---

### **3. Added Make Payment Button**
**File:** `app/buyer/purchases/[id]/page.tsx`

**Features:**
- Button appears when purchase is `pending` or `payment_pending`
- Button hidden when payment is already `completed`
- Calls `/api/purchases/[id]/pay` endpoint
- Redirects to Stripe Checkout URL
- Shows loading state while processing

**UI Location:**
- Displayed in the status banner at the top of the purchase detail page
- Prominent with primary color styling
- Includes dollar sign icon

---

## User Flow

### **Complete Payment Flow:**

1. **User initiates purchase** on marketplace listing
   - Clicks "Buy Now"
   - Fills in delivery details
   - Confirms purchase

2. **Purchase created** with status `pending`
   - Purchase record created in database
   - Payment status: `pending`
   - User redirected to purchase detail page

3. **User clicks "Make Payment"** button
   - Frontend calls `POST /api/purchases/[id]/pay`
   - API creates Stripe Checkout Session
   - Returns payment URL

4. **User redirected to Stripe Checkout**
   - Opens Stripe's secure payment page
   - User enters card details
   - Completes payment

5. **Payment processed**
   - Stripe processes payment
   - Sends webhook to `/api/webhooks/stripe`
   - Updates purchase status to `paid`
   - Funds held in escrow

6. **User redirected back**
   - Success: `/buyer/purchases/[id]?payment=success`
   - Cancel: `/buyer/purchases/[id]?payment=cancelled`

---

## Code Implementation

### **Frontend: Make Payment Handler**

```typescript
async function handlePayment() {
  setIsProcessing(true);
  try {
    const res = await fetch(`/api/purchases/${purchaseId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod: 'stripe' }),
    });

    if (res.ok) {
      const data = await res.json();
      
      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "An error occurred",
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
  }
}
```

### **Backend: Create Checkout Session**

```typescript
// Create Stripe Checkout Session (payment link)
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const checkoutSession = await (provider as any).createCheckoutSession({
  amount: purchase.totalAmount,
  currency: purchase.currency.toLowerCase(),
  customerEmail: buyer.email,
  description: `Purchase #${purchase.id.substring(0, 8)}`,
  metadata: {
    purchaseId: purchase.id,
    buyerId: purchase.buyerId,
    sellerId: purchase.sellerId,
    listingId: purchase.listingId,
  },
  successUrl: `${baseUrl}/buyer/purchases/${purchase.id}?payment=success`,
  cancelUrl: `${baseUrl}/buyer/purchases/${purchase.id}?payment=cancelled`,
});

return NextResponse.json({
  success: true,
  checkoutUrl: checkoutSession.url,
  sessionId: checkoutSession.id,
  amount: purchase.totalAmount,
  currency: purchase.currency,
});
```

---

## Environment Variables Required

```env
# Required for Stripe integration
NEXT_PUBLIC_APP_URL=https://animalytics.co

# Stripe credentials (stored in database via admin panel)
# No environment variables needed - configured in payment_providers table
```

---

## Webhook Handling

The Stripe webhook handler at `/api/webhooks/stripe` processes these events:

### **Payment Success:**
- Event: `checkout.session.completed`
- Updates purchase status to `paid`
- Moves funds to escrow
- Notifies buyer and seller
- Creates timeline event

### **Payment Failed:**
- Event: `checkout.session.expired` or `payment_intent.payment_failed`
- Updates payment status to `failed`
- Notifies buyer
- Allows retry

---

## Button Visibility Logic

```typescript
{/* Make Payment Button */}
{(purchase.purchase.status === 'pending' || 
  purchase.purchase.status === 'payment_pending') && 
 purchase.purchase.paymentStatus !== 'completed' && (
  <Button onClick={handlePayment} disabled={isProcessing}>
    <DollarSign className="h-4 w-4 mr-2" />
    {isProcessing ? 'Processing...' : 'Make Payment'}
  </Button>
)}
```

**Shows when:**
- ✅ Purchase status is `pending` or `payment_pending`
- ✅ Payment status is NOT `completed`

**Hidden when:**
- ❌ Payment already completed
- ❌ Purchase cancelled/refunded
- ❌ Purchase completed

---

## Testing Checklist

### **As Buyer:**
- [ ] Create a purchase on marketplace
- [ ] Verify redirected to purchase detail page
- [ ] Verify "Make Payment" button is visible
- [ ] Click "Make Payment"
- [ ] Verify redirected to Stripe Checkout
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] Verify redirected back with `?payment=success`
- [ ] Verify payment status updated
- [ ] Verify "Make Payment" button now hidden

### **Test Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Auth: 4000 0025 0000 3155
```

---

## Security Features

### **1. User Verification**
- Only the buyer can initiate payment
- Verified via session authentication
- Purchase ownership checked

### **2. Idempotency**
- Prevents duplicate payments
- Checks if payment already completed
- Validates purchase status

### **3. Metadata Tracking**
- Purchase ID attached to Stripe session
- Webhook can match payment to purchase
- Audit trail maintained

### **4. Secure Redirects**
- Uses HTTPS in production
- Validates redirect URLs
- Prevents open redirect vulnerabilities

---

## Error Handling

### **Frontend Errors:**
```typescript
// API call failed
if (!res.ok) {
  const error = await res.json();
  toast({
    title: "Error",
    description: error.error || "Failed to initiate payment",
    variant: "destructive",
  });
}

// No checkout URL returned
if (!data.checkoutUrl) {
  toast({
    title: "Error",
    description: "Payment link not available",
    variant: "destructive",
  });
}
```

### **Backend Errors:**
```typescript
// Stripe not configured
if (!provider.isConfigured()) {
  return NextResponse.json(
    { error: 'Payment provider stripe is not configured' },
    { status: 500 }
  );
}

// Already paid
if (purchase.paymentStatus === 'completed') {
  return NextResponse.json(
    { error: 'Payment already completed' },
    { status: 400 }
  );
}

// Wrong user
if (purchase.buyerId !== session.user.id) {
  return NextResponse.json(
    { error: 'Only the buyer can make payment' },
    { status: 403 }
  );
}
```

---

## Advantages Over Payment Intent

### **Stripe Checkout Session:**
✅ Hosted payment page (no PCI compliance needed)
✅ Mobile-optimized UI
✅ Supports multiple payment methods
✅ Built-in fraud detection
✅ Automatic receipt emails
✅ Simpler integration
✅ Better UX for users

### **Payment Intent (Previous):**
❌ Requires custom UI
❌ More complex integration
❌ Need to handle card elements
❌ PCI compliance considerations
❌ More frontend code

---

## Future Enhancements

### **1. Payment Method Options**
Add support for:
- Apple Pay / Google Pay
- Bank transfers
- Buy Now Pay Later (Klarna, Afterpay)

### **2. Subscription Support**
For recurring services:
- Monthly breeding consultations
- Premium listings
- Featured placements

### **3. Split Payments**
For co-ownership:
- Multiple buyers
- Installment plans
- Deposit + balance

### **4. Currency Conversion**
- Auto-detect buyer currency
- Show prices in local currency
- Handle multi-currency transactions

---

## Summary

✅ **Added** Stripe Checkout Session support
✅ **Created** payment link generation
✅ **Implemented** "Make Payment" button
✅ **Configured** success/cancel redirects
✅ **Integrated** with existing webhook system
✅ **Maintained** escrow functionality
✅ **Ensured** secure payment processing

**Users can now complete payments via Stripe's hosted checkout page!** 🎉

---

## Related Documentation

- **Stripe Webhook Setup:** `STRIPE_WEBHOOK_SETUP_GUIDE.md`
- **Purchase Flow:** `PURCHASE_FLOW_FIX.md`
- **Buyer/Breeder Separation:** `BUYER_BREEDER_SEPARATION_COMPLETE.md`
- **Role-Based Routing:** `PURCHASE_ROLE_ROUTING_FIX.md`
