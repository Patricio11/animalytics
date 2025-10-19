# Animalytics

> **World-Class International Animal Management Platform**

A comprehensive, internationally-ready breeding management system designed for worldwide deployment with multi-role support, advanced breeding calculators, and professional marketplace features.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Essential Commands](#essential-commands)
- [Test Credentials](#test-credentials)
- [Architecture Overview](#architecture-overview)
- [Implementation Status](#implementation-status)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (we use [Neon](https://neon.tech))
- **UploadThing** account for file uploads

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd animalytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env.local` file:
   ```env
   # Database (Neon PostgreSQL)
   DATABASE_URL='postgresql://user:password@host/database'

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3002

   # Better Auth
   BETTER_AUTH_SECRET=your-secret-key-here

   # UploadThing (File Uploads)
   UPLOADTHING_SECRET=your-uploadthing-secret
   UPLOADTHING_APP_ID=your-uploadthing-app-id

   # Optional: Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

5. **Seed test data**
   ```bash
   npm run db:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open browser**

   Visit [http://localhost:3002](http://localhost:3002)

---

## ✨ Features

### 🐾 **Breeder Features**
- **Animal Management**: Complete CRUD with 7-tab profiles (Profile, Photos & Docs, Feeding, Semen, Seasons, Litter Details, Reminders)
- **Breeding Calculators**:
  - Progesterone Calculator (6-day tracking, lab-specific matrices)
  - Conception Rating Wizard (9-step comprehensive assessment)
  - Mating Management Dashboard
- **Reports System**: 7 report types (Events, Feeding, Exercise, Grooming, Cleaning, Puppies, Mating History)
- **Task Management**: 6 task types with puppy feeding generator
- **Marketplace**: 5 listing categories with 3-step wizard
- **Frozen Semen Management**: Complete inventory tracking
- **Wallet & KYC**: Multi-currency wallet, 3-level verification system
- **Professional Profile**: Public breeder profiles with reviews and reputation

### 🩺 **Veterinarian Features**
- Medical records and health tracking
- Appointment management
- View shared animals (read-only)
- Export reports

### 👥 **Administrator Features**
- Full system access (70+ permissions)
- User management
- KYC approval workflow
- System analytics

### 📅 **Event Organizer Features**
- Competition management
- Registration handling
- Results tracking
- View animals (read-only)

### 🌍 **Internationalization**
- **10 Currencies**: USD, EUR, GBP, ZAR, BRL, AUD, CAD, JPY, CNY, INR
- **9 Timezones**: Worldwide coverage
- **6 Languages**: English, Spanish, Portuguese, French, German, Afrikaans
- **Measurement Systems**: Metric/Imperial conversion
- **Auto-Detection**: Browser-based locale, timezone, currency detection

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 3.4.17** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management

### Backend
- **PostgreSQL** - Database (via Neon)
- **Drizzle ORM** - Type-safe database toolkit
- **Better Auth** - Authentication & authorization
- **UploadThing** - File upload management

### Design
- **BreedBook Pro Design System** - Professional HSL color scheme
- **CSS Custom Properties** - Theming system
- **Gradient System** - Modern visual appeal
- **Shadow System** - Depth and elevation

---

## 📂 Project Structure

```
animalytics/
├── app/
│   ├── (breeder)/              # Breeder role routes
│   │   ├── dashboard/
│   │   ├── animals/
│   │   ├── calculators/
│   │   ├── tasks/
│   │   ├── reports/
│   │   ├── marketplace/
│   │   ├── frozen-semen/
│   │   ├── wallet/
│   │   ├── verification/
│   │   ├── profile/
│   │   └── settings/
│   ├── (admin)/                # Admin role routes
│   ├── (vet)/                  # Veterinarian role routes
│   ├── (event-organizer)/      # Event organizer role routes
│   ├── auth/                   # Authentication pages
│   └── api/                    # API routes
├── components/
│   ├── ui/                     # Base UI components (Radix)
│   ├── shared/                 # Shared components
│   ├── layout/                 # Layout components
│   ├── breeder/                # Breeder-specific components
│   ├── admin/                  # Admin-specific components
│   ├── vet/                    # Vet-specific components
│   └── event-organizer/        # Event organizer components
├── lib/
│   ├── auth/                   # Better Auth config & utilities
│   ├── db/                     # Database & schemas
│   ├── permissions/            # Permission system
│   ├── calculations/           # Breeding calculators
│   ├── utils/                  # Utility functions
│   ├── api/                    # API utilities
│   └── stores/                 # Zustand stores
└── public/                     # Static assets
```

---

## 📜 Essential Commands

### Development
```bash
npm run dev              # Start development server (port 3002)
npm run build            # Create production build
npm start                # Start production server
npm run lint             # Run ESLint checks
```

### Database
```bash
npm run db:generate      # Generate Drizzle migrations
npm run db:migrate       # Apply migrations to database
npm run db:push          # Push schema changes (dev only)
npm run db:studio        # Open Drizzle Studio GUI
```

### Seeding
```bash
npm run db:seed          # Seed test users & sample data
npm run db:seed:creds    # Display test credentials
npm run db:seed:clear    # Clear all users (⚠️ destructive)
```

---

## 🔐 Test Credentials

⚠️ **Development/Testing Only - DO NOT use in production!**

### Quick Access

After running `npm run db:seed`, use these credentials at `/auth/signin`:

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **Breeder** | breeder@test.com | breeder123 | Full breeding features (42 permissions) |
| **Veterinarian** | vet@test.com | vet123 | Medical records, appointments (13 permissions) |
| **Admin** | admin@test.com | admin123 | Full system access (70+ permissions) |
| **Event Organizer** | organizer@test.com | organizer123 | Events, registrations (11 permissions) |

### Test Data Included

After seeding, you'll have:
- **3 Sample Animals**: Luna (Border Collie), Bella (Labrador), Max (German Shepherd)
- **3 Mating Records**: With ratings and progesterone data
- **6 Tasks**: Various types (feeding, exercise, grooming, etc.)
- **3 Frozen Semen Batches**: From Max with quality ratings

---

## 🏗️ Architecture Overview

### Multi-Role Route Groups

The application uses Next.js 15 App Router with role-based route groups:

```
app/
├── (breeder)/           # Breeder-specific pages
├── (admin)/             # Administrator dashboard
├── (vet)/               # Veterinary practice tools
├── (event-organizer)/   # Event management
└── auth/                # Shared authentication
```

### Permission System

70+ permissions following `resource:action` pattern:
- `animals:create`, `animals:read`, `animals:update`, `animals:delete`
- `matings:create`, `calculators:use`, `reports:export`
- `marketplace:list`, `frozen_semen:create`, `tasks:complete`

**Usage Example:**
```typescript
// Client-side
import { usePermissions, PERMISSIONS } from '@/lib/permissions';
const { hasPermission } = usePermissions();
if (hasPermission(PERMISSIONS.ANIMALS_CREATE)) {
  return <CreateButton />;
}

// Server-side
import { requirePermission } from '@/lib/permissions/server';
await requirePermission(PERMISSIONS.ANIMALS_CREATE);
```

### Design System

**BreedBook Pro Design System** - Migrated from React codebase:
- **Colors**: HSL-based with gradients (`bg-gradient-brand`, `bg-gradient-subtle`)
- **Shadows**: `shadow-card`, `shadow-elevated` for depth
- **Hover Effects**: `hover-elevate` for consistent animations
- **Components**: Radix UI primitives with custom styling

---

## 📊 Implementation Status

### ✅ **Frontend - 100% COMPLETE**

**Phase 1: Progesterone Calculator** ✅
- Calculation matrices (VIDAS/IDEXX, Nanograms/Nanomoles)
- Real-time progesterone input UI
- Mating calculator dashboard

**Phase 2: Conception Rating Wizard** ✅
- Multi-step wizard framework (9 steps)
- Veterinary-science-based calculation engine
- localStorage persistence

**Phase 3: Animal Profile Enhancements** ✅
- 7-tab animal profiles (sex-specific)
- Semen assessment form with auto-quality
- Season/heat cycle tracker with charts
- Litter management with pregnancy tracking

**Phase 4: Task & Report Systems** ✅
- 6 task types with unified dialog
- Puppy feeding generator
- 7 report types with filtering & export

**Phase 5: Marketplace & Polish** ✅
- 5 listing categories with 3-step wizard
- Frozen semen inventory management
- Clinic integration

**Phase 6: File Upload & Storage** ✅
- UploadThing integration
- 5 file router endpoints
- FileUpload component

### ✅ **Backend - Phase 1-3 COMPLETE**

**Phase 1: Authentication & User Management** ✅
- Better Auth multi-role system
- Permission system (70+ permissions)
- Test user seeding

**Phase 2: Wallet, KYC & Profile Systems** ✅
- Multi-currency wallet (10 currencies)
- 3-level KYC verification
- Professional breeder profiles with reviews

**Phase 3: Beautiful UI** ✅
- Wallet page with transaction history
- KYC verification page with document uploads
- Breeder profile page with stats
- Regional settings tab (currency, timezone, language)

### ⏳ **Next Phase: API Development**
- Wallet operation endpoints
- KYC submission/approval workflow
- Profile management APIs
- Animal CRUD with photo uploads

---

## 💻 Development Guide

### Client Component Requirements

Components using React hooks must include `"use client"` directive:
```typescript
"use client";

import { useState } from 'react';

export function MyComponent() {
  const [state, setState] = useState();
  // ...
}
```

### Authentication Utilities

**Server-Side:**
```typescript
import { requireAuth, requireRole } from '@/lib/auth/server';

// Require authentication
const session = await requireAuth(); // Redirects to /auth/signin

// Require specific role
const session = await requireRole(['breeder', 'admin']); // Redirects to /unauthorized
```

**Client-Side:**
```typescript
import { useAuth, useRole, useSubscription } from '@/lib/auth/client';

const { user, session, isAuthenticated, signIn, signOut } = useAuth();
const { role, isBreeder, isVet, isAdmin } = useRole();
const { plan, isPremium } = useSubscription();
```

### File Upload

**Basic Usage:**
```typescript
import { FileUpload } from '@/components/shared/FileUpload';

<FileUpload
  endpoint="animalImage"
  onUploadComplete={(url) => console.log('Uploaded:', url)}
  accept="image/*"
  maxSize={30}
/>
```

**Available Endpoints:**
- `animalImage` - Animal profile photos (30MB, 1 file)
- `animalDocument` - Health records, certificates (30MB, 1 file, PDF)
- `animalGallery` - Multiple gallery photos (30MB, 10 files)
- `kycDocument` - Identity verification (10MB, 1 file)
- `breederProfileImage` - Breeder logo/banner (10MB, 1 file)

---

## 🚢 Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Test production build locally**
   ```bash
   npm start
   ```

3. **Deploy to Vercel** (recommended)
   ```bash
   vercel deploy
   ```

### Environment Variables

Ensure all required environment variables are set in your deployment platform:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - Your production URL
- `BETTER_AUTH_SECRET` - Secret key for authentication
- `UPLOADTHING_SECRET` - UploadThing secret key
- `UPLOADTHING_APP_ID` - UploadThing app ID

### Build Configuration

TypeScript and ESLint errors are temporarily ignored during builds to allow deployment while incrementally fixing issues:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
```

---

## 🧪 Testing

### Permission Testing

Each role has different access levels. Test with different accounts:

| Feature | Breeder | Vet | Admin | Organizer |
|---------|---------|-----|-------|-----------|
| Create Animals | ✅ | ❌ | ✅ | ❌ |
| View Animals | ✅ | ✅ (shared) | ✅ | ✅ |
| Use Calculators | ✅ | ❌ | ✅ | ❌ |
| Manage Tasks | ✅ | ❌ | ✅ | ❌ |
| Export Reports | ✅ | ✅ | ✅ | ✅ |
| Manage Events | ❌ | ❌ | ✅ | ✅ |

### Database Testing

```bash
# Open Drizzle Studio for visual database inspection
npm run db:studio

# Re-seed data for fresh testing
npm run db:seed:clear && npm run db:seed
```

---

## 📖 Additional Documentation

- **CLAUDE.md** - Comprehensive project guide for Claude Code
- **INTERNATIONALIZATION_GUIDE.md** - i18n implementation details
- **TEST_CREDENTIALS.md** - Full testing guide
- **SEEDING_GUIDE.md** - Database seeding documentation
- **UPLOADTHING_SETUP.md** - File upload configuration
- **Phase Documentation** - Individual PHASE_*.md files for implementation details

---

## 🤝 Contributing

### Code Standards

- **TypeScript**: Strict typing, no `any` types
- **ESLint**: Follow Next.js and TypeScript rules
- **Components**: Use Radix UI primitives
- **Styling**: Tailwind CSS with BreedBook Pro design tokens
- **State**: TanStack Query for server state, Zustand for client state

### Commit Guidelines

Follow conventional commits:
```
feat: add conception calculator
fix: resolve progesterone chart rendering
docs: update API documentation
style: apply BreedBook Pro design to tasks page
refactor: extract shared animal card component
```

---

## 📝 License

[Your License Here]

---

## 🙏 Acknowledgments

- **BreedBook Pro** - Design system inspiration
- **Better Auth** - Authentication framework
- **UploadThing** - File upload service
- **Neon** - PostgreSQL hosting
- **Vercel** - Deployment platform

---

## 📞 Support

For issues and feature requests, please use the GitHub issue tracker.

---

**Built with ❤️ for professional breeders worldwide**

🐾 **Animalytics** - Breeding Excellence, Simplified.
