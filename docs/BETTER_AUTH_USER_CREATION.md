# 🔐 Better Auth User Creation - Complete Guide

## 📋 **UNDERSTANDING BETTER AUTH ARCHITECTURE**

Better Auth separates user data from authentication credentials for security and flexibility.

---

## 🗄️ **DATABASE SCHEMA:**

### **1. `users` Table**
Stores user profile and application data.

```typescript
export const users = pgTable('users', {
  id: text('id').primaryKey(),           // ✅ User ID (cuid2)
  email: text('email').notNull().unique(), // ✅ Email
  emailVerified: boolean('email_verified'), // ✅ Email verification status
  name: text('name'),                     // ✅ Display name
  avatar: text('avatar'),                 // ✅ Profile image
  role: userRoleEnum('role'),             // ✅ User role
  organization: text('organization'),     // ✅ Organization name
  licenseNumber: text('license_number'),  // ✅ Professional license
  // ... other profile fields
  // ❌ NO PASSWORD FIELD HERE!
});
```

### **2. `accounts` Table**
Stores authentication credentials and provider data.

```typescript
export const accounts = pgTable('account', {
  id: text('id').primaryKey(),           // ✅ Account ID
  accountId: text('account_id'),         // ✅ Provider account ID
  providerId: text('provider_id'),       // ✅ Provider: 'credential', 'google', etc.
  userId: text('user_id').references(() => users.id), // ✅ Link to user
  password: text('password'),            // ✅ HASHED PASSWORD STORED HERE!
  accessToken: text('access_token'),     // For OAuth providers
  refreshToken: text('refresh_token'),   // For OAuth providers
  // ... other auth fields
});
```

---

## ✅ **CORRECT WAY TO CREATE USER WITH PASSWORD:**

### **Method 1: Using Better Auth API (Recommended)**
```typescript
// This is what the seeding scripts do
const response = await fetch(`${baseURL}/api/auth/sign-up/email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
  }),
});

// Better Auth automatically:
// 1. Generates user ID
// 2. Creates user record
// 3. Hashes password
// 4. Creates account record with hashed password
// 5. Links account to user
```

### **Method 2: Manual Database Insert (For Special Cases)**
```typescript
import { createId } from '@paralleldrive/cuid2';
import { hash } from 'bcrypt';
import { db } from '@/lib/db';
import { users, accounts } from '@/lib/db/schema';

// Generate IDs
const userId = createId();
const accountId = createId();

// Hash password
const hashedPassword = await hash(password, 10);

// Step 1: Create user record
const [newUser] = await db
  .insert(users)
  .values({
    id: userId,
    email: 'user@example.com',
    name: 'John Doe',
    role: 'veterinarian',
    emailVerified: true,
    isVerified: true,
  })
  .returning();

// Step 2: Create account record with password
await db
  .insert(accounts)
  .values({
    id: accountId,
    accountId: userId,        // Link to user
    providerId: 'credential', // Email/password authentication
    userId: userId,
    password: hashedPassword, // Store hashed password
  });
```

---

## ❌ **COMMON MISTAKES:**

### **Mistake 1: Trying to store password in users table**
```typescript
// ❌ WRONG - This will fail!
await db.insert(users).values({
  id: userId,
  email: 'user@example.com',
  password: hashedPassword, // ❌ users table has no password field!
});
```

**Error:**
```
Object literal may only specify known properties, 
and 'password' does not exist in type ...
```

### **Mistake 2: Not creating account record**
```typescript
// ❌ WRONG - User can't login!
await db.insert(users).values({
  id: userId,
  email: 'user@example.com',
  name: 'John Doe',
});
// Missing: account record with password!
```

**Result:** User exists but can't login (no credentials).

### **Mistake 3: Wrong providerId**
```typescript
// ❌ WRONG
await db.insert(accounts).values({
  providerId: 'email', // ❌ Should be 'credential'
  password: hashedPassword,
});
```

**Correct:** Use `'credential'` for email/password authentication.

---

## 🔍 **VET INVITATION ACCEPTANCE - COMPLETE FLOW:**

### **File:** `app/api/invitations/accept/route.ts`

```typescript
import { createId } from '@paralleldrive/cuid2';
import { hash } from 'bcrypt';
import { db } from '@/lib/db';
import { users, accounts, vetInvitations, clinicStaff } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  const { token, password, name } = await request.json();

  // 1. Verify invitation
  const invitation = await db.query.vetInvitations.findFirst({
    where: eq(vetInvitations.token, token),
  });

  if (!invitation || invitation.status !== 'pending') {
    return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
  }

  // 2. Generate IDs
  const userId = createId();
  const accountId = createId();

  // 3. Hash password
  const hashedPassword = await hash(password, 10);

  // 4. Create user record
  const [newUser] = await db
    .insert(users)
    .values({
      id: userId,
      email: invitation.email,
      name: name,
      role: 'veterinarian',
      emailVerified: true, // Auto-verify from invitation
      isVerified: true,
    })
    .returning();

  // 5. Create account record with password
  await db
    .insert(accounts)
    .values({
      id: accountId,
      accountId: userId,
      providerId: 'credential',
      userId: userId,
      password: hashedPassword,
    });

  // 6. Add to clinic staff
  await db.insert(clinicStaff).values({
    clinicId: invitation.clinicId,
    userId: newUser.id,
    role: invitation.role,
    status: 'active',
  });

  // 7. Mark invitation as accepted
  await db
    .update(vetInvitations)
    .set({ status: 'accepted', acceptedAt: new Date() })
    .where(eq(vetInvitations.token, token));

  // 8. Send welcome email
  await sendVetWelcomeEmail({
    email: newUser.email,
    firstName: newUser.name,
    clinicName: clinic.name,
  });

  return NextResponse.json({ success: true });
}
```

---

## 🎯 **KEY POINTS:**

### **1. Two-Step Process**
✅ Always create BOTH records:
1. User record (profile data)
2. Account record (authentication data)

### **2. Provider ID**
✅ Use `'credential'` for email/password authentication
✅ Use `'google'`, `'github'`, etc. for OAuth

### **3. Password Storage**
✅ Hash with bcrypt: `await hash(password, 10)`
✅ Store in `accounts.password` field
✅ NEVER store plain text passwords

### **4. ID Generation**
✅ Use `createId()` from `@paralleldrive/cuid2`
✅ Generate separate IDs for user and account
✅ Link account to user via `userId` field

### **5. Email Verification**
✅ Set `emailVerified: true` for invitation-based signups
✅ Set `emailVerified: false` for self-registration
✅ Better Auth handles verification flow

---

## 📦 **REQUIRED IMPORTS:**

```typescript
import { createId } from '@paralleldrive/cuid2'; // ID generation
import { hash } from 'bcrypt';                   // Password hashing
import { db } from '@/lib/db';                   // Database
import { users, accounts } from '@/lib/db/schema'; // Tables
```

---

## 🧪 **TESTING:**

### **1. Create User**
```bash
# Via invitation acceptance
POST /api/invitations/accept
{
  "token": "invitation_token_here",
  "password": "SecurePass123!",
  "name": "Dr. John Doe"
}
```

### **2. Verify User Can Login**
```bash
# Via Better Auth signin
POST /api/auth/sign-in/email
{
  "email": "vet@example.com",
  "password": "SecurePass123!"
}
```

### **3. Check Database**
```sql
-- User record
SELECT * FROM users WHERE email = 'vet@example.com';

-- Account record
SELECT * FROM account WHERE user_id = 'user_id_here';
-- Should see: providerId = 'credential', password = 'hashed_value'
```

---

## ✅ **SUMMARY:**

| Aspect | Users Table | Accounts Table |
|--------|-------------|----------------|
| **Purpose** | Profile data | Authentication data |
| **Password** | ❌ No | ✅ Yes (hashed) |
| **Email** | ✅ Yes | ❌ No |
| **Role** | ✅ Yes | ❌ No |
| **Provider** | ❌ No | ✅ Yes |
| **Link** | Primary key | Foreign key to users |

**Remember:** Better Auth = Two tables working together! 🔐
