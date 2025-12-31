# Purchase Flow Implementation Plan

**Date:** December 18, 2024  
**Status:** 🚧 Planning

---

## 📋 Current State

### ✅ What Exists
1. **Purchase Database Schema** (`lib/db/schema/purchases.ts`)
   - Comprehensive purchase tracking
   - Payment methods: wallet, stripe, paypal, bank_transfer, cash
   - Delivery methods: pickup, delivery, shipping, meet_halfway
   - Status flow: pending → payment_pending → payment_completed → confirmed → preparing → ready_for_pickup → in_transit → completed
   - Escrow integration
   - Document management
   - Timeline tracking

2. **Purchase API** (`app/api/purchases/route.ts`)
   - GET: Fetch user's purchases (as buyer or seller)
   - Includes listing and animal details
   - Role-based filtering

3. **Messaging System**
   - Conversations with listing context
   - Real-time messaging
   - Notifications

4. **Marketplace Listings**
   - Listing details with price
   - Categories and descriptions
   - Seller information

### ❌ What's Missing
1. **"Buy Now" / "Purchase" button in conversation**
2. **Purchase initiation from conversation**
3. **Checkout dialog/page**
4. **Payment method selection**
5. **Delivery method selection**
6. **Order confirmation**
7. **Payment processing integration**
8. **Purchase tracking UI**

---

## 🎯 User Flow Design

### Current Flow (Broken)
```
1. User browses marketplace
   ↓
2. User clicks "Send Message"
   ↓
3. User sends message to seller
   ↓
4. ❌ STUCK - No way to purchase!
```

### Desired Flow
```
1. User browses marketplace
   ↓
2. User clicks "Send Message" OR "Buy Now"
   ↓
3. If "Send Message":
   - Opens conversation
   - Shows listing details in sidebar
   - Shows "Buy Now" button
   ↓
4. User clicks "Buy Now"
   ↓
5. Opens checkout dialog:
   - Listing details
   - Price breakdown
   - Payment method selection
   - Delivery method selection
   - Delivery address (if needed)
   - Terms & conditions
   ↓
6. User confirms purchase
   ↓
7. Payment processing:
   - If wallet: Deduct from wallet
   - If stripe: Redirect to Stripe
   - If paypal: Redirect to PayPal
   - If bank_transfer: Show bank details
   - If cash: Mark as pending
   ↓
8. Purchase created:
   - Status: payment_pending or payment_completed
   - Notification sent to seller
   - Buyer redirected to purchase details
   ↓
9. Seller confirms:
   - Status: confirmed → preparing → ready_for_pickup
   ↓
10. Handover:
    - Buyer confirms receipt
    - Seller confirms handover
    - Status: completed
    - Funds released (if escrow)
```

---

## 🔧 Implementation Plan

### Phase 1: Conversation UI Enhancement
**Files to Modify:**
- `app/buyer/messages/[id]/page.tsx`
- `app/(breeder)/messages/[id]/page.tsx`

**Changes:**
1. Add listing sidebar/card in conversation
2. Show listing details (title, price, image)
3. Add "Buy Now" button (only for buyer)
4. Add "View Listing" link

---

### Phase 2: Checkout Dialog Component
**New File:** `components/marketplace/CheckoutDialog.tsx`

**Features:**
1. Listing summary
2. Price breakdown:
   - Item price
   - Platform fee (if any)
   - Total
3. Payment method selector:
   - Wallet (show balance)
   - Credit Card (Stripe)
   - PayPal
   - Bank Transfer
   - Cash on Delivery
4. Delivery method selector:
   - Pickup (show seller location)
   - Delivery (enter address)
   - Shipping (enter address)
   - Meet Halfway (coordinate location)
5. Delivery address form (conditional)
6. Schedule pickup/delivery date
7. Terms & conditions checkbox
8. "Confirm Purchase" button

---

### Phase 3: Purchase Creation API
**File:** `app/api/purchases/route.ts`

**Add POST endpoint:**
```typescript
POST /api/purchases
Body: {
  listingId: string;
  animalId?: string;
  paymentMethod: 'wallet' | 'stripe' | 'paypal' | 'bank_transfer' | 'cash';
  deliveryMethod: 'pickup' | 'delivery' | 'shipping' | 'meet_halfway';
  deliveryAddress?: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  scheduledDate?: string;
  scheduledTime?: string;
  buyerNotes?: string;
}

Response: {
  purchaseId: string;
  status: string;
  paymentUrl?: string; // For Stripe/PayPal redirect
}
```

**Logic:**
1. Validate listing exists and is available
2. Get listing price and seller
3. Calculate platform fee (e.g., 5%)
4. Create purchase record
5. If wallet payment:
   - Check wallet balance
   - Create escrow transaction
   - Mark payment as completed
6. If stripe/paypal:
   - Create payment intent
   - Return payment URL
7. If bank_transfer/cash:
   - Mark as payment_pending
8. Create timeline entry
9. Send notification to seller
10. Return purchase details

---

### Phase 4: Payment Processing

#### Wallet Payment
**File:** `app/api/purchases/[id]/pay-with-wallet/route.ts`

**Logic:**
1. Check wallet balance
2. Create escrow transaction
3. Deduct from buyer's wallet
4. Update purchase status
5. Send notifications

#### Stripe Integration
**File:** `app/api/purchases/[id]/create-payment-intent/route.ts`

**Logic:**
1. Create Stripe payment intent
2. Return client secret
3. Handle webhook for payment confirmation

#### PayPal Integration
**File:** `app/api/purchases/[id]/create-paypal-order/route.ts`

**Logic:**
1. Create PayPal order
2. Return order ID
3. Handle webhook for payment confirmation

---

### Phase 5: Purchase Details Page
**New File:** `app/buyer/purchases/[id]/page.tsx`

**Features:**
1. Purchase summary
2. Status timeline
3. Listing details
4. Seller information
5. Payment details
6. Delivery details
7. Action buttons:
   - "Contact Seller" (link to conversation)
   - "Confirm Receipt" (when ready)
   - "Report Issue" (if problems)
   - "Leave Review" (when completed)
8. Document uploads (health certificates, etc.)

---

### Phase 6: Seller Purchase Management
**File:** `app/(breeder)/sales/page.tsx` (already exists)

**Enhancements:**
1. Show pending purchases
2. Action buttons:
   - "Confirm Purchase"
   - "Mark as Preparing"
   - "Mark as Ready"
   - "Confirm Handover"
   - "Contact Buyer"
3. Upload documents
4. Update status

---

## 📊 Database Schema Review

### Purchases Table (Already Exists)
```sql
purchases {
  id: uuid
  listingId: uuid
  animalId: uuid
  buyerId: text
  sellerId: text
  purchasePrice: integer (cents)
  currency: text
  platformFee: integer (cents)
  totalAmount: integer (cents)
  paymentMethod: enum
  paymentStatus: text
  deliveryMethod: enum
  deliveryAddress: text
  status: enum
  ...
}
```

**Status Flow:**
1. `pending` - Purchase initiated
2. `payment_pending` - Awaiting payment
3. `payment_completed` - Payment successful
4. `confirmed` - Seller confirmed
5. `preparing` - Animal being prepared
6. `ready_for_pickup` - Ready for buyer
7. `in_transit` - Being delivered
8. `completed` - Successfully completed
9. `cancelled` - Cancelled
10. `refunded` - Payment refunded
11. `disputed` - Under dispute

---

## 🎨 UI Components Needed

### 1. Listing Card in Conversation
```tsx
<Card>
  <CardHeader>
    <h3>About this listing</h3>
  </CardHeader>
  <CardContent>
    <img src={listing.image} />
    <h4>{listing.title}</h4>
    <p className="text-2xl">${listing.price}</p>
    <Badge>{listing.category}</Badge>
    <Button>Buy Now</Button>
    <Button variant="outline">View Listing</Button>
  </CardContent>
</Card>
```

### 2. Checkout Dialog
```tsx
<Dialog>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Complete Your Purchase</DialogTitle>
    </DialogHeader>
    
    {/* Listing Summary */}
    <div className="listing-summary">...</div>
    
    {/* Price Breakdown */}
    <div className="price-breakdown">
      <div>Item Price: ${price}</div>
      <div>Platform Fee: ${fee}</div>
      <div className="total">Total: ${total}</div>
    </div>
    
    {/* Payment Method */}
    <RadioGroup>
      <RadioGroupItem value="wallet">Wallet</RadioGroupItem>
      <RadioGroupItem value="stripe">Credit Card</RadioGroupItem>
      <RadioGroupItem value="paypal">PayPal</RadioGroupItem>
    </RadioGroup>
    
    {/* Delivery Method */}
    <RadioGroup>
      <RadioGroupItem value="pickup">Pickup</RadioGroupItem>
      <RadioGroupItem value="delivery">Delivery</RadioGroupItem>
    </RadioGroup>
    
    {/* Delivery Address (if needed) */}
    {deliveryMethod !== 'pickup' && <AddressForm />}
    
    {/* Schedule */}
    <DatePicker />
    <TimePicker />
    
    {/* Terms */}
    <Checkbox>I agree to terms</Checkbox>
    
    <Button>Confirm Purchase</Button>
  </DialogContent>
</Dialog>
```

### 3. Purchase Status Badge
```tsx
<Badge variant={getStatusVariant(status)}>
  {getStatusLabel(status)}
</Badge>
```

### 4. Purchase Timeline
```tsx
<div className="timeline">
  {timeline.map(event => (
    <div className="timeline-item">
      <div className="icon">{getEventIcon(event.type)}</div>
      <div className="content">
        <h4>{event.title}</h4>
        <p>{event.description}</p>
        <span>{formatDate(event.createdAt)}</span>
      </div>
    </div>
  ))}
</div>
```

---

## 🔐 Security Considerations

1. **Authorization:**
   - Only buyer can initiate purchase
   - Only seller can confirm/update status
   - Only buyer can confirm receipt

2. **Payment Validation:**
   - Verify wallet balance before deduction
   - Validate Stripe/PayPal webhooks
   - Prevent duplicate payments

3. **Listing Validation:**
   - Check listing is still available
   - Verify price hasn't changed
   - Ensure seller is still active

4. **Escrow Protection:**
   - Hold funds in escrow until completion
   - Auto-release after buyer confirmation
   - Support dispute resolution

---

## 📱 Notifications

### Buyer Notifications
1. Purchase confirmed
2. Seller confirmed order
3. Animal ready for pickup
4. Delivery in transit
5. Handover completed
6. Payment released

### Seller Notifications
1. New purchase received
2. Payment completed
3. Buyer confirmed receipt
4. Review submitted

---

## 🧪 Testing Checklist

### Happy Path
- [ ] Browse listing
- [ ] Send message
- [ ] Click "Buy Now" in conversation
- [ ] Select payment method
- [ ] Select delivery method
- [ ] Complete purchase
- [ ] Seller confirms
- [ ] Buyer confirms receipt
- [ ] Purchase completed

### Edge Cases
- [ ] Insufficient wallet balance
- [ ] Listing no longer available
- [ ] Payment fails
- [ ] Buyer cancels before payment
- [ ] Seller cancels after payment (refund)
- [ ] Dispute opened
- [ ] Multiple purchases of same listing

---

## 🚀 Implementation Priority

### Phase 1 (Critical - Do First)
1. ✅ Add listing card to conversation
2. ✅ Add "Buy Now" button
3. ✅ Create checkout dialog component
4. ✅ Implement purchase creation API (POST)
5. ✅ Basic wallet payment

### Phase 2 (Important)
1. Purchase details page
2. Seller purchase management
3. Status updates
4. Notifications

### Phase 3 (Enhanced)
1. Stripe integration
2. PayPal integration
3. Document uploads
4. Reviews

### Phase 4 (Advanced)
1. Escrow auto-release
2. Dispute resolution
3. Refund processing
4. Analytics

---

## 📝 Next Steps

1. **Immediate:** Add listing card and "Buy Now" button to conversation
2. **Today:** Create checkout dialog component
3. **Today:** Implement purchase creation API
4. **Tomorrow:** Payment processing
5. **This Week:** Purchase tracking and management

---

**End of Document**
