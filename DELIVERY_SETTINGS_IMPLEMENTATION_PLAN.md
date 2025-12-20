# Delivery & Shipping Settings - Implementation Plan

**Date:** December 20, 2024  
**Feature:** Breeder Delivery & Shipping Configuration  
**Status:** 📋 Planning Phase

---

## 🎯 Overview

Enable breeders to configure their delivery and shipping preferences, pricing, and policies. This ensures:
- ✅ Transparent delivery costs for buyers
- ✅ Flexible delivery options per breeder
- ✅ Professional shipping management
- ✅ Compliance with health/age requirements
- ✅ Better buyer experience

---

## 📊 Current State vs Desired State

### **Current State** ❌
- Delivery methods exist (pickup, delivery, shipping)
- NO delivery pricing
- NO breeder preferences
- NO shipping configuration
- Buyers don't know costs upfront
- Manual coordination required

### **Desired State** ✅
- Breeders configure delivery settings once
- Automatic delivery fee calculation
- Clear delivery options in checkout
- Per-listing overrides available
- Zone-based pricing (optional)
- Professional delivery management

---

## 🗄️ Database Schema

### **Tables Created:**

#### 1. `breeder_delivery_settings`
**Purpose:** Main delivery configuration per breeder

**Key Fields:**
```typescript
{
  // Options
  offersPickup: boolean,
  offersLocalDelivery: boolean,
  offersShipping: boolean,
  
  // Pickup
  pickupLocation: string,
  pickupInstructions: string,
  pickupAvailability: json,
  
  // Local Delivery
  localDeliveryFee: number, // cents
  localDeliveryRadius: number, // km
  localDeliveryFeePerKm: number,
  
  // Shipping
  shippingMethod: 'flat_rate' | 'calculated' | 'free' | 'quote',
  shippingFee: number,
  shipsToCountries: string[],
  preferredCarriers: json[],
  
  // Requirements
  minimumAgeForDelivery: number, // weeks
  requiresHealthCertificate: boolean,
  requiresVetCheckBeforeDelivery: boolean,
  
  // Policies
  deliveryPolicy: text,
  healthGuaranteeDays: number,
}
```

#### 2. `listing_delivery_overrides`
**Purpose:** Custom delivery terms for specific listings

**Key Fields:**
```typescript
{
  listingId: uuid,
  customLocalDeliveryFee: number,
  customShippingFee: number,
  deliveryIncluded: boolean,
  pickupOnly: boolean,
  specialDeliveryNotes: string,
}
```

#### 3. `delivery_zones` (Optional)
**Purpose:** Complex zone-based pricing

**Key Fields:**
```typescript
{
  zoneName: string,
  zoneType: 'radius' | 'states' | 'countries',
  deliveryFee: number,
  estimatedDays: number,
}
```

#### 4. `delivery_fee_calculations`
**Purpose:** Audit trail for delivery fee calculations

**Key Fields:**
```typescript
{
  purchaseId: uuid,
  deliveryMethod: string,
  baseFee: number,
  distanceFee: number,
  totalFee: number,
  calculationMethod: string,
}
```

---

## 🎨 User Interface

### **1. Breeder Settings Page**
**Route:** `/settings/delivery`

**Sections:**

#### **A. Delivery Options**
```
☑ Offer Pickup
☑ Offer Local Delivery  
☑ Offer Shipping
```

#### **B. Pickup Settings**
```
Pickup Location: [Address/Description]
Instructions: [Textarea]
Availability:
  Days: ☑ Mon ☑ Tue ☑ Wed ☑ Thu ☑ Fri ☐ Sat ☐ Sun
  Time Slots: [09:00-12:00] [14:00-18:00]
  Advance Notice: [24] hours
```

#### **C. Local Delivery Settings**
```
Delivery Fee: $[50.00]
Delivery Radius: [50] km
Fee Per Additional KM: $[2.00] (optional)
Minimum Order: $[500.00] (optional)
Estimated Days: [1-2] days
Notes: [Textarea]
```

#### **D. Shipping Settings**
```
Shipping Method: 
  ○ Flat Rate
  ○ Calculated (coming soon)
  ○ Free Shipping
  ○ Contact for Quote

Domestic Shipping Fee: $[100.00]
International Shipping Fee: $[250.00]

Ships To:
  ☑ United States
  ☑ Canada
  ☐ United Kingdom
  ☐ Australia
  [+ Add Country]

Preferred Carriers:
  [FedEx] [Express] ☑ Tracking
  [+ Add Carrier]

☑ Include Insurance ($10.00)
Estimated Delivery: [3-5] business days
```

#### **E. Requirements & Restrictions**
```
Minimum Age for Delivery: [8] weeks
☑ Requires Health Certificate
☑ Requires Vet Check Before Delivery
☑ Requires Vaccination Proof
☑ Requires Adult Signature

Temperature Restrictions:
  Min: [10]°C  Max: [30]°C
  Restricted Months: ☑ Jun ☑ Jul ☑ Aug
```

#### **F. Packaging & Handling**
```
Packaging Fee: $[25.00] (optional)
Description: [IATA-approved pet carrier included]

Includes:
  ☑ Food (3 days supply)
  ☑ Toys
  ☑ Blanket with mother's scent
  ☑ Health records
```

#### **G. Policies**
```
Delivery Policy: [Rich Text Editor]
Health Guarantee: [7] days
Genetic Guarantee: [2] years
```

### **2. Listing Creation/Edit - Delivery Override**
**Section in listing form:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Delivery Settings (Optional Override)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

☐ Use custom delivery settings for this listing

[If checked, show:]
  ☐ Pickup Only
  ☐ Local Delivery Only
  ☐ Free Delivery Included
  ☐ Free Shipping Included
  
  Custom Local Delivery Fee: $[___]
  Custom Shipping Fee: $[___]
  
  Special Notes: [Textarea]
```

### **3. Checkout Dialog Enhancement**

**Current:**
```
Delivery Method:
  ○ Pickup
  ○ Delivery
  ○ Shipping
```

**Enhanced:**
```
Delivery Method:
  ○ Pickup - FREE
    📍 123 Main St, City, State
    ℹ️ Available Mon-Fri, 9AM-5PM
    
  ○ Local Delivery - $50.00
    🚗 Within 50km radius
    ⏱️ 1-2 business days
    ℹ️ We'll contact you to schedule
    
  ○ Shipping - $100.00
    📦 FedEx Express with tracking
    ⏱️ 3-5 business days
    ℹ️ Insurance included

Price Breakdown:
  Item Price:        $1,500.00
  Platform Fee:         $75.00
  Delivery Fee:         $50.00  ← NEW
  ─────────────────────────────
  Total:            $1,625.00
```

---

## 🔌 API Endpoints

### **Settings Management**

#### `GET /api/breeder/delivery-settings`
**Description:** Get breeder's delivery settings  
**Response:**
```json
{
  "success": true,
  "settings": {
    "id": "uuid",
    "breederId": "user_id",
    "offersPickup": true,
    "offersLocalDelivery": true,
    "offersShipping": false,
    "localDeliveryFee": 5000,
    "localDeliveryRadius": 50,
    // ... all settings
  }
}
```

#### `POST /api/breeder/delivery-settings`
**Description:** Create/update delivery settings  
**Body:**
```json
{
  "offersPickup": true,
  "pickupLocation": "123 Main St",
  "localDeliveryFee": 5000,
  // ... all settings
}
```

#### `GET /api/listings/[id]/delivery-options`
**Description:** Get available delivery options for a listing  
**Response:**
```json
{
  "success": true,
  "options": [
    {
      "method": "pickup",
      "available": true,
      "fee": 0,
      "label": "Pickup",
      "description": "Pick up from breeder's location",
      "location": "123 Main St, City",
      "estimatedDays": 0
    },
    {
      "method": "delivery",
      "available": true,
      "fee": 5000,
      "label": "Local Delivery",
      "description": "Within 50km radius",
      "estimatedDays": 1
    },
    {
      "method": "shipping",
      "available": false,
      "reason": "Breeder does not offer shipping"
    }
  ]
}
```

#### `POST /api/purchases/calculate-delivery-fee`
**Description:** Calculate delivery fee for a purchase  
**Body:**
```json
{
  "listingId": "uuid",
  "deliveryMethod": "delivery",
  "destinationAddress": "456 Oak Ave",
  "destinationCity": "City",
  "destinationState": "State",
  "destinationPostalCode": "12345",
  "destinationCountry": "USA"
}
```
**Response:**
```json
{
  "success": true,
  "calculation": {
    "deliveryMethod": "delivery",
    "baseFee": 5000,
    "distanceFee": 1000,
    "packagingFee": 2500,
    "insuranceFee": 1000,
    "totalFee": 9500,
    "distance": 35,
    "estimatedDays": 1,
    "breakdown": "Base $50 + Distance (35km × $2) $10 + Packaging $25 + Insurance $10"
  }
}
```

---

## 🔄 Integration Points

### **1. Purchase Creation Flow**

**Current:**
```typescript
// app/api/purchases/route.ts
const totalAmount = purchasePrice + platformFee;
```

**Enhanced:**
```typescript
// Calculate delivery fee
const deliveryFee = await calculateDeliveryFee({
  listingId,
  deliveryMethod,
  destination: {
    address: deliveryAddress,
    city: deliveryCity,
    state: deliveryState,
    postalCode: deliveryPostalCode,
    country: deliveryCountry,
  }
});

const totalAmount = purchasePrice + platformFee + deliveryFee;

// Store delivery fee in purchase
await db.insert(purchases).values({
  // ... existing fields
  deliveryFee,
  deliveryFeeBreakdown: deliveryFee.breakdown,
});
```

### **2. Checkout Dialog**

**Current:**
```typescript
// Fetch platform fee
const response = await fetch(`/api/purchases/calculate-fee?amount=${listing.price}`);
```

**Enhanced:**
```typescript
// Fetch delivery options
const deliveryOptions = await fetch(`/api/listings/${listing.id}/delivery-options`);

// When delivery method changes
const handleDeliveryMethodChange = async (method) => {
  setDeliveryMethod(method);
  
  if (method !== 'pickup') {
    // Calculate delivery fee
    const feeResponse = await fetch('/api/purchases/calculate-delivery-fee', {
      method: 'POST',
      body: JSON.stringify({
        listingId: listing.id,
        deliveryMethod: method,
        destination: deliveryAddress,
      }),
    });
    const { calculation } = await feeResponse.json();
    setDeliveryFee(calculation.totalFee);
  } else {
    setDeliveryFee(0);
  }
};

// Update total
const totalAmount = listing.price + platformFee + deliveryFee;
```

### **3. Listing Display**

**Marketplace listing card:**
```typescript
<Card>
  <CardContent>
    <h3>{listing.title}</h3>
    <p className="text-2xl font-bold">${listing.price / 100}</p>
    
    {/* NEW: Delivery info */}
    <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
      {listing.offersPickup && <Badge variant="outline">Pickup Available</Badge>}
      {listing.offersLocalDelivery && <Badge variant="outline">Local Delivery</Badge>}
      {listing.offersShipping && <Badge variant="outline">Ships Nationwide</Badge>}
    </div>
  </CardContent>
</Card>
```

---

## 📋 Implementation Phases

### **Phase 1: Database & Core API** (Week 1)
- [x] Create database schema
- [ ] Run migrations
- [ ] Create API endpoints:
  - [ ] GET/POST `/api/breeder/delivery-settings`
  - [ ] GET `/api/listings/[id]/delivery-options`
  - [ ] POST `/api/purchases/calculate-delivery-fee`
- [ ] Create delivery fee calculation service
- [ ] Add deliveryFee field to purchases table

### **Phase 2: Settings UI** (Week 1-2)
- [ ] Create `/settings/delivery` page
- [ ] Build delivery settings form components:
  - [ ] Delivery options toggles
  - [ ] Pickup settings form
  - [ ] Local delivery form
  - [ ] Shipping configuration form
  - [ ] Requirements & restrictions
  - [ ] Policies editor
- [ ] Form validation
- [ ] Save/update functionality
- [ ] Preview mode

### **Phase 3: Checkout Integration** (Week 2)
- [ ] Enhance CheckoutDialog:
  - [ ] Fetch delivery options
  - [ ] Display delivery methods with fees
  - [ ] Real-time delivery fee calculation
  - [ ] Update total price dynamically
  - [ ] Show delivery details/restrictions
- [ ] Update purchase creation to include delivery fee
- [ ] Store delivery fee calculation history

### **Phase 4: Listing Integration** (Week 2-3)
- [ ] Add delivery override section to listing form
- [ ] Display delivery badges on listing cards
- [ ] Show delivery options on listing detail page
- [ ] Add delivery info to listing search filters

### **Phase 5: Purchase Management** (Week 3)
- [ ] Display delivery fee in purchase details
- [ ] Show delivery method & tracking
- [ ] Delivery status updates
- [ ] Delivery confirmation workflow

### **Phase 6: Advanced Features** (Week 4+)
- [ ] Zone-based pricing
- [ ] Distance calculation (Google Maps API)
- [ ] Shipping carrier integration
- [ ] Tracking number integration
- [ ] Delivery scheduling calendar
- [ ] Automated delivery notifications

---

## 🧪 Testing Checklist

### **Settings**
- [ ] Breeder can create delivery settings
- [ ] Breeder can update settings
- [ ] Settings persist correctly
- [ ] Validation works (fees, radius, etc.)
- [ ] Default values applied

### **Delivery Options**
- [ ] Correct options shown based on breeder settings
- [ ] Per-listing overrides work
- [ ] Fees calculated correctly
- [ ] Distance-based fees accurate
- [ ] Zone-based fees accurate (if implemented)

### **Checkout**
- [ ] Delivery options display correctly
- [ ] Fees update when method changes
- [ ] Total price includes delivery fee
- [ ] Address validation works
- [ ] Out-of-range addresses handled

### **Purchase Flow**
- [ ] Delivery fee stored in purchase
- [ ] Calculation history recorded
- [ ] Purchase details show delivery info
- [ ] Seller sees delivery method
- [ ] Buyer sees delivery status

---

## 🔒 Security & Validation

### **Input Validation**
```typescript
// Delivery fee limits
const MAX_DELIVERY_FEE = 100000; // $1,000
const MAX_SHIPPING_FEE = 500000; // $5,000
const MAX_RADIUS = 500; // km

// Validate settings
if (localDeliveryFee > MAX_DELIVERY_FEE) {
  throw new Error('Delivery fee too high');
}

if (localDeliveryRadius > MAX_RADIUS) {
  throw new Error('Delivery radius too large');
}
```

### **Authorization**
```typescript
// Only breeder can update their settings
if (session.user.role !== 'breeder') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}

// Only breeder can update their own settings
if (settings.breederId !== session.user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### **Data Integrity**
```typescript
// Ensure at least one delivery method enabled
if (!offersPickup && !offersLocalDelivery && !offersShipping) {
  throw new Error('At least one delivery method must be enabled');
}

// Validate fee consistency
if (offersLocalDelivery && !localDeliveryFee) {
  localDeliveryFee = 0; // Default to free
}
```

---

## 💰 Pricing Examples

### **Example 1: Simple Flat Rate**
```
Breeder Settings:
  - Local Delivery: $50 flat
  - Shipping: $100 flat

Buyer Checkout:
  Item: $1,500
  Platform Fee: $75 (5%)
  Delivery: $50 (local delivery selected)
  ─────────────
  Total: $1,625
```

### **Example 2: Distance-Based**
```
Breeder Settings:
  - Base Fee: $30
  - Per KM: $2
  - Radius: 50km

Buyer Checkout (25km away):
  Item: $1,500
  Platform Fee: $75
  Delivery: $80 ($30 base + 25km × $2)
  ─────────────
  Total: $1,655
```

### **Example 3: Zone-Based**
```
Breeder Zones:
  - Local (0-25km): $30
  - Regional (26-100km): $60
  - State-wide: $100

Buyer Checkout (40km away):
  Item: $1,500
  Platform Fee: $75
  Delivery: $60 (Regional zone)
  ─────────────
  Total: $1,635
```

---

## 📈 Future Enhancements

### **Phase 2 Features**
1. **Real-time Distance Calculation**
   - Google Maps Distance Matrix API
   - Accurate driving distance
   - Traffic-aware estimates

2. **Carrier Integration**
   - FedEx API
   - UPS API
   - USPS API
   - Real-time rate quotes
   - Automatic label generation

3. **Delivery Scheduling**
   - Calendar integration
   - Available time slots
   - Automated reminders
   - Rescheduling

4. **Tracking Integration**
   - Real-time tracking updates
   - SMS/email notifications
   - Delivery confirmation photos
   - Signature capture

5. **Advanced Pricing**
   - Weight-based fees
   - Size-based fees
   - Multi-animal discounts
   - Seasonal pricing

---

## 🎯 Success Metrics

### **Adoption**
- % of breeders with delivery settings configured
- % of listings with delivery options
- % of purchases using delivery/shipping

### **Revenue**
- Average delivery fee
- Total delivery fee revenue
- Delivery fee vs item price ratio

### **User Experience**
- Checkout completion rate
- Delivery-related support tickets
- Buyer satisfaction with delivery
- Delivery dispute rate

### **Operational**
- Average delivery time
- On-time delivery rate
- Delivery issue resolution time

---

## 📞 Support & Documentation

### **Breeder Guide**
- How to set up delivery settings
- Pricing strategies
- Best practices for local delivery
- Shipping guidelines
- Health certificate requirements

### **Buyer Guide**
- Understanding delivery options
- How delivery fees are calculated
- What to expect during delivery
- Pickup instructions
- Tracking your delivery

---

**End of Implementation Plan**

**Next Steps:**
1. Review and approve schema
2. Run database migrations
3. Begin Phase 1 implementation
4. Create settings UI mockups
5. Test with pilot breeders
