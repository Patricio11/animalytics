# Animalytics - Comprehensive System Overview

## 🎯 Executive Summary

**Animalytics** is a full-stack canine breeding management platform built with Next.js 15, React 19, TypeScript, Drizzle ORM, and PostgreSQL (Neon). The system provides professional breeders with comprehensive tools for animal management, breeding operations, health tracking, marketplace functionality, and financial management.

**Tech Stack:**
- **Frontend:** Next.js 15.5.7 (App Router), React 19, TypeScript, TailwindCSS, shadcn/ui
- **Backend:** Next.js API Routes, Drizzle ORM 0.44.6
- **Database:** PostgreSQL (Neon serverless)
- **Authentication:** Better Auth 1.3.27
- **File Storage:** Supabase Storage, UploadThing
- **State Management:** React Query (TanStack Query 5.90.2), Zustand
- **Email:** Nodemailer with Mailtrap
- **Payments:** Stripe integration
- **UI Components:** Radix UI primitives, Lucide icons

---

## 📊 System Architecture

### **Multi-Role Platform**
The system supports 4 distinct user roles with dedicated interfaces:

1. **Breeder** - Primary user role for breeding operations
2. **Veterinarian** - Health records and clinic management
3. **Event Organizer** - Dog show and competition management
4. **Admin** - System administration and oversight

### **Route Structure**
```
app/
├── (breeder)/          # Breeder dashboard and features
├── (vet)/              # Veterinarian interface
├── (event-organizer)/  # Event management
├── (shared)/           # Shared resources (animals, tasks)
├── admin/              # Admin panel
├── api/                # 35+ API route groups
├── auth/               # Authentication pages
├── marketplace/        # Public marketplace
└── pet-owner/          # Pet owner portal
```

---

## 🗄️ Database Schema Overview

### **Core Tables (27+ tables)**

#### **User Management**
- `users` - Main user accounts with Better Auth
- `sessions` - Active user sessions
- `accounts` - OAuth provider accounts
- `verifications` - Email verification tokens
- `breederProfiles` - Public breeder profiles with SEO
- `petOwnerProfiles` - Pet owner profiles

#### **Animal Management**
- `animals` - Main animal records (dogs)
- `breeds` - Breed reference data (300+ breeds)
- `animalPhotos` - 7 photo categories (profile, gallery, training, shows, pedigree, health, etc.)
- `animalDocuments` - Registration papers, certificates
- `feedingPlans` - Meal schedules and nutrition
- `healthRecords` - Vaccinations, medications, vet visits
- `animalReminders` - Automated reminders
- `animalShares` - Sharing with vets/co-owners
- `manualPedigreeEntries` - External pedigree data

#### **Breeding & Reproduction**
- `heatCycles` - Heat cycle tracking
- `heatCycleProgesteroneReadings` - Progesterone test results
- `breedingRecords` - Breeding dates and methods
- `heatCycleReminders` - Automated test reminders
- `progesteroneTemplates` - Reusable cycle templates
- `litters` - Litter records
- `puppies` - Individual puppy tracking
- `semenAssessments` - Semen quality analysis
- `frozenSemen` - Frozen semen inventory
- `frozenSemenUsage` - Usage history

#### **Pedigree System**
- Hybrid approach: Linked animals (via `damId`/`sireId`) + manual entries
- Supports 5+ generations
- Manual entries for external animals not in system
- Position-based tracking (e.g., "sire.dam.sire")

#### **Marketplace**
- `listings` - Animal/semen listings with 3-step wizard
- `listingInquiries` - Buyer inquiries
- `savedListings` - Favorites
- `listingViews` - Analytics
- `featuredListingHistory` - Premium placements
- `clinics` - Reproductive service clinics

#### **Financial System**
- `wallets` - Multi-currency digital wallets (USD, EUR, GBP, ZAR, BRL, AUD, CAD)
- `transactions` - Complete audit trail
- `payoutRequests` - Withdrawal workflow
- `escrows` - Transaction protection
- All amounts stored in cents for precision

#### **KYC & Verification**
- `kycVerifications` - 3-level identity verification
  - Level 1: Email + Phone (browse only)
  - Level 2: ID + Address ($5,000/month limit)
  - Level 3: Business docs ($unlimited)
- `kycDocuments` - Secure document storage
- `kycAuditLog` - Compliance tracking
- `kycSettings` - Platform configuration

#### **Task Management**
- `tasks` - Daily activities (feeding, exercise, grooming, weight, cleaning, events)
- `taskReminders` - Notification system
- `weightRecords` - Historical weight tracking
- `puppyFeedingGenerations` - Auto-generated feeding schedules

#### **Notifications**
- `notifications` - 40+ notification types across 6 categories
- `notificationPreferences` - User settings (in-app, email, SMS, push)
- `notificationTemplates` - Reusable message templates
- Categories: breeding, health, financial, marketplace, system, social

#### **Communication**
- `conversations` - Messaging system
- `messages` - Individual messages
- `conversationParticipants` - Multi-party support

---

## 🔐 Authentication & Authorization

### **Better Auth Integration**
- Email/password authentication with verification
- Google OAuth support
- Session-based authentication (7-day expiry)
- Password reset flow
- Email verification required before login

### **User Roles & Permissions**
```typescript
enum UserRole {
  BREEDER = 'breeder',
  VET = 'veterinarian', 
  ADMIN = 'admin',
  EVENT_ORGANIZER = 'event_organizer',
  PET_OWNER = 'pet_owner'
}
```

### **Regional Settings**
Users have comprehensive localization:
- Language (en, es, pt, fr, de, af)
- Timezone (IANA format)
- Currency (USD, EUR, GBP, ZAR, etc.)
- Date format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- Time format (12h/24h)
- Measurement units (metric/imperial)
- First day of week (Sunday/Monday)

---

## 🐕 Animal Management System

### **Comprehensive Animal Profiles**
Each animal record includes:
- **Basic Info:** Name, registered name, breed, sex, DOB, microchip, registration numbers
- **Physical:** Weight, height, color, markings
- **Breeding:** Active status, champion titles, stud fee, breeding notes
- **Health:** Certifications, genetic tests, health status
- **Pedigree:** Dam/Sire (linked or manual), 5+ generation trees
- **Ownership:** Current owner, breeder, location
- **Media:** 7 photo categories (10 images each = 70 photos per animal)
- **Documents:** Registration papers, health certificates, pedigree certificates

### **Photo Management**
7 specialized categories:
1. **Profile** - Main profile images
2. **Gallery** - General photos
3. **Training** - Training sessions
4. **Shows** - Competition photos
5. **Pedigree** - Pedigree certificate images
6. **Health** - Health certificates
7. **Baby Photos** - Puppy pictures

### **Health Tracking**
- Vaccination records with due dates
- Medication tracking (dosage, frequency, duration)
- Vet visit history
- Health certificates with file uploads
- Cost tracking in user's currency
- Overdue vaccination alerts

---

## 🧬 Breeding Management

### **Progesterone Tracking System**
Advanced heat cycle monitoring with smart testing schedules:

**Key Features:**
- Day 1 = Heat start (first day of bleeding)
- Day 5 = First progesterone test (auto-reminder)
- Smart testing intervals based on levels:
  - < 4 ng/mL → Test in 3 days
  - 4-10 ng/mL → Test every 2 days  
  - 10+ ng/mL → Test daily
- Automatic phase detection (Anestrus, LH Surge, Ovulation, Egg Maturation, Fertile Range)
- Breeding window alerts:
  - Natural/Fresh AI: 15-25 ng/mL
  - Frozen semen: 25-35 ng/mL
- Whelping date calculation (63 days from ovulation)
- Visual charts and PDF export

**Database Tables:**
- `heatCycles` - Main cycle tracking
- `heatCycleProgesteroneReadings` - Individual test results
- `breedingRecords` - Breeding dates and methods
- `heatCycleReminders` - Automated notifications

### **Mating Calculator**
- Expected whelping date calculation
- Breeding window recommendations
- Multiple mating tracking
- Success rate analysis

### **Conception Rating Calculator**
Calculates conception probability based on:
- Bitch age and health
- Stud quality
- Breeding timing
- Previous litter success
- Progesterone levels
- Breeding method (natural, AI, frozen)

### **Litter Management**
- Expected vs actual whelping dates
- Puppy count tracking (male/female breakdown)
- Individual puppy records with status:
  - Available, Reserved, Sold, Retained, Deceased
- Sale tracking (price, buyer info, sale date)
- Health status per puppy
- Microchip and registration numbers
- Photo galleries per puppy

### **Frozen Semen Management**
- Batch tracking with identifiers
- Straw inventory (count, used, remaining)
- Storage location tracking
- Quality metrics (volume, concentration, motility, morphology)
- Status management (available, reserved, depleted, expired)
- Usage history with outcome tracking
- Marketplace integration

---

## 🛒 Marketplace System

### **Listing Categories**
1. **Dogs for Sale** - Adult dogs
2. **Puppies for Sale** - Available puppies
3. **Frozen Semen** - Semen straws
4. **Stud Services** - Breeding services
5. **Other** - Miscellaneous items

### **3-Step Listing Wizard**
**Step 1: Animal & Category Selection**
- Choose category
- Select animal or frozen semen batch
- Auto-populate basic details

**Step 2: Contact Details**
- Contact name, phone, email
- Location
- Availability notes

**Step 3: Listing Details**
- Title and description
- Price and currency
- Clinic selection (for reproductive services)
- Additional images

### **Featured Listings**
3-tier premium placement system:
- **Basic** - Top of category
- **Premium** - Homepage + category top
- **Spotlight** - Homepage hero + all categories

### **Listing Management**
- Draft/Active/Sold/Expired status
- Admin approval workflow
- View count and inquiry tracking
- Auto-expiration with renewal option
- Saved listings (favorites)
- Inquiry system with response tracking

---

## 💰 Financial System

### **Multi-Currency Wallet**
- Support for 7 currencies (USD, EUR, GBP, ZAR, BRL, AUD, CAD)
- All amounts stored in cents (no floating-point errors)
- Pending/escrow balance tracking
- Lifetime statistics (earnings, withdrawals, transactions)

### **Transaction Types**
- Deposit, Withdrawal, Payment, Refund
- Fee, Commission
- Escrow hold/release

### **Payout System**
- Withdrawal requests with approval workflow
- Multiple payout methods:
  - Bank transfer
  - PayPal
  - Stripe
  - Wise
- Status tracking (pending → approved → processing → completed)
- Admin review and rejection capability

### **Escrow Protection**
- Holds funds during marketplace transactions
- Platform fee calculation
- Dispute handling
- Automatic release on completion

---

## 📋 Task & Activity Management

### **Task Types**
1. **Feeding** - Meal schedules
2. **Exercise** - Walks, play, training
3. **Grooming** - Bath, brush, nails, ears, teeth
4. **Weight** - Weight tracking
5. **Cleaning** - Kennel/area maintenance
6. **Event** - Vet visits, vaccinations, shows
7. **Puppy Feeding** - Auto-generated feeding tasks
8. **Misc** - Custom tasks

### **Auto-Generated Tasks**
**Progesterone Tests:**
- Day 5 initial test
- Smart interval reminders based on levels

**Pregnancy Screening:**
- Ultrasound (21-28 days post-mating)
- Blood test (25-30 days)
- X-ray (45+ days)
- Checkups

**Puppy Feeding:**
- Age-based schedules:
  - 3-4 months: 3 feedings/day
  - 4-6 months: 2 feedings/day
- Weekly batch generation

### **Task Features**
- Priority levels (low, medium, high)
- Recurring tasks (daily, weekly, monthly)
- Completion tracking
- Reminders (email, push, SMS)
- Task-specific data storage (JSONB)

---

## 🔔 Notification System

### **40+ Notification Types**

**Progesterone & Heat Cycles (9):**
- Test due, Daily test, Next cycle
- Breeding window open/closing
- Ovulation detected
- Whelping approaching
- Heat cycle started/completed

**Breeding & Litters (7):**
- Breeding scheduled/completed
- Pregnancy confirmed
- Ultrasound due
- Whelping started
- Puppy born
- Litter registered

**Health & Veterinary (5):**
- Vaccination due
- Deworming due
- Vet appointment
- Health check due
- Medication reminder

**Marketplace & Sales (6):**
- Listing approved/rejected/expired
- Inquiry received
- Offer received
- Sale completed

**Financial (4):**
- Payment received/due
- Invoice generated
- Wallet low balance

**System & Account (6):**
- KYC approved/rejected/pending
- Subscription expiring/renewed
- Account verified

**Social & Community (4):**
- New follower
- Review received
- Message received
- Event reminder

### **Notification Features**
- Multi-channel delivery (in-app, email, SMS, push)
- Priority levels (low, normal, high, urgent)
- Category-based preferences
- Quiet hours support
- Daily/weekly digest options
- Deep linking to relevant pages
- Read/unread tracking
- Archive functionality
- Expiration dates

---

## 🧮 Calculators & Tools

### **1. Mating Calculator**
- Optimal breeding window calculation
- Expected whelping date
- Multiple mating tracking
- Success probability

### **2. Conception Rating Calculator**
Analyzes 10+ factors:
- Bitch age (optimal: 2-6 years)
- Health status
- Previous litter success
- Stud quality
- Breeding timing
- Progesterone levels
- Breeding method
- Genetic compatibility

### **3. Progesterone Tracker**
- Heat cycle management
- Smart test scheduling
- Phase detection
- Breeding window alerts
- Visual charts
- PDF export

### **4. Whelping Calendar**
- Countdown to whelping
- Preparation checklist
- Daily care reminders
- Post-whelping tracking

---

## 📊 Reporting & Analytics

### **Breeder Reports**
- Animal inventory summary
- Breeding success rates
- Litter statistics
- Health record summaries
- Financial reports
- Marketplace performance

### **Admin Analytics**
- User activity metrics
- Revenue tracking
- System performance
- Transaction volumes
- Popular breeds
- Geographic distribution

---

## 🔍 Search & Discovery

### **Global Animal Search**
- Search across all animals in system
- Filter by breed, sex, age, location
- Advanced filters (champion lines, health certified)
- Public profiles for verified breeders

### **Breeder Directory**
- Public breeder profiles with SEO-friendly slugs
- Filter by breeds, location, certifications
- Rating and review system
- Verification badges (KYC, health certified, kennel club member)

### **Marketplace Search**
- Category-based browsing
- Price range filters
- Location-based search
- Featured listings prominence
- Saved searches

---

## 🏥 Veterinarian Features

### **Clinic Management**
- Clinic profiles with services offered
- Operating hours
- Contact information
- License and certifications
- Integration with marketplace listings

### **Vet Portal** (Planned)
- Appointment scheduling
- Animal health records access
- Health certificate generation
- Vaccination record management
- Breeding fitness reports

---

## 🏆 Event Organizer Features (Planned)

### **Event Management**
- Dog show creation
- Competition categories
- Registration management
- Check-in system
- Results entry
- Leaderboards
- Certificate generation

---

## 👨‍💼 Admin Panel

### **User Management**
- View all users by role
- Create admin-generated accounts
- Suspend/activate accounts
- Role assignment
- Permission management
- Activity monitoring

### **KYC Verification**
- Review verification requests
- Approve/reject with reasons
- Document verification
- Set selling limits
- Audit log tracking

### **Marketplace Moderation**
- Listing approval workflow
- Featured listing management
- Inquiry monitoring
- Dispute resolution

### **System Configuration**
- KYC settings (limits, requirements)
- Notification templates
- Email configuration
- Payment gateway settings
- Platform fees

### **Audit Logs**
- Admin actions tracking
- KYC verification history
- Transaction monitoring
- System changes log

---

## 📱 API Structure

### **35+ API Route Groups**

**Core APIs:**
- `/api/animals` - Animal CRUD operations
- `/api/breeds` - Breed reference data
- `/api/auth` - Authentication endpoints
- `/api/user` - User profile management

**Breeding APIs:**
- `/api/heat-cycles` - Heat cycle management
- `/api/progesterone-readings` - Test results
- `/api/breeding-records` - Breeding tracking
- `/api/litters` - Litter management
- `/api/matings` - Mating calculator
- `/api/conception-ratings` - Conception analysis

**Marketplace APIs:**
- `/api/marketplace` - Listing search
- `/api/listings` - Listing CRUD
- `/api/clinics` - Clinic management
- `/api/frozen-semen` - Semen inventory

**Financial APIs:**
- `/api/wallet` - Wallet operations
- `/api/transactions` - Transaction history
- `/api/purchases` - Purchase management
- `/api/escrow` - Escrow operations

**Task APIs:**
- `/api/tasks` - Task management
- `/api/reports` - Reporting endpoints
- `/api/dashboard` - Dashboard statistics

**Notification APIs:**
- `/api/notifications` - Notification CRUD
- `/api/notifications/bulk` - Bulk operations

**Admin APIs:**
- `/api/admin/users` - User management
- `/api/admin/kyc` - KYC verification
- `/api/admin/listings` - Listing moderation

**Utility APIs:**
- `/api/uploadthing` - File upload
- `/api/location` - Location services
- `/api/test-email` - Email testing

---

## 🎨 UI/UX Features

### **Component Library**
- **shadcn/ui** - 59+ reusable components
- **Radix UI** - Accessible primitives
- **Lucide Icons** - 500+ icons
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### **Key UI Components**
- **Forms:** React Hook Form with Zod validation
- **Tables:** Sortable, filterable data tables
- **Modals:** Dialog system for forms and confirmations
- **Cards:** Consistent card layouts
- **Charts:** Recharts for data visualization
- **Date Pickers:** React DatePicker integration
- **Image Lightbox:** Full-screen image viewing
- **Combobox:** Searchable dropdowns
- **Toast Notifications:** User feedback system

### **Responsive Design**
- Mobile-first approach
- Tablet breakpoints
- Desktop optimization
- Touch-friendly interactions

### **Dark Mode**
- User preference-based
- Consistent across all pages
- Smooth transitions

---

## 🔧 Development Tools

### **Code Quality**
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting (implied)
- **Drizzle Kit** - Database migrations

### **Database Tools**
- `npm run db:generate` - Generate migrations
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema changes
- `npm run db:studio` - Visual database browser
- `npm run db:seed` - Seed database
- `npm run db:drop` - Drop all tables

### **Development Scripts**
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

---

## 🚀 Deployment & Infrastructure

### **Database**
- **Neon PostgreSQL** - Serverless Postgres
- Connection pooling
- Automatic backups
- Branch-based development

### **File Storage**
- **Supabase Storage** - Image and document storage
- **UploadThing** - File upload handling
- Optimized image delivery
- Secure file access

### **Email Service**
- **Nodemailer** - Email sending
- **Mailtrap** - Development testing
- Template-based emails
- Multi-language support

### **Payments**
- **Stripe** - Payment processing
- Webhook handling
- Subscription management

---

## 📈 Key Metrics & Statistics

### **Database Scale**
- 27+ core tables
- 300+ dog breeds
- 40+ notification types
- 7 photo categories per animal
- 70 photos per animal capacity
- 5+ generation pedigree support

### **Feature Count**
- 4 user roles
- 35+ API route groups
- 124+ breeder components
- 59+ UI components
- 7 supported currencies
- 6 notification categories

---

## 🔐 Security Features

### **Authentication Security**
- Email verification required
- Password hashing (bcrypt)
- Session management
- CSRF protection
- Rate limiting (implied)

### **Data Security**
- Encrypted KYC documents
- Secure file storage
- SQL injection protection (Drizzle ORM)
- XSS prevention
- Input validation (Zod)

### **Financial Security**
- Amounts in cents (no floating-point)
- Transaction audit trail
- Escrow protection
- KYC verification levels
- Selling limits

---

## 🌍 Internationalization

### **Supported Languages**
- English (en)
- Spanish (es)
- Portuguese (pt)
- French (fr)
- German (de)
- Afrikaans (af)

### **Localization Features**
- User-specific timezone
- Currency formatting
- Date/time formats
- Measurement units
- First day of week preference

---

## 📝 Documentation

### **Documentation Files (245+ docs)**
Located in `/docs` directory covering:
- Feature implementations
- API endpoints
- Database migrations
- Bug fixes
- System architecture
- User guides
- Development workflows

---

## 🎯 Future Enhancements

### **Planned Features**
1. **Mobile App** - React Native companion app
2. **AI Integration** - Breeding recommendations, health predictions
3. **Genetic Analysis** - DNA test integration
4. **Show Management** - Full event organizer features
5. **Vet Portal** - Complete veterinarian interface
6. **Social Features** - Breeder networking, forums
7. **Advanced Analytics** - Predictive breeding analytics
8. **Multi-Species** - Expand beyond dogs (cats, horses, etc.)

### **Technical Improvements**
1. Real-time updates (WebSockets)
2. Progressive Web App (PWA)
3. Offline support
4. Advanced caching strategies
5. Performance optimization
6. Automated testing suite
7. CI/CD pipeline

---

## 🤝 Contributing

### **Development Workflow**
1. Database schema changes via Drizzle migrations
2. API routes follow RESTful conventions
3. Components use TypeScript strict mode
4. UI components from shadcn/ui library
5. State management via React Query + Zustand
6. Form validation with Zod schemas

### **Code Organization**
```
lib/
├── api/              # API client and queries
├── auth/             # Authentication logic
├── calculations/     # Business logic calculators
├── db/               # Database schema and migrations
├── hooks/            # Custom React hooks
├── services/         # External service integrations
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── validations/      # Zod validation schemas
```

---

## 📞 Support & Resources

### **Key Technologies Documentation**
- [Next.js 15](https://nextjs.org/docs)
- [React 19](https://react.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [Better Auth](https://www.better-auth.com)
- [shadcn/ui](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com)

---

## 🏁 Conclusion

**Animalytics** is a comprehensive, production-ready breeding management platform with:
- ✅ Robust authentication and authorization
- ✅ Complete animal lifecycle management
- ✅ Advanced breeding tools (progesterone tracking, conception rating)
- ✅ Full-featured marketplace with escrow
- ✅ Multi-currency financial system
- ✅ KYC verification (3 levels)
- ✅ 40+ notification types
- ✅ Task automation
- ✅ Health tracking
- ✅ Pedigree management
- ✅ Reporting and analytics
- ✅ Multi-role support
- ✅ Internationalization

The system is built with modern best practices, type safety, and scalability in mind, ready for production deployment and future enhancements.

---

**Last Updated:** January 2026
**Version:** 0.1.0
**Status:** Active Development
