# Animalyzer Backend Implementation Plan (UPDATED)

> **Updated to match completed BreedBook Pro design with all features from CLAUDE.md**

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
  deployment: "Vercel (recommended)",
  fileStorage: "UploadThing or AWS S3"
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
import { pgTable, text, timestamp, uuid, boolean, pgEnum, jsonb } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['breeder', 'veterinarian', 'admin', 'event_organizer']);
export const planEnum = pgEnum('plan', ['free', 'premium', 'professional', 'enterprise']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  name: text('name'),
  avatar: text('avatar'), // Profile image URL
  role: userRoleEnum('role').default('breeder'),

  // Vet/Professional fields
  organization: text('organization'),
  licenseNumber: text('license_number'),
  certifications: jsonb('certifications').$type<string[]>(),
  specializations: jsonb('specializations').$type<string[]>(),

  // User preferences (from mockData.ts)
  preferences: jsonb('preferences').$type<{
    notifications: boolean;
    emailUpdates: boolean;
    darkMode: boolean;
    language: string;
    timezone: string;
  }>().default({
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC'
  }),

  // Subscription management
  subscription: jsonb('subscription').$type<{
    plan: 'free' | 'premium' | 'professional' | 'enterprise';
    expiresAt?: string;
    features: string[];
  }>().default({
    plan: 'free',
    features: []
  }),

  // Permissions array
  permissions: jsonb('permissions').$type<string[]>().default([]),

  isVerified: boolean('is_verified').default(false),
  lastLogin: timestamp('last_login'),
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
        input: false,
      },
      preferences: {
        type: "object",
        defaultValue: {
          notifications: true,
          emailUpdates: true,
          darkMode: false,
          language: 'en',
          timezone: 'UTC'
        },
        input: false,
      },
      subscription: {
        type: "object",
        defaultValue: {
          plan: 'free',
          features: []
        },
        input: false,
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

export const useSubscription = () => {
  const { user } = useAuth();

  return {
    plan: user?.subscription?.plan || 'free',
    features: user?.subscription?.features || [],
    isPremium: user?.subscription?.plan === 'premium',
    isProfessional: user?.subscription?.plan === 'professional',
    isEnterprise: user?.subscription?.plan === 'enterprise',
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
  breeder: ['/dashboard', '/animals', '/calculators', '/tasks', '/reports', '/marketplace', '/frozen-semen', '/breeders', '/documents', '/settings'],
  veterinarian: ['/dashboard', '/appointments', '/records'],
  admin: ['/dashboard', '/users', '/system'],
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
- [ ] User preferences stored correctly
- [ ] Subscription plan tracked

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
import { useToast } from '@/hooks/use-toast';

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState('');

  const handleSignIn = async (email: string, password: string) => {
    try {
      await authClient.signIn.email({
        email,
        password,
      });
      router.push('/dashboard');
      toast({
        title: 'Success',
        description: 'Signed in successfully',
      });
    } catch (err) {
      setError('Invalid credentials');
      toast({
        title: 'Error',
        description: 'Invalid credentials',
        variant: 'destructive',
      });
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
- [ ] Error handling with toasts

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

  // Calculators
  CALCULATORS_USE: 'calculators:use',
  CALCULATORS_PROGESTERONE: 'calculators:progesterone',
  CALCULATORS_CONCEPTION: 'calculators:conception',

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  REPORTS_FEEDING: 'reports:feeding',
  REPORTS_EXERCISE: 'reports:exercise',
  REPORTS_GROOMING: 'reports:grooming',
  REPORTS_CLEANING: 'reports:cleaning',
  REPORTS_PUPPIES: 'reports:puppies',
  REPORTS_MATING_HISTORY: 'reports:mating_history',

  // Tasks
  TASKS_CREATE: 'tasks:create',
  TASKS_READ: 'tasks:read',
  TASKS_UPDATE: 'tasks:update',
  TASKS_DELETE: 'tasks:delete',
  TASKS_COMPLETE: 'tasks:complete',

  // Marketplace
  MARKETPLACE_LIST: 'marketplace:list',
  MARKETPLACE_CREATE: 'marketplace:create',
  MARKETPLACE_UPDATE: 'marketplace:update',
  MARKETPLACE_DELETE: 'marketplace:delete',

  // Frozen Semen
  FROZEN_SEMEN_CREATE: 'frozen_semen:create',
  FROZEN_SEMEN_READ: 'frozen_semen:read',
  FROZEN_SEMEN_UPDATE: 'frozen_semen:update',
  FROZEN_SEMEN_DELETE: 'frozen_semen:delete',

  // Documents
  DOCUMENTS_CREATE: 'documents:create',
  DOCUMENTS_READ: 'documents:read',
  DOCUMENTS_DELETE: 'documents:delete',

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
    PERMISSIONS.CALCULATORS_USE,
    PERMISSIONS.CALCULATORS_PROGESTERONE,
    PERMISSIONS.CALCULATORS_CONCEPTION,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_FEEDING,
    PERMISSIONS.REPORTS_EXERCISE,
    PERMISSIONS.REPORTS_GROOMING,
    PERMISSIONS.REPORTS_CLEANING,
    PERMISSIONS.REPORTS_PUPPIES,
    PERMISSIONS.REPORTS_MATING_HISTORY,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.TASKS_COMPLETE,
    PERMISSIONS.MARKETPLACE_LIST,
    PERMISSIONS.MARKETPLACE_CREATE,
    PERMISSIONS.MARKETPLACE_UPDATE,
    PERMISSIONS.MARKETPLACE_DELETE,
    PERMISSIONS.FROZEN_SEMEN_CREATE,
    PERMISSIONS.FROZEN_SEMEN_READ,
    PERMISSIONS.FROZEN_SEMEN_UPDATE,
    PERMISSIONS.FROZEN_SEMEN_DELETE,
    PERMISSIONS.DOCUMENTS_CREATE,
    PERMISSIONS.DOCUMENTS_READ,
    PERMISSIONS.DOCUMENTS_DELETE,
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
- [ ] Role-permission mappings defined for all features
- [ ] usePermissions hook works
- [ ] UI conditionally renders based on permissions
- [ ] API routes check permissions
- [ ] All 7 report types have permissions
- [ ] Tasks, frozen semen, documents have permissions

---

