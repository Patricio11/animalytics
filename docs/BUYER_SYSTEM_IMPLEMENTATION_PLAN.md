# Buyer/Owner System - Complete Implementation Plan

**Date:** January 13, 2025
**Status:** Planning Phase
**Estimated Timeline:** 2-3 weeks for MVP

---

## 📋 Executive Summary

This document outlines a comprehensive plan to implement a complete buyer/owner experience in Animalytics, including:
- Buyer role and profile management
- Beautiful, mobile-optimized dashboard (Facebook-style layout)
- Full communication system between buyers and breeders
- Notification system for all interactions
- Purchase flow from browsing to ownership
- My Animals section for purchased animals

---

## 🎯 Current System Analysis

### Existing Infrastructure ✅

**Database Schema:**
- ✅ `listings` table with full marketplace support
- ✅ `listingInquiries` table for buyer-breeder communication
- ✅ `savedListings` table for favorites
- ✅ `notifications` table with marketplace events
- ✅ `animals` table with owner tracking
- ✅ `users` table (currently: breeder, vet, event_organizer, admin roles)

**Pages & Components:**
- ✅ Marketplace browse page
- ✅ Listing detail page
- ✅ Create listing wizard
- ✅ My listings (seller view)
- ✅ Notification system

### What's Missing ❌

**User System:**
- ❌ "buyer" role in user enum
- ❌ Buyer profile schema
- ❌ Buyer preferences and settings

**Dashboard:**
- ❌ Buyer dashboard layout
- ❌ My purchases section
- ❌ My owned animals section
- ❌ Saved listings/favorites view
- ❌ Communication inbox

**Communication:**
- ❌ Real-time messaging system
- ❌ Conversation threads
- ❌ Message read/unread status
- ❌ Conversation archiving

**Purchase Flow:**
- ❌ Inquiry system enhancement
- ❌ Offer/negotiation system
- ❌ Purchase confirmation flow
- ❌ Ownership transfer
- ❌ Purchase history

---

## 🏗️ System Architecture

### Phase 1: Foundation (Week 1)

#### 1.1 Database Schema Extensions

**Add Buyer Role:**
```typescript
// Update: lib/db/schema/users.ts
export const userRoleEnum = pgEnum('user_role', [
  'breeder',
  'veterinarian',
  'admin',
  'event_organizer',
  'buyer' // NEW
]);
```

**Create Buyer Profiles Table:**
```typescript
// New: lib/db/schema/buyer-profiles.ts
export const buyerProfiles = pgTable('buyer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id).notNull().unique(),

  // Profile Info
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  avatar: text('avatar'),
  location: jsonb('location').$type<{
    city?: string;
    state?: string;
    country: string;
  }>(),

  // Preferences
  interestedBreeds: jsonb('interested_breeds').$type<string[]>(),
  budgetRange: jsonb('budget_range').$type<{
    min?: number;
    max?: number;
    currency: string;
  }>(),
  lookingFor: jsonb('looking_for').$type<string[]>(), // ['breeding', 'pet', 'show', 'working']

  // Activity
  totalPurchases: integer('total_purchases').default(0),
  totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0.00'),
  favoriteCount: integer('favorite_count').default(0),
  inquiryCount: integer('inquiry_count').default(0),

  // Verification
  isVerified: boolean('is_verified').default(false),
  verifiedAt: timestamp('verified_at'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

**Create Conversations Table:**
```typescript
// New: lib/db/schema/conversations.ts
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').references(() => listings.id),

  // Participants
  buyerId: text('buyer_id').references(() => users.id).notNull(),
  sellerId: text('seller_id').references(() => users.id).notNull(),

  // Status
  status: text('status').default('active'), // active, archived, blocked
  subject: text('subject'),

  // Tracking
  lastMessageAt: timestamp('last_message_at'),
  unreadCountBuyer: integer('unread_count_buyer').default(0),
  unreadCountSeller: integer('unread_count_seller').default(0),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),

  // Message
  senderId: text('sender_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  attachments: jsonb('attachments').$type<string[]>(),

  // Status
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),

  // Type
  messageType: text('message_type').default('text'), // text, system, offer
  metadata: jsonb('metadata'), // For offers, system messages, etc.

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

**Create Purchases Table:**
```typescript
// New: lib/db/schema/purchases.ts
export const purchases = pgTable('purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').references(() => listings.id).notNull(),
  animalId: uuid('animal_id').references(() => animals.id),

  // Parties
  buyerId: text('buyer_id').references(() => users.id).notNull(),
  sellerId: text('seller_id').references(() => users.id).notNull(),

  // Purchase Details
  purchasePrice: integer('purchase_price').notNull(), // in cents
  currency: text('currency').default('USD'),
  paymentMethod: text('payment_method'), // wallet, stripe, cash, etc.
  paymentStatus: text('payment_status').default('pending'), // pending, completed, failed

  // Transfer Details
  ownershipTransferred: boolean('ownership_transferred').default(false),
  transferredAt: timestamp('transferred_at'),
  pickupDate: timestamp('pickup_date'),
  deliveryMethod: text('delivery_method'), // pickup, delivery, shipping

  // Documents
  contract: text('contract_url'),
  healthCertificates: jsonb('health_certificates').$type<string[]>(),
  registrationPapers: jsonb('registration_papers').$type<string[]>(),

  // Status
  status: text('status').default('pending'), // pending, confirmed, completed, cancelled
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
  cancelReason: text('cancel_reason'),

  // Reviews
  buyerReviewId: uuid('buyer_review_id'),
  sellerReviewId: uuid('seller_review_id'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

#### 1.2 API Routes

**Buyer Profile Management:**
- `POST /api/buyer/profile` - Create buyer profile
- `GET /api/buyer/profile` - Get buyer profile
- `PATCH /api/buyer/profile` - Update buyer profile
- `GET /api/buyer/stats` - Get buyer statistics

**Conversations & Messages:**
- `GET /api/conversations` - List all conversations
- `GET /api/conversations/[id]` - Get conversation details
- `POST /api/conversations` - Start new conversation
- `GET /api/conversations/[id]/messages` - Get messages
- `POST /api/conversations/[id]/messages` - Send message
- `PATCH /api/conversations/[id]/read` - Mark as read
- `PATCH /api/conversations/[id]/archive` - Archive conversation

**Purchases:**
- `GET /api/purchases` - List buyer's purchases
- `GET /api/purchases/[id]` - Get purchase details
- `POST /api/purchases` - Create purchase
- `PATCH /api/purchases/[id]` - Update purchase status
- `POST /api/purchases/[id]/review` - Submit review

**Enhanced Listings:**
- `POST /api/listings/[id]/inquiry` - Send inquiry (existing, enhance)
- `POST /api/listings/[id]/save` - Save/favorite listing
- `DELETE /api/listings/[id]/save` - Unsave listing
- `GET /api/listings/saved` - Get saved listings

---

### Phase 2: Buyer Dashboard (Week 1-2)

#### 2.1 Dashboard Layout - Facebook-Style Design

**Layout Structure:**
```
┌─────────────────────────────────────────────┐
│           Mobile-Optimized Header           │
│  [Logo]  [Search]  [Notifications] [Menu]   │
├──────────┬──────────────────────┬───────────┤
│          │                      │           │
│ Left     │   Main Feed/Content  │  Right    │
│ Sidebar  │                      │  Sidebar  │
│          │                      │           │
│ • Home   │  [Activity Cards]    │  Saved    │
│ • Browse │  [Messages]          │  Listings │
│ • Saved  │  [Recommendations]   │           │
│ • Inbox  │  [Recent Views]      │  Quick    │
│ • Animals│                      │  Actions  │
│          │                      │           │
│          │                      │           │
└──────────┴──────────────────────┴───────────┘
```

**Mobile Layout (< 768px):**
```
┌─────────────────────────┐
│  [☰] Logo [🔔] [👤]    │
├─────────────────────────┤
│                         │
│    Main Content Feed    │
│                         │
│  [Activity Cards]       │
│  [Messages]             │
│  [Recommendations]      │
│                         │
├─────────────────────────┤
│   Bottom Navigation     │
│  🏠  🔍  💬  ❤️  👤   │
└─────────────────────────┘
```

#### 2.2 Dashboard Sections

**1. Home/Feed Section:**
- Activity feed (new listings matching preferences)
- Recent conversations
- Saved listings updates
- Recommended animals
- Trending listings

**2. Browse Marketplace:**
- Filter by breed, price, location
- Save searches
- Map view for local listings
- Featured listings carousel

**3. Saved Listings:**
- Grid/List view toggle
- Organization by folders
- Price alerts
- Availability tracking

**4. Messages/Inbox:**
- Conversation list
- Unread count badges
- Quick reply
- Attachment support
- Search conversations

**5. My Animals:**
- Owned animals grid
- Health records access
- Breeder contact info
- Documents storage

**6. My Purchases:**
- Purchase history
- Order status tracking
- Documents/receipts
- Leave reviews

#### 2.3 Component Structure

```
app/
├── (buyer)/
│   ├── layout.tsx                    // Buyer layout with role check
│   ├── dashboard/
│   │   ├── page.tsx                  // Main dashboard
│   │   ├── layout.tsx                // Facebook-style layout
│   │   └── components/
│   │       ├── ActivityFeed.tsx
│   │       ├── LeftSidebar.tsx
│   │       ├── RightSidebar.tsx
│   │       └── MobileNav.tsx
│   ├── browse/
│   │   └── page.tsx                  // Enhanced marketplace browse
│   ├── saved/
│   │   └── page.tsx                  // Saved listings
│   ├── messages/
│   │   ├── page.tsx                  // Conversations list
│   │   └── [id]/
│   │       └── page.tsx              // Conversation thread
│   ├── animals/
│   │   ├── page.tsx                  // My owned animals
│   │   └── [id]/
│   │       └── page.tsx              // Animal detail (buyer view)
│   └── purchases/
│       ├── page.tsx                  // Purchase history
│       └── [id]/
│           └── page.tsx              // Purchase details

components/
├── buyer/
│   ├── dashboard/
│   │   ├── ActivityCard.tsx
│   │   ├── ConversationPreview.tsx
│   │   ├── RecommendationCard.tsx
│   │   └── QuickActions.tsx
│   ├── messages/
│   │   ├── ConversationList.tsx
│   │   ├── MessageThread.tsx
│   │   ├── MessageInput.tsx
│   │   └── MessageBubble.tsx
│   ├── animals/
│   │   ├── OwnedAnimalCard.tsx
│   │   ├── AnimalHealthTimeline.tsx
│   │   └── BreederContactCard.tsx
│   └── purchases/
│       ├── PurchaseCard.tsx
│       ├── PurchaseTimeline.tsx
│       └── ReviewForm.tsx
```

---

### Phase 3: Communication System (Week 2)

#### 3.1 Real-Time Messaging

**Technology Stack:**
- **Option 1:** Pusher (Real-time websockets, easy integration)
- **Option 2:** Socket.io (Self-hosted, more control)
- **Option 3:** Supabase Realtime (If using Supabase)

**Features:**
- Real-time message delivery
- Typing indicators
- Read receipts
- Online/offline status
- Message notifications
- File attachments (images, PDFs)

#### 3.2 Conversation Flow

**Buyer Initiates:**
1. Buyer views listing
2. Clicks "Contact Seller"
3. Modal opens with message form
4. System checks for existing conversation
5. If exists: Opens existing thread
6. If new: Creates conversation + sends first message
7. Seller receives notification
8. Both can continue conversation

**Features:**
- Pre-filled message templates
- Quick questions (pre-defined)
- Listing context in conversation
- Price negotiation messages
- Schedule viewing/pickup

#### 3.3 Notification Integration

**Buyer Notifications:**
- New message received
- Seller responded
- Listing you saved is now available
- Price drop on saved listing
- New listing matches your preferences
- Purchase status updates
- Animal health updates (for owned animals)

**Seller Notifications:**
- New inquiry received
- Buyer sent message
- Listing viewed by interested buyer
- Saved by buyer
- Purchase completed

---

### Phase 4: Purchase Flow (Week 2-3)

#### 4.1 Purchase Journey

**Step 1: Interest**
```
Buyer views listing
↓
Saves to favorites
↓
Sends inquiry/message
```

**Step 2: Communication**
```
Buyer and seller chat
↓
Negotiate price/terms
↓
Schedule viewing (optional)
```

**Step 3: Offer**
```
Buyer makes offer
↓
Seller accepts/counters/rejects
↓
Agreement reached
```

**Step 4: Purchase**
```
Buyer initiates purchase
↓
Payment method selection
↓
Payment processed
↓
Contract generated
```

**Step 5: Fulfillment**
```
Pickup/delivery scheduled
↓
Animal handed over
↓
Documents transferred
↓
Ownership transferred in system
```

**Step 6: Completion**
```
Buyer confirms receipt
↓
Seller confirms handover
↓
Both leave reviews
↓
Purchase marked complete
```

#### 4.2 Purchase Components

**InitiatePurchaseDialog:**
- Purchase summary
- Price confirmation
- Payment method selection
- Delivery preference
- Terms acceptance

**PurchaseAgreementForm:**
- Auto-generated contract
- Health guarantee terms
- Return policy
- Registration transfer agreement
- Digital signatures

**OwnershipTransferFlow:**
- Update animal.ownerId
- Create ownership history record
- Transfer documents
- Update buyer's "My Animals"
- Notify both parties

---

### Phase 5: Mobile Optimization (Throughout)

#### 5.1 Design Principles

**Mobile-First Approach:**
- Touch-friendly targets (min 44x44px)
- Swipe gestures for actions
- Bottom navigation for main actions
- Collapsible sections
- Infinite scroll for feeds
- Pull-to-refresh

**Performance:**
- Lazy loading images
- Virtualized lists
- Code splitting by route
- Optimistic UI updates
- Offline support (service worker)

**Responsive Breakpoints:**
```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

#### 5.2 Mobile-Specific Features

**Dashboard:**
- Bottom tab navigation
- Slide-out drawer menu
- Card-based layout
- Thumb-friendly interactions

**Messages:**
- Full-screen conversation view
- Quick reply from notifications
- Voice message support (future)
- Image attachments

**Browse:**
- Map view for local search
- Filter bottom sheet
- Sort dropdown
- Quick save button

---

## 📊 Data Flow Diagrams

### Buyer Registration Flow

```
User Signs Up
↓
Select Role: "Buyer"
↓
Create User Account
↓
Create Buyer Profile
↓
Set Preferences
  - Interested breeds
  - Budget range
  - Location
↓
Redirect to Buyer Dashboard
```

### Purchase Flow

```
Buyer Browses Listings
↓
Finds Interested Listing
↓
Saves to Favorites (optional)
↓
Sends Inquiry
↓
Conversation Created
↓
Buyer & Seller Chat
↓
Buyer Makes Offer
↓
Seller Accepts
↓
Purchase Initiated
↓
Payment Processed
↓
Ownership Transferred
↓
Purchase Complete
↓
Both Leave Reviews
```

### Communication Flow

```
Buyer → Send Message
↓
Create/Find Conversation
↓
Save Message to DB
↓
Real-time Push to Seller
↓
Create Notification
↓
Send Email (if enabled)
↓
Seller Sees Message
↓
Seller Replies
↓
Repeat Process
```

---

## 🎨 UI/UX Design Specifications

### Color Scheme

**Buyer-Specific Colors:**
- Primary: Blue (#3B82F6) - Trust, professionalism
- Secondary: Green (#10B981) - Success, growth
- Accent: Purple (#8B5CF6) - Premium, special
- Neutral: Gray scale

### Typography

```typescript
// Headings
h1: 'text-3xl md:text-4xl font-bold'
h2: 'text-2xl md:text-3xl font-semibold'
h3: 'text-xl md:text-2xl font-semibold'

// Body
body: 'text-base'
small: 'text-sm'
tiny: 'text-xs'
```

### Component Patterns

**Card Design:**
```tsx
<Card className="hover:shadow-lg transition-shadow duration-200">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>{title}</CardTitle>
      <ActionButton />
    </div>
  </CardHeader>
  <CardContent>
    {content}
  </CardContent>
  <CardFooter className="flex justify-between">
    <Timestamp />
    <QuickActions />
  </CardFooter>
</Card>
```

**Mobile Navigation:**
```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
  <div className="flex justify-around items-center h-16">
    <NavItem icon={Home} label="Home" />
    <NavItem icon={Search} label="Browse" />
    <NavItem icon={MessageSquare} label="Messages" badge={3} />
    <NavItem icon={Heart} label="Saved" />
    <NavItem icon={User} label="Profile" />
  </div>
</nav>
```

---

## 🔒 Security & Privacy

### Data Protection

**Buyer Privacy:**
- Option to hide real name until purchase
- Email masking in messages
- Phone number privacy
- Location granularity control

**Conversation Security:**
- Only participants can view messages
- Option to block users
- Report inappropriate messages
- Delete conversation history

**Purchase Security:**
- Secure payment processing
- Contract storage encryption
- Document access control
- Transaction logging

---

## 📈 Analytics & Tracking

### Buyer Metrics

**Profile Analytics:**
- Listings viewed
- Inquiries sent
- Messages sent/received
- Purchases made
- Average response time

**Engagement Metrics:**
- Time on platform
- Listings saved
- Search queries
- Filter preferences
- Click-through rates

**Purchase Analytics:**
- Average purchase price
- Preferred breeds
- Preferred sellers
- Time from interest to purchase
- Repeat purchases

---

## 🧪 Testing Strategy

### Unit Tests
- API route handlers
- Utility functions
- Component logic

### Integration Tests
- Purchase flow end-to-end
- Message sending/receiving
- Notification delivery
- Ownership transfer

### E2E Tests (Playwright)
- Complete buyer journey
- Message conversation
- Purchase completion
- Mobile responsiveness

---

## 🚀 Implementation Roadmap

### Week 1: Foundation
- [ ] Day 1-2: Database schema migrations
- [ ] Day 3-4: API routes development
- [ ] Day 5-7: Buyer profile creation flow

### Week 2: Dashboard & Communication
- [ ] Day 1-3: Dashboard layout and components
- [ ] Day 4-5: Messaging system
- [ ] Day 6-7: Notification integration

### Week 3: Purchase Flow & Polish
- [ ] Day 1-3: Purchase flow implementation
- [ ] Day 4-5: Mobile optimization
- [ ] Day 6-7: Testing and bug fixes

---

## 📝 Success Criteria

**MVP Complete When:**
- ✅ Buyers can create profiles
- ✅ Beautiful, mobile-responsive dashboard
- ✅ Buyers can browse and save listings
- ✅ Real-time messaging between buyers/sellers
- ✅ Complete purchase flow working
- ✅ Ownership transfer functional
- ✅ Notifications working
- ✅ Mobile experience polished

---

## 🎯 Future Enhancements

### Phase 4 (Post-MVP)
- Video chat for animal viewing
- Escrow payment system
- Buyer reputation system
- Advanced search with AI
- Price prediction model
- Delivery/shipping coordination
- Insurance integration
- Financing options
- Multi-animal wishlist
- Auto-bid on listings

---

**Document Status:** Ready for Implementation
**Next Step:** Review with team and begin Week 1 tasks

