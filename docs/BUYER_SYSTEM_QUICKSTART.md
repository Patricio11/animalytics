# Buyer System - Quick Start Checklist

**Ready to begin implementation?** Follow this checklist step-by-step.

---

## ✅ Pre-Implementation Checklist

### Decisions Made
- [ ] User role strategy decided (Buyer role vs Multi-role)
- [ ] Messaging technology chosen (Pusher/Socket.io/Supabase)
- [ ] Payment flow approach approved (Platform/Offline/Escrow)
- [ ] Ownership transfer logic confirmed
- [ ] Mobile strategy decided (PWA/Native/Both)

### Accounts & Services
- [ ] Pusher account created (if using Pusher)
- [ ] Stripe test account setup (if using Stripe)
- [ ] Email service configured (for notifications)
- [ ] CDN setup for images (if not already)

### Development Environment
- [ ] Database backup created
- [ ] Development branch created (`feature/buyer-system`)
- [ ] Team notified of upcoming changes
- [ ] Documentation reviewed and approved

---

## 🚀 Week 1: Foundation Tasks

### Day 1-2: Database Schema

**Task 1: Update User Roles**
```bash
# File: lib/db/schema/users.ts
# Add 'buyer' to userRoleEnum
```

**Task 2: Create Buyer Profiles Table**
```bash
# File: lib/db/schema/buyer-profiles.ts
# Create new schema file
```

**Task 3: Create Conversations & Messages Tables**
```bash
# File: lib/db/schema/conversations.ts
# Create new schema file
```

**Task 4: Create Purchases Table**
```bash
# File: lib/db/schema/purchases.ts
# Create new schema file
```

**Task 5: Generate Migration**
```bash
npm run db:generate
npm run db:migrate
```

**Verification:**
- [ ] All tables created in database
- [ ] Foreign keys working
- [ ] No migration errors
- [ ] Schema exported in index.ts

---

### Day 3-4: API Routes

**Buyer Profile Routes:**
- [ ] `POST /api/buyer/profile` - Create profile
- [ ] `GET /api/buyer/profile` - Get profile
- [ ] `PATCH /api/buyer/profile` - Update profile
- [ ] `GET /api/buyer/stats` - Get statistics

**Conversation Routes:**
- [ ] `GET /api/conversations` - List conversations
- [ ] `POST /api/conversations` - Start conversation
- [ ] `GET /api/conversations/[id]` - Get conversation
- [ ] `GET /api/conversations/[id]/messages` - Get messages
- [ ] `POST /api/conversations/[id]/messages` - Send message
- [ ] `PATCH /api/conversations/[id]/read` - Mark as read

**Purchase Routes:**
- [ ] `GET /api/purchases` - List purchases
- [ ] `POST /api/purchases` - Create purchase
- [ ] `GET /api/purchases/[id]` - Get purchase details
- [ ] `PATCH /api/purchases/[id]` - Update purchase

**Verification:**
- [ ] All routes return 200 OK
- [ ] Proper error handling (400, 401, 404, 500)
- [ ] Authentication working
- [ ] Authorization by role working

---

### Day 5-7: Authentication & Role Setup

**Tasks:**
- [ ] Update signup to support buyer role
- [ ] Create buyer profile on signup
- [ ] Add role selection to signup form
- [ ] Update OAuth flow for buyers
- [ ] Create buyer layout with role check
- [ ] Test role-based access control

**Verification:**
- [ ] Can create buyer account
- [ ] Buyer profile created automatically
- [ ] Buyers can't access breeder features
- [ ] Breeders can't access buyer features

---

## 🎨 Week 2: UI Development

### Day 1-3: Dashboard Layout

**Components to Create:**
- [ ] `app/(buyer)/layout.tsx` - Main buyer layout
- [ ] `app/(buyer)/dashboard/layout.tsx` - Dashboard layout
- [ ] `app/(buyer)/dashboard/page.tsx` - Dashboard page
- [ ] `components/buyer/dashboard/LeftSidebar.tsx`
- [ ] `components/buyer/dashboard/RightSidebar.tsx`
- [ ] `components/buyer/dashboard/ActivityFeed.tsx`
- [ ] `components/buyer/dashboard/MobileNav.tsx`

**Verification:**
- [ ] Desktop layout working (3 columns)
- [ ] Mobile layout working (bottom nav)
- [ ] Responsive breakpoints correct
- [ ] Navigation working
- [ ] Looks good on iPhone, Android, tablet

---

### Day 4-5: Messaging System

**Setup Pusher (if chosen):**
```bash
npm install pusher pusher-js
```

**Components to Create:**
- [ ] `app/(buyer)/messages/page.tsx` - Conversation list
- [ ] `app/(buyer)/messages/[id]/page.tsx` - Thread view
- [ ] `components/buyer/messages/ConversationList.tsx`
- [ ] `components/buyer/messages/MessageThread.tsx`
- [ ] `components/buyer/messages/MessageInput.tsx`
- [ ] `components/buyer/messages/MessageBubble.tsx`

**Pusher Integration:**
- [ ] Configure Pusher client
- [ ] Subscribe to user channel
- [ ] Listen for new messages
- [ ] Send messages through Pusher
- [ ] Update UI in real-time

**Verification:**
- [ ] Can start conversation from listing
- [ ] Messages send in real-time
- [ ] Read receipts working
- [ ] Unread count updating
- [ ] Mobile keyboard doesn't cover input

---

### Day 6-7: Browse & Save Features

**Components to Create:**
- [ ] `app/(buyer)/browse/page.tsx` - Marketplace browse
- [ ] `app/(buyer)/saved/page.tsx` - Saved listings
- [ ] `components/buyer/browse/FilterSidebar.tsx`
- [ ] `components/buyer/browse/ListingGrid.tsx`
- [ ] `components/buyer/saved/SavedListingCard.tsx`

**Features to Implement:**
- [ ] Filter by breed, price, location
- [ ] Save/unsave listings
- [ ] Saved listings page
- [ ] Search functionality
- [ ] Sort options

**Verification:**
- [ ] Filters work correctly
- [ ] Save button toggles
- [ ] Saved listings persist
- [ ] Can remove from saved
- [ ] Empty states show correctly

---

## 💳 Week 3: Purchase Flow

### Day 1-3: Purchase Implementation

**Components to Create:**
- [ ] `app/(buyer)/purchases/page.tsx` - Purchase history
- [ ] `app/(buyer)/purchases/[id]/page.tsx` - Purchase detail
- [ ] `components/buyer/purchases/InitiatePurchaseDialog.tsx`
- [ ] `components/buyer/purchases/PurchaseCard.tsx`
- [ ] `components/buyer/purchases/PurchaseTimeline.tsx`
- [ ] `components/buyer/purchases/ReviewForm.tsx`

**Flow to Implement:**
- [ ] Initiate purchase from listing
- [ ] Select payment method
- [ ] Process payment (Stripe/Wallet)
- [ ] Create purchase record
- [ ] Update listing status
- [ ] Transfer ownership
- [ ] Send notifications

**Verification:**
- [ ] Can complete purchase
- [ ] Payment processed correctly
- [ ] Ownership transferred
- [ ] Animal shows in "My Animals"
- [ ] Notifications sent
- [ ] Can leave review

---

### Day 4-5: My Animals Section

**Components to Create:**
- [ ] `app/(buyer)/animals/page.tsx` - Owned animals list
- [ ] `app/(buyer)/animals/[id]/page.tsx` - Animal detail (buyer view)
- [ ] `components/buyer/animals/OwnedAnimalCard.tsx`
- [ ] `components/buyer/animals/HealthTimeline.tsx`
- [ ] `components/buyer/animals/BreederContactCard.tsx`

**Features:**
- [ ] List owned animals
- [ ] View health records (read-only)
- [ ] Contact breeder
- [ ] View documents
- [ ] Health reminders

**Verification:**
- [ ] Purchased animals appear
- [ ] Health records accessible
- [ ] Can contact breeder
- [ ] Documents downloadable
- [ ] Looks good on mobile

---

### Day 6-7: Testing & Polish

**Testing Checklist:**
- [ ] End-to-end buyer journey
  - [ ] Sign up as buyer
  - [ ] Browse listings
  - [ ] Save listings
  - [ ] Contact breeder
  - [ ] Chat with breeder
  - [ ] Purchase animal
  - [ ] View in My Animals
  - [ ] Leave review
- [ ] Mobile testing (iOS, Android)
- [ ] Desktop testing (Chrome, Firefox, Safari)
- [ ] Tablet testing
- [ ] Performance testing
  - [ ] Page load times < 2s
  - [ ] Images optimized
  - [ ] No console errors
- [ ] Accessibility testing
  - [ ] Keyboard navigation
  - [ ] Screen reader friendly
  - [ ] Color contrast

**Polish Tasks:**
- [ ] Loading states everywhere
- [ ] Error messages user-friendly
- [ ] Empty states attractive
- [ ] Animations smooth
- [ ] Icons consistent
- [ ] Spacing consistent
- [ ] Typography consistent

---

## 📱 Mobile Optimization Checklist

- [ ] Touch targets ≥ 44x44px
- [ ] Bottom navigation works
- [ ] Swipe gestures enabled
- [ ] Pull-to-refresh implemented
- [ ] Keyboard doesn't cover inputs
- [ ] Images lazy load
- [ ] PWA installable
- [ ] Works offline (basic)
- [ ] Push notifications (if using)
- [ ] Fast on 3G network

---

## 🔔 Notification Checklist

### In-App Notifications
- [ ] New message notification
- [ ] Listing saved notification
- [ ] Purchase confirmation
- [ ] Ownership transferred
- [ ] Review reminder

### Email Notifications
- [ ] Welcome email (buyer signup)
- [ ] New message email
- [ ] Purchase confirmation email
- [ ] Review request email

### Push Notifications (PWA)
- [ ] New message push
- [ ] Purchase update push
- [ ] Saved listing available push

---

## 🐛 Common Issues & Solutions

### Issue: Messages not real-time
**Solution:**
- Check Pusher credentials
- Verify channel subscription
- Check browser console for errors
- Test with Pusher debug console

### Issue: Images loading slow
**Solution:**
- Use Next.js Image component
- Implement lazy loading
- Compress images
- Use CDN

### Issue: Mobile layout broken
**Solution:**
- Check responsive breakpoints
- Test on real devices
- Use mobile-first CSS
- Check viewport meta tag

### Issue: Ownership transfer not working
**Solution:**
- Verify animal.ownerId updating
- Check purchase.status
- Ensure notifications sent
- Verify permissions

---

## 🎯 Launch Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance optimized
- [ ] Mobile tested
- [ ] Documentation complete
- [ ] Help content created
- [ ] Support email ready

### Launch Day
- [ ] Database backup
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Watch analytics
- [ ] Support team ready
- [ ] Social media announcement

### Post-Launch (Week 1)
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Monitor performance
- [ ] Track key metrics
- [ ] Iterate on UX issues

---

## 📊 Success Metrics to Track

### Engagement
- Daily active buyers
- Listings viewed per session
- Messages sent per day
- Saved listings count
- Return rate (7 days)

### Conversion
- Signup to first browse
- Browse to save
- Save to message
- Message to purchase
- Purchase completion rate

### Business
- Total purchases
- Average purchase value
- Platform fee revenue
- Buyer satisfaction score
- Seller satisfaction score

---

## 🔧 Tools & Resources

### Development
- **Next.js Docs:** https://nextjs.org/docs
- **Drizzle ORM:** https://orm.drizzle.team
- **shadcn/ui:** https://ui.shadcn.com
- **Pusher Docs:** https://pusher.com/docs
- **Stripe Docs:** https://stripe.com/docs

### Design
- **Figma:** Design mockups
- **Tailwind Docs:** https://tailwindcss.com
- **Heroicons:** https://heroicons.com
- **Lucide Icons:** https://lucide.dev

### Testing
- **Playwright:** E2E testing
- **React Testing Library:** Component tests
- **Lighthouse:** Performance testing

---

## 🤝 Need Help?

**Stuck on something?**
1. Check implementation plan details
2. Review design mockups
3. Test on staging first
4. Ask for clarification
5. Document the solution

**Found a better approach?**
- Document it
- Update the plan
- Share with team
- Implement it

---

**Ready to start?** Begin with Week 1, Day 1 tasks! 🚀

**Questions before starting?** Review the summary doc and ask away!

