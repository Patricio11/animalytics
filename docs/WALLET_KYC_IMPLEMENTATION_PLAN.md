# Wallet & KYC System Implementation Plan

## 🎯 Overview

A world-class payment system with digital wallets, KYC verification, and professional breeder profiles for international transactions.

---

## 🏗️ Architecture

### Phase 1: Database Schema (IMMEDIATE - Add to Phase 2)

#### 1.1 Wallet Schema
```typescript
// lib/db/schema/wallet.ts

export const wallets = pgTable('wallets', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),

  // Multi-currency balances (stored in cents)
  balances: jsonb('balances').$type<{
    USD: number;
    EUR: number;
    GBP: number;
    ZAR: number;
    BRL: number;
    // ... other currencies
  }>().default({ USD: 0, EUR: 0, GBP: 0, ZAR: 0, BRL: 0 }),

  // Pending/escrow amounts
  pendingBalance: jsonb('pending_balance').$type<Record<string, number>>().default({}),

  // Lifetime statistics
  totalEarnings: bigint('total_earnings', { mode: 'number' }).default(0),
  totalWithdrawals: bigint('total_withdrawals', { mode: 'number' }).default(0),
  totalTransactions: integer('total_transactions').default(0),

  // Status
  status: text('status').notNull().default('active'), // active, suspended, frozen

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  walletId: text('wallet_id').references(() => wallets.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),

  // Transaction details
  type: text('type').notNull(), // deposit, withdrawal, payment, refund, fee, escrow_hold, escrow_release
  status: text('status').notNull(), // pending, completed, failed, cancelled

  // Amounts (in cents)
  amount: bigint('amount', { mode: 'number' }).notNull(),
  currency: text('currency').notNull(),
  fee: bigint('fee', { mode: 'number' }).default(0),

  // Related entities
  relatedListingId: text('related_listing_id'),
  relatedOrderId: text('related_order_id'),
  recipientUserId: text('recipient_user_id').references(() => users.id),

  // Payment gateway info
  paymentMethod: text('payment_method'), // stripe, paypal, bank_transfer, wise
  externalTransactionId: text('external_transaction_id'),

  // Metadata
  description: text('description'),
  metadata: jsonb('metadata'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const payoutRequests = pgTable('payout_requests', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  walletId: text('wallet_id').references(() => wallets.id).notNull(),

  // Payout details
  amount: bigint('amount', { mode: 'number' }).notNull(),
  currency: text('currency').notNull(),
  fee: bigint('fee', { mode: 'number' }).default(0),
  netAmount: bigint('net_amount', { mode: 'number' }).notNull(),

  // Payout method
  method: text('method').notNull(), // bank_transfer, paypal, stripe, wise
  destination: jsonb('destination').$type<{
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
    iban?: string;
    email?: string;
    [key: string]: any;
  }>().notNull(),

  // Status workflow
  status: text('status').notNull().default('pending'), // pending, approved, processing, completed, rejected
  reviewedBy: text('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),

  // Processing info
  processedAt: timestamp('processed_at'),
  externalTransactionId: text('external_transaction_id'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

#### 1.2 KYC Schema
```typescript
// lib/db/schema/kyc.ts

export const kycVerifications = pgTable('kyc_verifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),

  // Verification level
  level: integer('level').notNull().default(0), // 0 = none, 1 = basic, 2 = seller, 3 = professional
  status: text('status').notNull().default('not_started'), // not_started, pending, approved, rejected, expired

  // Personal information
  firstName: text('first_name'),
  lastName: text('last_name'),
  dateOfBirth: date('date_of_birth'),
  nationality: text('nationality'),

  // Contact verification
  phoneNumber: text('phone_number'),
  phoneVerified: boolean('phone_verified').default(false),
  phoneVerifiedAt: timestamp('phone_verified_at'),

  // Address information
  address: jsonb('address').$type<{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>(),

  // Identity documents
  idType: text('id_type'), // passport, drivers_license, national_id
  idNumber: text('id_number'),
  idIssuingCountry: text('id_issuing_country'),
  idExpiryDate: date('id_expiry_date'),

  // Document uploads
  idFrontImage: text('id_front_image'),
  idBackImage: text('id_back_image'),
  selfieImage: text('selfie_image'),
  proofOfAddressImage: text('proof_of_address_image'),

  // Business verification (Level 3)
  businessName: text('business_name'),
  businessType: text('business_type'),
  businessRegistrationNumber: text('business_registration_number'),
  taxId: text('tax_id'),

  // Verification results
  verifiedBy: text('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  rejectionReason: text('rejection_reason'),
  notes: text('notes'),

  // External provider (optional: Stripe Identity, Onfido, etc.)
  externalProvider: text('external_provider'),
  externalVerificationId: text('external_verification_id'),
  externalStatus: text('external_status'),

  // Expiry and renewal
  expiresAt: timestamp('expires_at'),
  lastRenewalDate: timestamp('last_renewal_date'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const kycDocuments = pgTable('kyc_documents', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  verificationId: text('verification_id').references(() => kycVerifications.id),

  // Document details
  type: text('type').notNull(), // id_front, id_back, selfie, address_proof, business_license
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),

  // Status
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  reviewedBy: text('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

#### 1.3 Breeder Profile Schema
```typescript
// lib/db/schema/breeder-profile.ts

export const breederProfiles = pgTable('breeder_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull().unique(),

  // Professional branding
  displayName: text('display_name'),
  slug: text('slug').unique(),
  tagline: text('tagline'),
  bio: text('bio'),
  logoUrl: text('logo_url'),
  bannerUrl: text('banner_url'),

  // Contact preferences
  publicEmail: text('public_email'),
  publicPhone: text('public_phone'),
  website: text('website'),
  socialMedia: jsonb('social_media').$type<{
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  }>(),

  // Business information
  businessName: text('business_name'),
  businessType: text('business_type'), // individual, partnership, company
  registrationNumber: text('registration_number'),
  yearsInBusiness: integer('years_in_business'),

  // Specializations
  primaryBreeds: jsonb('primary_breeds').$type<string[]>(),
  certifications: jsonb('certifications').$type<string[]>(),
  awards: jsonb('awards').$type<string[]>(),

  // Verification & Trust
  kycVerified: boolean('kyc_verified').default(false),
  backgroundCheckVerified: boolean('background_check_verified').default(false),
  healthCertified: boolean('health_certified').default(false),
  premiumMember: boolean('premium_member').default(false),

  // Statistics
  totalSales: integer('total_sales').default(0),
  totalEarnings: bigint('total_earnings', { mode: 'number' }).default(0),
  successfulTransactions: integer('successful_transactions').default(0),

  // Reputation
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  totalReviews: integer('total_reviews').default(0),
  responseRate: integer('response_rate').default(100), // percentage
  responseTime: integer('response_time').default(24), // hours

  // Settings
  acceptsInternationalOrders: boolean('accepts_international_orders').default(true),
  acceptedPaymentMethods: jsonb('accepted_payment_methods').$type<string[]>(),
  returnPolicy: text('return_policy'),
  shippingPolicy: text('shipping_policy'),

  // Visibility
  isPublic: boolean('is_public').default(true),
  isFeatured: boolean('is_featured').default(false),

  // Metadata
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const breederReviews = pgTable('breeder_reviews', {
  id: text('id').primaryKey(),
  breederId: text('breeder_id').references(() => breederProfiles.id).notNull(),
  reviewerId: text('reviewer_id').references(() => users.id).notNull(),
  orderId: text('order_id'), // link to actual transaction

  // Rating (1-5 stars)
  overallRating: integer('overall_rating').notNull(),
  communicationRating: integer('communication_rating'),
  healthRating: integer('health_rating'),
  descriptionAccuracyRating: integer('description_accuracy_rating'),

  // Review content
  title: text('title'),
  comment: text('comment'),
  images: jsonb('images').$type<string[]>(),

  // Moderation
  status: text('status').notNull().default('pending'), // pending, approved, rejected, flagged
  moderatedBy: text('moderated_by').references(() => users.id),
  moderatedAt: timestamp('moderated_at'),

  // Response from breeder
  breederResponse: text('breeder_response'),
  breederRespondedAt: timestamp('breeder_responded_at'),

  // Metadata
  helpful: integer('helpful').default(0),
  notHelpful: integer('not_helpful').default(0),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

---

## 📊 Phase 2: Core Features

### 2.1 Wallet System
- [ ] Create wallet on user signup
- [ ] Display balance dashboard (multi-currency)
- [ ] Transaction history with filters
- [ ] Deposit funds (via payment gateway)
- [ ] Request payout (with fee calculation)
- [ ] Escrow system for marketplace transactions
- [ ] Currency conversion at withdrawal

### 2.2 KYC System
- [ ] 3-level verification workflow
- [ ] Document upload with validation
- [ ] Admin review dashboard
- [ ] Auto-verification via Stripe Identity (optional)
- [ ] Expiry and renewal reminders
- [ ] Verification badges on profiles

### 2.3 Breeder Profile
- [ ] Professional profile page (public URL)
- [ ] Custom branding (logo, banner, colors)
- [ ] Portfolio showcase (animals, litters, achievements)
- [ ] Reviews and ratings system
- [ ] Contact form with spam protection
- [ ] Social proof (verification badges, stats)

---

## 🔧 Technology Stack

### Payment Gateways
- **Stripe Connect** - Primary (supports 135+ currencies)
- **PayPal** - Alternative option
- **Wise (TransferWise)** - International transfers (lower fees)

### KYC Providers (Optional)
- **Stripe Identity** - Automated ID verification
- **Onfido** - Enterprise KYC solution
- **Manual Review** - Admin dashboard (start with this)

### File Storage
- **AWS S3** / **Cloudinary** - Document and image storage
- Encrypted storage for sensitive documents

---

## 🚀 Implementation Priority

### PHASE 2A: Database Models (THIS WEEK)
1. ✅ Create wallet schema
2. ✅ Create transaction schema
3. ✅ Create payout request schema
4. ✅ Create KYC schema
5. ✅ Create breeder profile schema
6. ✅ Run migrations

### PHASE 2B: Core Wallet Features (NEXT)
1. Wallet dashboard UI
2. Transaction history
3. Balance display (multi-currency)
4. Basic deposit/withdrawal flow

### PHASE 2C: KYC System (AFTER WALLET)
1. KYC form UI (3 levels)
2. Document upload
3. Admin review dashboard
4. Verification badges

### PHASE 2D: Breeder Profile (POLISH)
1. Public profile page
2. Profile settings page
3. Reviews system
4. Reputation scores

---

## 💡 Key Features

### Wallet Features
- **Multi-currency balances** - USD, EUR, GBP, ZAR, etc.
- **Escrow protection** - Hold funds until delivery confirmed
- **Auto-payouts** - Schedule withdrawals (weekly, monthly)
- **Fee transparency** - Clear breakdown of platform fees
- **Transaction receipts** - PDF downloads for tax purposes

### KYC Features
- **Level 1 (Basic)**: Email + Phone - Free browsing
- **Level 2 (Seller)**: ID + Address - Sell up to $5K/month
- **Level 3 (Professional)**: Business docs - Unlimited selling
- **Document security** - Encrypted storage, auto-delete after verification
- **Expiry reminders** - Renew documents before expiry

### Breeder Profile Features
- **Custom URL**: animalytics.co/breeders/john-smith-kennels
- **Verification badges**: KYC ✓, Health Certified ✓, Background Check ✓
- **Reputation score**: 5-star rating, response time, success rate
- **Portfolio showcase**: Champion dogs, genetic testing, awards
- **Social proof**: Total sales, years in business, certifications

---

## 🔐 Security & Compliance

### Financial Security
- PCI-DSS compliant payment processing
- Encrypted wallet balances
- 2FA for withdrawals
- Transaction limits for unverified accounts

### Data Privacy
- GDPR compliant (Europe)
- POPIA compliant (South Africa)
- CCPA compliant (California)
- Encrypted document storage
- Right to be forgotten (data deletion)

### Fraud Prevention
- IP tracking for suspicious activity
- Velocity checks (limit rapid transactions)
- Manual review for large payouts
- User reporting system

---

## 📈 Business Model

### Platform Fees
- **Listing fee**: Free for first 5 listings, then $1/month per listing
- **Transaction fee**: 3-5% of sale price (reduces with volume)
- **Payout fee**: $0.25 for domestic, $5 for international
- **Premium features**: Featured listings, verified badges

### Payout Thresholds
- **Minimum withdrawal**: $50 USD equivalent
- **Free payout**: Once per month
- **Instant payout**: $2 fee (1-2 hours vs 3-5 days)

---

## ✅ Success Metrics

### Wallet System
- 90%+ of sellers use wallet for payouts
- <1% fraud rate
- Average withdrawal time <48 hours

### KYC System
- 80%+ of sellers complete Level 2 verification
- <5% rejection rate
- Average review time <24 hours

### Breeder Profiles
- 100% of active sellers have complete profiles
- Average rating >4.5 stars
- <3% negative reviews

---

## 🎯 Next Steps

**Should we:**
1. ✅ Add these database schemas to Phase 2 implementation NOW
2. ✅ Create wallet utilities (similar to currency utilities)
3. ✅ Create KYC workflow planning
4. ✅ Design breeder profile page wireframe

**This is CRITICAL infrastructure for a world-class marketplace!**

Let me know if you want me to start implementing the database schemas immediately! 🚀
