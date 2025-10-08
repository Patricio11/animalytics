# Animalyzer Backend Implementation Plan

## Technology Stack (Confirmed)

```typescript
const TECH_STACK = {
  runtime: "Node.js 20+",
  framework: "Next.js 15 App Router",
  language: "TypeScript 5+",
  database: "PostgreSQL 16+",
  orm: "Drizzle ORM",
  auth: "Better Auth",
  stateManagement: {
    local: "React useState/useReducer",
    global: "Zustand (wizard only)",
    server: "TanStack Query v5",
    forms: "React Hook Form"
  },
  validation: "Zod",
  apiStyle: "Next.js App Router Route Handlers",
  deployment: "Vercel (recommended)"
}
```

---

## PHASE 1: Authentication & User Management (CRITICAL FIRST)

### Task 1.1: Setup Better Auth with Multi-Role System

**Goal**: Implement complete authentication with role-based access control

**Installation:**
```bash
npm install better-auth
npm install @better-auth/drizzle-adapter
npm install zod
```

**Files to Create:**

```
lib/auth/
  ├── config.ts                         # Better Auth configuration
  ├── client.ts                         # Client-side auth hooks
  └── middleware.ts                     # Auth middleware

lib/db/
  ├── index.ts                          # Drizzle client
  └── schema/
      ├── users.ts                      # User & auth tables
      └── roles.ts                      # Role & permission tables
```

**Implementation:**

1. **Database Schema** (`lib/db/schema/users.ts`)
```typescript
import { pgTable, text, timestamp, uuid, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['breeder', 'veterinarian', 'admin', 'event_organizer']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  name: text('name'),
  image: text('image'),
  role: userRoleEnum('role').default('breeder'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires').notNull(),
});
```

2. **Better Auth Configuration** (`lib/auth/config.ts`)
```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/users";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verificationTokens,
    }
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    // Add more providers as needed
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "breeder",
        input: false, // Don't allow setting via signup
      }
    }
  }
});

export type Session = typeof auth.$Infer.Session;
```

3. **Client-Side Auth Hooks** (`lib/auth/client.ts`)
```typescript
'use client';

import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});

// Custom hooks
export const useAuth = () => {
  const { data: session, isPending } = authClient.useSession();
  
  return {
    user: session?.user,
    session,
    isLoading: isPending,
    isAuthenticated: !!session,
    signIn: authClient.signIn,
    signOut: authClient.signOut,
    signUp: authClient.signUp,
  };
};

export const useRole = () => {
  const { user } = useAuth();
  
  return {
    role: user?.role || 'breeder',
    isBreeder: user?.role === 'breeder',
    isVet: user?.role === 'veterinarian',
    isAdmin: user?.role === 'admin',
    isEventOrganizer: user?.role === 'event_organizer',
  };
};
```

4. **Route Protection Middleware** (`middleware.ts` - root)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';

const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/forgot-password'];
const roleRoutes = {
  breeder: ['/dashboard', '/animals', '/calculators', '/tasks'],
  veterinarian: ['/vet-dashboard', '/appointments', '/records'],
  admin: ['/admin-dashboard', '/users', '/system'],
  event_organizer: ['/events', '/registrations'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check authentication
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  // Check role-based access
  const userRole = session.user.role;
  const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || [];
  
  const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));
  
  if (!hasAccess) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

5. **Auth API Routes** (`app/api/auth/[...all]/route.ts`)
```typescript
import { auth } from "@/lib/auth/config";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

**Environment Variables:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/animalyzer

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Acceptance Criteria:**
- [ ] Users can sign up with email/password
- [ ] Email verification works
- [ ] Users can sign in/out
- [ ] Sessions persist across refreshes
- [ ] Role-based route protection works
- [ ] Google OAuth works (optional)
- [ ] Middleware blocks unauthorized access

---

### Task 1.2: Update Auth Pages to Use Better Auth

**Files to Modify:**
```
app/auth/
  ├── signin/page.tsx
  ├── signup/page.tsx
  ├── forgot-password/page.tsx
  └── verify-email/page.tsx
```

**Implementation:**

Replace mock authentication with real Better Auth calls:

```typescript
'use client';

import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  
  const handleSignIn = async (email: string, password: string) => {
    try {
      await authClient.signIn.email({
        email,
        password,
      });
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };
  
  // ... rest of UI
}
```

**Acceptance Criteria:**
- [ ] Sign in page uses Better Auth
- [ ] Sign up page creates real users
- [ ] Forgot password sends reset emails
- [ ] Email verification works
- [ ] Redirects to correct role dashboard

---

### Task 1.3: Implement Permission System

**Files to Create:**
```
lib/permissions/
  ├── index.ts                          # Permission utilities
  ├── definitions.ts                    # Permission definitions
  └── hooks.ts                          # Permission hooks

lib/db/schema/
  └── permissions.ts                    # Permission tables
```

**Database Schema** (`lib/db/schema/permissions.ts`)
```typescript
import { pgTable, text, uuid, timestamp, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users';

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // e.g., 'animals:create', 'matings:view'
  description: text('description'),
  resource: text('resource').notNull(), // e.g., 'animals', 'matings'
  action: text('action').notNull(), // e.g., 'create', 'read', 'update', 'delete'
});

export const rolePermissions = pgTable('role_permissions', {
  role: text('role').notNull(),
  permissionId: uuid('permission_id').references(() => permissions.id).notNull(),
}, (table) => ({
  pk: primaryKey(table.role, table.permissionId),
}));

export const userPermissions = pgTable('user_permissions', {
  userId: uuid('user_id').references(() => users.id).notNull(),
  permissionId: uuid('permission_id').references(() => permissions.id).notNull(),
  granted: boolean('granted').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: primaryKey(table.userId, table.permissionId),
}));
```

**Permission Definitions** (`lib/permissions/definitions.ts`)
```typescript
export const PERMISSIONS = {
  // Animal Management
  ANIMALS_CREATE: 'animals:create',
  ANIMALS_READ: 'animals:read',
  ANIMALS_UPDATE: 'animals:update',
  ANIMALS_DELETE: 'animals:delete',
  ANIMALS_SHARE: 'animals:share',
  
  // Mating & Calculations
  MATINGS_CREATE: 'matings:create',
  MATINGS_READ: 'matings:read',
  MATINGS_UPDATE: 'matings:update',
  MATINGS_DELETE: 'matings:delete',
  
  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  
  // Marketplace
  MARKETPLACE_LIST: 'marketplace:list',
  MARKETPLACE_CREATE: 'marketplace:create',
  
  // Admin
  USERS_MANAGE: 'users:manage',
  SYSTEM_CONFIG: 'system:config',
} as const;

export const ROLE_PERMISSIONS = {
  breeder: [
    PERMISSIONS.ANIMALS_CREATE,
    PERMISSIONS.ANIMALS_READ,
    PERMISSIONS.ANIMALS_UPDATE,
    PERMISSIONS.ANIMALS_DELETE,
    PERMISSIONS.ANIMALS_SHARE,
    PERMISSIONS.MATINGS_CREATE,
    PERMISSIONS.MATINGS_READ,
    PERMISSIONS.MATINGS_UPDATE,
    PERMISSIONS.MATINGS_DELETE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.MARKETPLACE_LIST,
    PERMISSIONS.MARKETPLACE_CREATE,
  ],
  veterinarian: [
    PERMISSIONS.ANIMALS_READ, // Shared animals only
    PERMISSIONS.MATINGS_READ,
    PERMISSIONS.REPORTS_VIEW,
  ],
  admin: Object.values(PERMISSIONS),
  event_organizer: [
    PERMISSIONS.ANIMALS_READ,
    PERMISSIONS.REPORTS_VIEW,
  ],
};
```

**Permission Hooks** (`lib/permissions/hooks.ts`)
```typescript
'use client';

import { useRole } from '@/lib/auth/client';
import { ROLE_PERMISSIONS } from './definitions';

export function usePermissions() {
  const { role } = useRole();
  
  const hasPermission = (permission: string): boolean => {
    const rolePerms = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
    return rolePerms.includes(permission);
  };
  
  const canCreate = (resource: string) => hasPermission(`${resource}:create`);
  const canRead = (resource: string) => hasPermission(`${resource}:read`);
  const canUpdate = (resource: string) => hasPermission(`${resource}:update`);
  const canDelete = (resource: string) => hasPermission(`${resource}:delete`);
  
  return {
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
  };
}

// Usage in components:
// const { canCreate } = usePermissions();
// {canCreate('animals') && <Button>Add Animal</Button>}
```

**Acceptance Criteria:**
- [ ] Permission schema in database
- [ ] Role-permission mappings defined
- [ ] usePermissions hook works
- [ ] UI conditionally renders based on permissions
- [ ] API routes check permissions

---

## PHASE 2: Database Setup & Core Models

### Task 2.1: Setup Drizzle ORM and PostgreSQL

**Installation:**
```bash
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
npm install dotenv
```

**Files to Create:**
```
drizzle.config.ts                       # Drizzle configuration
lib/db/
  ├── index.ts                          # DB client
  ├── migrate.ts                        # Migration runner
  └── schema/
      ├── index.ts                      # Export all schemas
      ├── users.ts                      # (Already created)
      ├── animals.ts                    # Animal tables
      ├── matings.ts                    # Mating & calculations
      ├── tasks.ts                      # Task management
      └── marketplace.ts                # Marketplace listings
```

**Drizzle Configuration** (`drizzle.config.ts`)
```typescript
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './lib/db/schema/*',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

**Database Client** (`lib/db/index.ts`)
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });
```

**Package.json Scripts:**
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:migrate": "tsx lib/db/migrate.ts",
    "db:studio": "drizzle-kit studio"
  }
}
```

**Acceptance Criteria:**
- [ ] PostgreSQL running locally or on Supabase/Neon
- [ ] Drizzle ORM connected
- [ ] Can run migrations
- [ ] Drizzle Studio works for data viewing

---

### Task 2.2: Create Animal Management Schema

**File:** `lib/db/schema/animals.ts`

```typescript
import { pgTable, text, uuid, timestamp, decimal, date, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const sexEnum = pgEnum('sex', ['male', 'female']);
export const semenTypeEnum = pgEnum('semen_type', ['fresh', 'chilled', 'frozen']);

// Main animal table
export const animals = pgTable('animals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  breedId: uuid('breed_id').notNull(), // Reference to breeds table
  sex: sexEnum('sex').notNull(),
  dateOfBirth: date('date_of_birth'),
  microchipNumber: text('microchip_number'),
  registrationNumber: text('registration_number'),
  weight: decimal('weight', { precision: 5, scale: 2 }),
  color: text('color'),
  profileImageUrl: text('profile_image_url'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Breeds reference table
export const breeds = pgTable('breeds', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  successRating: decimal('success_rating', { precision: 2, scale: 1 }), // 1.0, 2.0, 3.0
  sizeCategory: text('size_category'), // small, medium, large
});

// Animal photos and documents
export const animalFiles = pgTable('animal_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  category: text('category').notNull(), // shelter, whelping_areas, vaccinations, pedigree, etc.
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(), // image, video, document
  fileName: text('file_name'),
  fileSize: decimal('file_size'), // in MB
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

// Feeding plans
export const feedingPlans = pgTable('feeding_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  foodType: text('food_type'),
  amount: text('amount'),
  frequency: text('frequency'),
  timeOfDay: jsonb('time_of_day').$type<string[]>(), // ['08:00', '16:00']
  specialNotes: text('special_notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Semen assessments
export const semenAssessments = pgTable('semen_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  assessmentDate: date('assessment_date').notNull(),
  assessmentType: text('assessment_type').notNull(), // visual, full
  semenQuality: text('semen_quality'), // For visual: poor, fair, good, excellent
  volume: decimal('volume', { precision: 5, scale: 2 }), // ml
  concentration: decimal('concentration', { precision: 10, scale: 2 }), // million/ml
  motility: decimal('motility', { precision: 5, scale: 2 }), // percentage
  morphology: decimal('morphology', { precision: 5, scale: 2 }), // percentage normal
  progressiveMotility: decimal('progressive_motility', { precision: 5, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Seasons/heat cycles (bitches only)
export const seasons = pgTable('seasons', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Litter records
export const litters = pgTable('litters', {
  id: uuid('id').primaryKey().defaultRandom(),
  bitchId: uuid('bitch_id').references(() => animals.id).notNull(),
  sireId: uuid('sire_id').references(() => animals.id),
  frozenSemenId: uuid('frozen_semen_id'), // Reference to frozen semen if used
  matingDate: date('mating_date').notNull(),
  expectedWhelpingDate: date('expected_whelping_date'),
  actualWhelpingDate: date('actual_whelping_date'),
  puppyCount: decimal('puppy_count', { precision: 3, scale: 0 }),
  survivingPuppies: decimal('surviving_puppies', { precision: 3, scale: 0 }),
  complications: text('complications'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Frozen semen inventory
export const frozenSemen = pgTable('frozen_semen', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  sourceAnimalId: uuid('source_animal_id').references(() => animals.id),
  collectionDate: date('collection_date').notNull(),
  clinic: text('clinic'),
  strawCount: decimal('straw_count', { precision: 5, scale: 0 }),
  batchIdentifier: text('batch_identifier'),
  storageLocation: text('storage_location'),
  notes: text('notes'),
  isAvailable: boolean('is_available').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Animal sharing (for vets, co-owners)
export const animalShares = pgTable('animal_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  sharedWithUserId: uuid('shared_with_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accessLevel: text('access_level').notNull(), // read, write
  sharedAt: timestamp('shared_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
});
```

**Acceptance Criteria:**
- [ ] Schema compiles with no TypeScript errors
- [ ] Migrations generated successfully
- [ ] Can create/read animals in database
- [ ] All relationships defined correctly
- [ ] Drizzle Studio shows all tables

---

### Task 2.3: Create Mating & Calculation Schema

**File:** `lib/db/schema/matings.ts`

```typescript
import { pgTable, text, uuid, timestamp, decimal, date, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { animals, frozenSemen } from './animals';
import { users } from './users';

export const laboratoryEnum = pgEnum('laboratory', ['VIDAS', 'IDEXX']);
export const unitEnum = pgEnum('unit', ['nanograms', 'nanomoles']);
export const breedingMethodEnum = pgEnum('breeding_method', ['natural_ai', 'tci', 'surgical_ai', 'frozen']);
export const matingStatusEnum = pgEnum('mating_status', ['planned', 'confirmed', 'unsuccessful', 'resulted_in_litter']);

// Main mating record
export const matings = pgTable('matings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  bitchId: uuid('bitch_id').references(() => animals.id).notNull(),
  dogId: uuid('dog_id').references(() => animals.id'),
  frozenSemenId: uuid('frozen_semen_id').references(() => frozenSemen.id),
  matingDate: date('mating_date').notNull(),
  breedingMethod: breedingMethodEnum('breeding_method').notNull(),
  semenType: text('semen_type'), // fresh, chilled, frozen
  status: matingStatusEnum('status').default('planned'),
  
  // Calculated ratings
  progesteroneRating: decimal('progesterone_rating', { precision: 5, scale: 2 }),
  conceptionRating: decimal('conception_rating', { precision: 5, scale: 2 }),
  overallRating: decimal('overall_rating', { precision: 5, scale: 2 }),
  informationAccuracy: decimal('information_accuracy', { precision: 3, scale: 1 }), // 0-5 stars
  
  // Conception calculator data (stored as JSONB for flexibility)
  calculationData: jsonb('calculation_data').$type<{
    breed: any;
    bitchInfo: any;
    bitchHistory: any;
    litterHistory: any;
    dogHistory: any;
    breederHistory: any;
    semenInfo: any;
    semenAssessment: any;
  }>(),
  
  // Rating breakdown
  ratingBreakdown: jsonb('rating_breakdown').$type<{
    breed: { contribution: number; maxPossible: number };
    bitchInfo: { contribution: number; maxPossible: number };
    bitchHistory: { contribution: number; maxPossible: number };
    litterHistory: { contribution: number; maxPossible: number };
    dogHistory: { contribution: number; maxPossible: number };
    breederHistory: { contribution: number; maxPossible: number };
    semenQuality: { contribution: number; maxPossible: number };
  }>(),
  
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Progesterone readings
export const progesteroneReadings = pgTable('progesterone_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  matingId: uuid('mating_id').references(() => matings.id, { onDelete: 'cascade' }),
  seasonId: uuid('season_id'), // Can also be linked to a season without mating
  dayNumber: decimal('day_number', { precision: 1, scale: 0 }).notNull(), // 0-5
  value: decimal('value', { precision: 6, scale: 2 }).notNull(),
  laboratory: laboratoryEnum('laboratory').notNull(),
  unit: unitEnum('unit').notNull(),
  readingDate: date('reading_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Conception rating history (for tracking multiple calculations)
export const conceptionRatingHistory = pgTable('conception_rating_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  matingId: uuid('mating_id').references(() => matings.id, { onDelete: 'cascade' }).notNull(),
  calculationType: text('calculation_type').notNull(), // 'mating', 'bitch_only', 'dog_only'
  calculatedAt: timestamp('calculated_at').defaultNow(),
  rating: decimal('rating', { precision: 5, scale: 2 }).notNull(),
  inputData: jsonb('input_data'),
  breakdown: jsonb('breakdown'),
});
```

**Acceptance Criteria:**
- [ ] Mating schema supports all calculation types
- [ ] Progesterone readings linked correctly
- [ ] JSONB fields handle complex calculation data
- [ ] Relationships to animals and frozen semen work
- [ ] Can store rating breakdowns

---

### Task 2.4: Create Tasks & Reports Schema

**File:** `lib/db/schema/tasks.ts`

```typescript
import { pgTable, text, uuid, timestamp, date, boolean, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { animals } from './animals';
import { users } from './users';

export const taskTypeEnum = pgEnum('task_type', [
  'feeding',
  'exercise',
  'grooming',
  'weight',
  'cleaning',
  'event',
  'puppy_feeding',
  'misc'
]);

export const eventTypeEnum = pgEnum('event_type', [
  'vet_visit',
  'worming',
  'heartworm',
  'flea_tick',
  'rugging',
  'pest_management',
  'other'
]);

export const taskStatusEnum = pgEnum('task_status', ['pending', 'completed', 'skipped']);

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }),
  type: taskTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: date('due_date'),
  dueTime: text('due_time'), // HH:MM format
  status: taskStatusEnum('status').default('pending'),
  completedAt: timestamp('completed_at'),
  
  // Task-specific data
  taskData: jsonb('task_data').$type<{
    // Feeding
    foodType?: string;
    amount?: string;
    
    // Exercise
    exerciseType?: string;
    duration?: number;
    
    // Grooming
    groomingType?: string;
    
    // Weight
    weight?: number;
    
    // Cleaning
    area?: string;
    cleaningType?: string;
    
    // Event
    eventType?: string;
    location?: string;
    
    // Misc
    notes?: string;
  }>(),
  
  // Recurring task settings
  isRecurring: boolean('is_recurring').default(false),
  recurringPattern: text('recurring_pattern'), // daily, weekly, monthly
  recurringUntil: date('recurring_until'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Task reminders
export const taskReminders = pgTable('task_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  reminderTime: timestamp('reminder_time').notNull(),
  sent: boolean('sent').default(false),
  sentAt: timestamp('sent_at'),
});

// Weight tracking (separate table for historical data)
export const weightRecords = pgTable('weight_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  weight: decimal('weight', { precision: 5, scale: 2 }).notNull(),
  recordedDate: date('recorded_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Acceptance Criteria:**
- [ ] All task types supported
- [ ] Recurring task pattern stored
- [ ] Weight tracking separate for historical analysis
- [ ] Task reminders can be scheduled
- [ ] Animal relationship optional (for general tasks)

---

### Task 2.5: Create Marketplace Schema

**File:** `lib/db/schema/marketplace.ts`

```typescript
import { pgTable, text, uuid, timestamp, decimal, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { animals, frozenSemen } from './animals';
import { users } from './users';

export const listingCategoryEnum = pgEnum('listing_category', [
  'dog_for_sale',
  'pups_for_sale',
  'reproductive_services',
  'frozen_semen',
  'stud_dog'
]);

export const listingStatusEnum = pgEnum('listing_status', [
  'draft',
  'active',
  'sold',
  'expired',
  'removed'
]);

export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  category: listingCategoryEnum('category').notNull(),
  
  // Can be linked to animal or frozen semen
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }),
  frozenSemenId: uuid('frozen_semen_id').references(() => frozenSemen.id, { onDelete: 'cascade' }),
  
  title: text('title').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  
  // Contact details
  contactName: text('contact_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  location: text('location'),
  
  // For reproductive services and frozen semen
  clinic: text('clinic'),
  
  // Additional images (beyond animal profile)
  additionalImages: jsonb('additional_images').$type<string[]>(),
  
  // Listing metadata
  status: listingStatusEnum('status').default('draft'),
  viewCount: decimal('view_count', { precision: 10, scale: 0 }).default('0'),
  featured: boolean('featured').default(false),
  expiresAt: timestamp('expires_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Listing inquiries
export const listingInquiries = pgTable('listing_inquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),
  inquirerUserId: uuid('inquirer_user_id').references(() => users.id),
  inquirerEmail: text('inquirer_email').notNull(),
  inquirerName: text('inquirer_name').notNull(),
  message: text('message').notNull(),
  replied: boolean('replied').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Saved listings (favorites)
export const savedListings = pgTable('saved_listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),
  savedAt: timestamp('saved_at').defaultNow(),
});
```

**Acceptance Criteria:**
- [ ] All listing categories supported
- [ ] Can link to animals or frozen semen
- [ ] Contact details stored securely
- [ ] Inquiry system ready
- [ ] Saved listings (favorites) work

---

## PHASE 3: API Routes & Business Logic

### Task 3.1: Create API Structure

**Directory Structure:**
```
app/api/
  ├── auth/[...all]/route.ts            # (Already created)
  ├── animals/
  │   ├── route.ts                      # GET (list), POST (create)
  │   ├── [id]/route.ts                 # GET, PATCH, DELETE
  │   ├── [id]/photos/route.ts          # File uploads
  │   └── [id]/share/route.ts           # Share with other users
  ├── matings/
  │   ├── route.ts                      # GET (list), POST (create)
  │   ├── [id]/route.ts                 # GET, PATCH, DELETE
  │   ├── [id]/progesterone/route.ts    # Progesterone readings
  │   └── [id]/calculate/route.ts       # Run calculations
  ├── tasks/
  │   ├── route.ts                      # GET (list), POST (create)
  │   ├── [id]/route.ts                 # GET, PATCH, DELETE
  │   └── [id]/complete/route.ts        # Mark complete
  ├── reports/
  │   ├── feeding/route.ts
  │   ├── exercise/route.ts
  │   └── mating-history/route.ts
  ├── marketplace/
  │   ├── route.ts                      # GET (list), POST (create)
  │   ├── [id]/route.ts                 # GET, PATCH, DELETE
  │   └── [id]/inquire/route.ts         # Send inquiry
  └── breeds/
      └── route.ts                      # GET (list breeds)
```

**API Response Format:**
```typescript
// lib/api/response.ts
export function successResponse<T>(data: T, message?: string) {
  return Response.json({
    success: true,
    data,
    message,
  });
}

export function errorResponse(error: string, statusCode: number = 400) {
  return Response.json(
    {
      success: false,
      error,
    },
    { status: statusCode }
  );
}
```

---

### Task 3.2: Implement Animals API

**File:** `app/api/animals/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/response';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema
const createAnimalSchema = z.object({
  name: z.string().min(1).max(255),
  breedId: z.string().uuid(),
  sex: z.enum(['male', 'female']),
  dateOfBirth: z.string().optional(),
  microchipNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  weight: z.number().optional(),
  color: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/animals - List all animals for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }
    
    const userAnimals = await db.query.animals.findMany({
      where: eq(animals.userId, session.user.id),
      with: {
        breed: true,
      },
      orderBy: (animals, { desc }) => [desc(animals.createdAt)],
    });
    
    return successResponse(userAnimals);
  } catch (error) {
    console.error('Error fetching animals:', error);
    return errorResponse('Failed to fetch animals', 500);
  }
}

// POST /api/animals - Create new animal
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }
    
    const body = await request.json();
    const validatedData = createAnimalSchema.parse(body);
    
    const newAnimal = await db.insert(animals).values({
      ...validatedData,
      userId: session.user.id,
    }).returning();
    
    return successResponse(newAnimal[0], 'Animal created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0].message, 400);
    }
    console.error('Error creating animal:', error);
    return errorResponse('Failed to create animal', 500);
  }
}
```

**File:** `app/api/animals/[id]/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/response';
import { eq, and } from 'drizzle-orm';

// GET /api/animals/[id] - Get single animal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }
    
    const animal = await db.query.animals.findFirst({
      where: and(
        eq(animals.id, params.id),
        eq(animals.userId, session.user.id)
      ),
      with: {
        breed: true,
        files: true,
        feedingPlans: true,
        semenAssessments: true,
        seasons: true,
        litters: true,
      },
    });
    
    if (!animal) {
      return errorResponse('Animal not found', 404);
    }
    
    return successResponse(animal);
  } catch (error) {
    console.error('Error fetching animal:', error);
    return errorResponse('Failed to fetch animal', 500);
  }
}

// PATCH /api/animals/[id] - Update animal
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }
    
    const body = await request.json();
    
    const updated = await db.update(animals)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(and(
        eq(animals.id, params.id),
        eq(animals.userId, session.user.id)
      ))
      .returning();
    
    if (!updated.length) {
      return errorResponse('Animal not found', 404);
    }
    
    return successResponse(updated[0], 'Animal updated successfully');
  } catch (error) {
    console.error('Error updating animal:', error);
    return errorResponse('Failed to update animal', 500);
  }
}

// DELETE /api/animals/[id] - Delete animal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }
    
    await db.delete(animals)
      .where(and(
        eq(animals.id, params.id),
        eq(animals.userId, session.user.id)
      ));
    
    return successResponse(null, 'Animal deleted successfully');
  } catch (error) {
    console.error('Error deleting animal:', error);
    return errorResponse('Failed to delete animal', 500);
  }
}
```

**Acceptance Criteria:**
- [ ] Can list user's animals
- [ ] Can create new animals with validation
- [ ] Can get single animal with all related data
- [ ] Can update animal details
- [ ] Can delete animals
- [ ] Unauthorized users blocked

---

### Task 3.3: Implement Matings & Calculations API

**File:** `app/api/matings/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { matings, progesteroneReadings } from '@/lib/db/schema/matings';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/response';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createMatingSchema = z.object({
  bitchId: z.string().uuid(),
  dogId: z.string().uuid().optional(),
  frozenSemenId: z.string().uuid().optional(),
  matingDate: z.string(),
  breedingMethod: z.enum(['natural_ai', 'tci', 'surgical_ai', 'frozen']),
  semenType: z.string().optional(),
});

// GET /api/matings - List all matings
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }
    
    const userMatings = await db.query.matings.findMany({
      where: eq(matings.userId, session.user.id),
      with: {
        bitch: true,
        dog: true,
        progesteroneReadings: true,
      },
      orderBy: (matings, { desc }) => [desc(matings.matingDate)],
    });
    
    return successResponse(userMatings);
  } catch (error) {
    console.error('Error fetching matings:', error);
    return errorResponse('Failed to fetch matings', 500);
  }
}

// POST /api/matings - Create new mating
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }
    
    const body = await request.json();
    const validatedData = createMatingSchema.parse(body);
    
    const newMating = await db.insert(matings).values({
      ...validatedData,
      userId: session.user.id,
      status: 'planned',
    }).returning();
    
    return successResponse(newMating[0], 'Mating created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0].message, 400);
    }
    console.error('Error creating mating:', error);
    return errorResponse('Failed to create mating', 500);
  }
}
```

**File:** `app/api/matings/[id]/calculate/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { matings } from '@/lib/db/schema/matings';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/response';
import { eq, and } from 'drizzle-orm';
import { calculateProgesteroneRating } from '@/lib/calculations/progesterone-calculator';
import { calculateConceptionRating } from '@/lib/calculations/conception-rating';

// POST /api/matings/[id]/calculate - Run all calculations
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }
    
    const body = await request.json();
    
    // 1. Calculate progesterone rating
    const progesteroneResult = calculateProgesteroneRating({
      laboratory: body.laboratory,
      unit: body.unit,
      breedingMethod: body.breedingMethod,
      readings: body.progesteroneReadings,
    });
    
    // 2. Calculate conception rating
    const conceptionResult = calculateConceptionRating({
      breed: body.breed,
      bitchInfo: body.bitchInfo,
      bitchHistory: body.bitchHistory,
      litterHistory: body.litterHistory,
      dogHistory: body.dogHistory,
      breederHistory: body.breederHistory,
      semenInfo: body.semenInfo,
      semenAssessment: body.semenAssessment,
    });
    
    // 3. Calculate overall rating (weighted average)
    const overallRating = (progesteroneResult.rating * 10 + conceptionResult.overallRating) / 2;
    
    // 4. Update mating record
    const updated = await db.update(matings)
      .set({
        progesteroneRating: progesteroneResult.rating * 10, // Convert to percentage
        conceptionRating: conceptionResult.overallRating,
        overallRating,
        informationAccuracy: conceptionResult.informationAccuracy,
        calculationData: body,
        ratingBreakdown: conceptionResult.breakdown,
        updatedAt: new Date(),
      })
      .where(and(
        eq(matings.id, params.id),
        eq(matings.userId, session.user.id)
      ))
      .returning();
    
    if (!updated.length) {
      return errorResponse('Mating not found', 404);
    }
    
    return successResponse({
      mating: updated[0],
      progesteroneResult,
      conceptionResult,
    }, 'Calculations completed successfully');
  } catch (error) {
    console.error('Error calculating ratings:', error);
    return errorResponse('Failed to calculate ratings', 500);
  }
}
```

**Acceptance Criteria:**
- [ ] Can create matings
- [ ] Can list matings with related data
- [ ] Calculation endpoint runs both progesterone and conception ratings
- [ ] Results stored in database
- [ ] Rating breakdown saved for display

---

## PHASE 4: Frontend Integration with TanStack Query

### Task 4.1: Setup TanStack Query

**Installation:**
```bash
npm install @tanstack/react-query
npm install @tanstack/react-query-devtools
```

**Files to Create:**
```
lib/api/
  ├── client.ts                         # API client utilities
  └── queries/
      ├── animals.ts                    # Animal queries
      ├── matings.ts                    # Mating queries
      ├── tasks.ts                      # Task queries
      └── marketplace.ts                # Marketplace queries

app/providers.tsx                       # Query provider wrapper
```

**Query Provider** (`app/providers.tsx`)
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.Node }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Update** `app/layout.tsx`:
```typescript
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

---

### Task 4.2: Create API Query Hooks

**File:** `lib/api/queries/animals.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/client';

// API client functions
async function fetchAnimals() {
  const response = await fetch('/api/animals');
  if (!response.ok) throw new Error('Failed to fetch animals');
  return response.json();
}

async function fetchAnimal(id: string) {
  const response = await fetch(`/api/animals/${id}`);
  if (!response.ok) throw new Error('Failed to fetch animal');
  return response.json();
}

async function createAnimal(data: any) {
  const response = await fetch('/api/animals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create animal');
  return response.json();
}

async function updateAnimal({ id, data }: { id: string; data: any }) {
  const response = await fetch(`/api/animals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update animal');
  return response.json();
}

async function deleteAnimal(id: string) {
  const response = await fetch(`/api/animals/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete animal');
  return response.json();
}

// React Query hooks
export function useAnimals() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['animals'],
    queryFn: fetchAnimals,
    enabled: isAuthenticated,
  });
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: ['animals', id],
    queryFn: () => fetchAnimal(id),
    enabled: !!id,
  });
}

export function useCreateAnimal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
    },
  });
}

export function useUpdateAnimal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateAnimal,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animals', variables.id] });
    },
  });
}

export function useDeleteAnimal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
    },
  });
}
```

**File:** `lib/api/queries/matings.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

async function fetchMatings() {
  const response = await fetch('/api/matings');
  if (!response.ok) throw new Error('Failed to fetch matings');
  return response.json();
}

async function fetchMating(id: string) {
  const response = await fetch(`/api/matings/${id}`);
  if (!response.ok) throw new Error('Failed to fetch mating');
  return response.json();
}

async function createMating(data: any) {
  const response = await fetch('/api/matings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create mating');
  return response.json();
}

async function calculateMating({ id, data }: { id: string; data: any }) {
  const response = await fetch(`/api/matings/${id}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to calculate ratings');
  return response.json();
}

// React Query hooks
export function useMatings() {
  return useQuery({
    queryKey: ['matings'],
    queryFn: fetchMatings,
  });
}

export function useMating(id: string) {
  return useQuery({
    queryKey: ['matings', id],
    queryFn: () => fetchMating(id),
    enabled: !!id,
  });
}

export function useCreateMating() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createMating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matings'] });
    },
  });
}

export function useCalculateMating() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: calculateMating,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matings'] });
      queryClient.invalidateQueries({ queryKey: ['matings', variables.id] });
    },
  });
}
```

**Acceptance Criteria:**
- [ ] TanStack Query installed and configured
- [ ] Query hooks created for animals and matings
- [ ] Automatic cache invalidation works
- [ ] DevTools available in development
- [ ] Loading and error states handled

---

### Task 4.3: Replace Mock Data with Real API Calls

**Example: Update Animals Page** (`app/(breeder)/animals/page.tsx`)

**Before (Mock Data):**
```typescript
'use client';

import { mockAnimals } from '@/lib/mock-data/animals';

export default function AnimalsPage() {
  const animals = mockAnimals;
  
  return (
    <div>
      {animals.map(animal => (
        <AnimalCard key={animal.id} animal={animal} />
      ))}
    </div>
  );
}
```

**After (Real API):**
```typescript
'use client';

import { useAnimals, useDeleteAnimal } from '@/lib/api/queries/animals';
import { AnimalCard } from '@/components/breeder/animals/AnimalCard';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AnimalsPage() {
  const { data, isLoading, error } = useAnimals();
  const deleteMutation = useDeleteAnimal();
  const { toast } = useToast();
  
  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Animal deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete animal',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center text-destructive">
        Error loading animals. Please try again.
      </div>
    );
  }
  
  const animals = data?.data || [];
  
  return (
    <div>
      {animals.map(animal => (
        <AnimalCard 
          key={animal.id} 
          animal={animal}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

**Files to Update:**
- `app/(breeder)/animals/page.tsx`
- `app/(breeder)/animals/[id]/page.tsx`
- `app/(breeder)/calculators/mating/page.tsx`
- `app/(breeder)/calculators/mating/[id]/page.tsx`
- `app/(breeder)/dashboard/page.tsx`
- `app/(breeder)/tasks/page.tsx`

**Acceptance Criteria:**
- [ ] All pages fetch real data from API
- [ ] Loading states show properly
- [ ] Error states display user-friendly messages
- [ ] Mutations trigger cache invalidation
- [ ] Optimistic updates for better UX (optional)

---

## PHASE 5: Wizard State Management with Zustand

### Task 5.1: Setup Zustand for Wizard State

**Installation:**
```bash
npm install zustand
```

**File:** `lib/stores/conception-wizard-store.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ConceptionWizardState {
  // Current step
  currentStep: number;
  
  // Form data for all steps
  breed: any;
  bitchInfo: any;
  bitchHistory: any;
  litterHistory: any;
  dogHistory: any;
  breederHistory: any;
  semenInfo: any;
  semenAssessment: any;
  
  // Mating context
  matingId: string | null;
  
  // Actions
  setCurrentStep: (step: number) => void;
  updateBreed: (data: any) => void;
  updateBitchInfo: (data: any) => void;
  updateBitchHistory: (data: any) => void;
  updateLitterHistory: (data: any) => void;
  updateDogHistory: (data: any) => void;
  updateBreederHistory: (data: any) => void;
  updateSemenInfo: (data: any) => void;
  updateSemenAssessment: (data: any) => void;
  setMatingId: (id: string) => void;
  reset: () => void;
  getAllData: () => any;
}

const initialState = {
  currentStep: 0,
  breed: null,
  bitchInfo: null,
  bitchHistory: null,
  litterHistory: null,
  dogHistory: null,
  breederHistory: null,
  semenInfo: null,
  semenAssessment: null,
  matingId: null,
};

export const useConceptionWizardStore = create<ConceptionWizardState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      updateBreed: (data) => set({ breed: data }),
      updateBitchInfo: (data) => set({ bitchInfo: data }),
      updateBitchHistory: (data) => set({ bitchHistory: data }),
      updateLitterHistory: (data) => set({ litterHistory: data }),
      updateDogHistory: (data) => set({ dogHistory: data }),
      updateBreederHistory: (data) => set({ breederHistory: data }),
      updateSemenInfo: (data) => set({ semenInfo: data }),
      updateSemenAssessment: (data) => set({ semenAssessment: data }),
      
      setMatingId: (id) => set({ matingId: id }),
      
      reset: () => set(initialState),
      
      getAllData: () => ({
        breed: get().breed,
        bitchInfo: get().bitchInfo,
        bitchHistory: get().bitchHistory,
        litterHistory: get().litterHistory,
        dogHistory: get().dogHistory,
        breederHistory: get().breederHistory,
        semenInfo: get().semenInfo,
        semenAssessment: get().semenAssessment,
      }),
    }),
    {
      name: 'conception-wizard-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

**File:** `lib/stores/progesterone-store.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProgesteroneReading {
  day: number;
  value: number;
  date: Date;
}

interface ProgesteroneState {
  laboratory: 'VIDAS' | 'IDEXX' | null;
  unit: 'nanograms' | 'nanomoles' | null;
  breedingMethod: 'natural_ai' | 'tci' | 'surgical_ai' | 'frozen' | null;
  readings: ProgesteroneReading[];
  matingId: string | null;
  
  setLaboratory: (lab: 'VIDAS' | 'IDEXX') => void;
  setUnit: (unit: 'nanograms' | 'nanomoles') => void;
  setBreedingMethod: (method: string) => void;
  addReading: (reading: ProgesteroneReading) => void;
  updateReading: (day: number, reading: ProgesteroneReading) => void;
  removeReading: (day: number) => void;
  setMatingId: (id: string) => void;
  reset: () => void;
}

export const useProgesteroneStore = create<ProgesteroneState>()(
  persist(
    (set) => ({
      laboratory: null,
      unit: null,
      breedingMethod: null,
      readings: [],
      matingId: null,
      
      setLaboratory: (lab) => set({ laboratory: lab }),
      setUnit: (unit) => set({ unit }),
      setBreedingMethod: (method) => set({ breedingMethod: method as any }),
      
      addReading: (reading) =>
        set((state) => ({
          readings: [...state.readings, reading].sort((a, b) => a.day - b.day),
        })),
      
      updateReading: (day, reading) =>
        set((state) => ({
          readings: state.readings.map((r) =>
            r.day === day ? reading : r
          ),
        })),
      
      removeReading: (day) =>
        set((state) => ({
          readings: state.readings.filter((r) => r.day !== day),
        })),
      
      setMatingId: (id) => set({ matingId: id }),
      
      reset: () =>
        set({
          laboratory: null,
          unit: null,
          breedingMethod: null,
          readings: [],
          matingId: null,
        }),
    }),
    {
      name: 'progesterone-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

**Acceptance Criteria:**
- [ ] Zustand stores created for wizard state
- [ ] State persists to localStorage
- [ ] Can navigate through wizard with state preserved
- [ ] Reset functionality works
- [ ] State hydration works on page reload

---

### Task 5.2: Update Wizard Components to Use Zustand

**Example: Update Conception Wizard** (`components/breeder/calculators/wizard/WizardContainer.tsx`)

**Before:**
```typescript
'use client';

import { useState } from 'react';

export function WizardContainer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  
  // ... wizard logic
}
```

**After:**
```typescript
'use client';

import { useConceptionWizardStore } from '@/lib/stores/conception-wizard-store';
import { useCalculateMating } from '@/lib/api/queries/matings';

export function WizardContainer({ matingId }: { matingId: string }) {
  const {
    currentStep,
    setCurrentStep,
    getAllData,
    reset,
  } = useConceptionWizardStore();
  
  const calculateMutation = useCalculateMating();
  
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleSubmit = async () => {
    const data = getAllData();
    
    try {
      await calculateMutation.mutateAsync({
        id: matingId,
        data,
      });
      
      // Show success and redirect
      reset();
    } catch (error) {
      // Show error
    }
  };
  
  return (
    <div>
      {/* Wizard UI with Zustand state */}
    </div>
  );
}
```

**Files to Update:**
- `components/breeder/calculators/wizard/WizardContainer.tsx`
- `components/breeder/calculators/wizard/steps/*`
- `components/breeder/calculators/ProgesteroneInputForm.tsx`

**Acceptance Criteria:**
- [ ] Wizard uses Zustand for state management
- [ ] "Save & Continue" persists across sessions
- [ ] Can exit and resume wizard
- [ ] State clears on successful submission
- [ ] Pre-population from animal profiles works

---

## PHASE 6: File Upload & Storage

### Task 6.1: Setup File Upload API

**Installation:**
```bash
npm install @uploadthing/react uploadthing
# OR use AWS S3 directly:
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Option A: UploadThing (Easier)**

**File:** `app/api/uploadthing/core.ts`

```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth/config";

const f = createUploadthing();

export const ourFileRouter = {
  animalImage: f({ image: { maxFileSize: "30MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
    
  animalDocument: f({ pdf: { maxFileSize: "30MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

**File:** `app/api/uploadthing/route.ts`

```typescript
import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});
```

**File:** `lib/uploadthing.ts`

```typescript
import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
```

**Option B: AWS S3 (More Control)**

**File:** `lib/storage/s3.ts`

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File, key: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });
  
  await s3Client.send(command);
  
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function getPresignedUrl(key: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function deleteFromS3(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });
  
  await s3Client.send(command);
}
```

**My Recommendation**: Start with **UploadThing** for simplicity, migrate to S3 later if needed.

---

### Task 6.2: Create File Upload Component

**File:** `components/shared/FileUpload.tsx`

```typescript
'use client';

import { useUploadThing } from '@/lib/uploadthing';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface FileUploadProps {
  category: string;
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUpload({
  category,
  onUploadComplete,
  accept = 'image/*',
  maxSize = 30,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  const { startUpload } = useUploadThing('animalImage', {
    onClientUploadComplete: (res) => {
      setUploading(false);
      if (res?.[0]?.url) {
        onUploadComplete(res[0].url);
        setPreview(res[0].url);
      }
    },
    onUploadError: (error) => {
      setUploading(false);
      console.error('Upload error:', error);
    },
  });
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }
    
    setUploading(true);
    await startUpload([file]);
  };
  
  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <Image
            src={preview}
            alt="Upload preview"
            width={200}
            height={200}
            className="rounded-lg object-cover"
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={() => setPreview(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${category}`}
            disabled={uploading}
          />
          <label htmlFor={`file-upload-${category}`} className="cursor-pointer">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: {maxSize}MB
                </p>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] File upload works with drag & drop
- [ ] Preview shows before upload
- [ ] File size validation
- [ ] Loading state during upload
- [ ] Error handling
- [ ] Upload URL returned to parent component

---

### Task 6.3: Integrate File Upload with Animal Profiles

**Update:** `components/breeder/animals/PhotosDocsTab.tsx`

```typescript
'use client';

import { FileUpload } from '@/components/shared/FileUpload';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const CATEGORIES = [
  'shelter',
  'whelping_areas',
  'vaccinations',
  'pedigree',
  'council_registration',
  'parents',
  'baby_photos',
];

export function PhotosDocsTab({ animalId }: { animalId: string }) {
  const [selectedCategory, setSelectedCategory] = useState('shelter');
  const queryClient = useQueryClient();
  
  const uploadMutation = useMutation({
    mutationFn: async ({ category, url }: { category: string; url: string }) => {
      const response = await fetch(`/api/animals/${animalId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, fileUrl: url, fileType: 'image' }),
      });
      if (!response.ok) throw new Error('Failed to save file');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals', animalId] });
    },
  });
  
  const handleUploadComplete = (url: string) => {
    uploadMutation.mutate({ category: selectedCategory, url });
  };
  
  return (
    <div>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="mb-4"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat.replace('_', ' ')}
          </option>
        ))}
      </select>
      
      <FileUpload
        category={selectedCategory}
        onUploadComplete={handleUploadComplete}
      />
      
      {/* Display existing photos */}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Can select category before upload
- [ ] Upload saves to database with animal ID
- [ ] Existing photos display in grid
- [ ] Can delete photos
- [ ] 10-item limit per category enforced

---

## PHASE 7: Testing & Deployment

### Task 7.1: Add Integration Tests

**Installation:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**File:** `__tests__/api/animals.test.ts`

```typescript
import { describe, it, expect, beforeAll } from 'vitest';

describe('Animals API', () => {
  it('should create a new animal', async () => {
    const response = await fetch('http://localhost:3000/api/animals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Dog',
        breedId: 'breed-id',
        sex: 'male',
      }),
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

---

### Task 7.2: Environment Setup for Production

**File:** `.env.example`

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/animalyzer

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=https://yourdomain.com

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# File Upload (UploadThing)
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# OR AWS S3
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

### Task 7.3: Deploy to Vercel

**Steps:**
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Vercel Configuration** (`vercel.json`):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

**Database Options:**
- **Neon** (Recommended): Serverless Postgres
- **Supabase**: Postgres + Auth + Storage
- **Railway**: Simple deployment

---

## Implementation Timeline

```
WEEK 1-2: Authentication & Database Setup
  ├── Phase 1: Better Auth implementation ✓
  ├── Phase 2: Database schema & migrations ✓
  └── Test: Auth flows and database connections ✓

WEEK 3-4: Core API Development
  ├── Phase 3: Animals & Matings APIs ✓
  ├── Phase 3: Tasks & Marketplace APIs ✓
  └── Test: API endpoints with Postman ✓

WEEK 5: Frontend Integration
  ├── Phase 4: TanStack Query setup ✓
  ├── Phase 4: Replace mock data with API calls ✓
  └── Test: End-to-end user flows ✓

WEEK 6: Wizard State & File Uploads
  ├── Phase 5: Zustand stores for wizards ✓
  ├── Phase 6: File upload implementation ✓
  └── Test: Wizard persistence and uploads ✓

WEEK 7: Testing & Polish
  ├── Phase 7: Integration tests ✓
  ├── Phase 7: Bug fixes and optimization ✓
  └── Phase 7: Deploy to production ✓
```

---

## Final Tech Stack Summary

```typescript
const FINAL_STACK = {
  // Frontend
  framework: "Next.js 15 App Router",
  language: "TypeScript 5+",
  styling: "Tailwind CSS + BreedBook Pro Design",
  ui: "Radix UI + shadcn/ui",
  
  // State Management
  local: "React useState/useReducer (primary)",
  global: "Zustand (wizard state only)",
  server: "TanStack Query v5",
  forms: "React Hook Form + Zod",
  
  // Backend
  database: "PostgreSQL 16+",
  orm: "Drizzle ORM",
  auth: "Better Auth",
  api: "Next.js Route Handlers",
  
  // Storage
  files: "UploadThing (or AWS S3)",
  
  // Deployment
  hosting: "Vercel",
  database: "Neon/Supabase",
}
```

---

## Summary & Recommendation

**My Final Recommendation as a Full-Stack Engineer:**

✅ **Use this exact stack** - it's modern, type-safe, and scales well

✅ **State Management**: React Built-in (90%) + Zustand (10% for wizards) + TanStack Query for server state

✅ **Start with Phase 1 (Authentication)** - everything depends on it

✅ **Build iteratively** - get one feature working end-to-end before moving to the next

✅ **Don't over-engineer** - the hybrid state management approach keeps things simple while handling complex wizards

**This plan gives you a production-ready backend architecture that matches your sophisticated frontend.**
