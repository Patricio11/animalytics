# Test User Credentials

⚠️ **IMPORTANT: These are development/testing credentials only. DO NOT use in production!**

## Quick Start

1. **Seed the database**:
   ```bash
   npm run db:seed
   ```

2. **View credentials anytime**:
   ```bash
   npm run db:seed:creds
   ```

3. **Sign in**:
   - Go to `http://localhost:3002/auth/signin`
   - Enter credentials for the role you want to test
   - Click "Sign In"

## Test Accounts

### 🐾 Breeder Account
**Full breeding management features**

- **Email**: `breeder@test.com`
- **Password**: `breeder123`
- **Name**: John Smith
- **Role**: Breeder
- **Subscription**: Premium
- **Permissions**: 42 permissions
  - Full animal management (CRUD)
  - Mating & calculations
  - All 7 report types
  - Task management
  - Marketplace CRUD
  - Frozen semen CRUD
  - Documents management
  - Breeders network

**Use this account to test**:
- Animal profiles with tabs
- Mating calculator
- Progesterone & conception calculators
- Reports generation
- Task management with puppy feeding generator
- Marketplace listings
- Frozen semen inventory

---

### 🩺 Veterinarian Account
**Medical records and appointments**

- **Email**: `vet@test.com`
- **Password**: `vet123`
- **Name**: Dr. Sarah Johnson
- **Role**: Veterinarian
- **Subscription**: Free
- **Permissions**: 13 permissions
  - Read shared animals
  - View matings
  - View/export reports
  - Appointments CRUD
  - Records CRUD

**Use this account to test**:
- Limited access (read-only for shared animals)
- Appointment management
- Medical records
- Reports viewing

---

### 👥 Administrator Account
**Full system access**

- **Email**: `admin@test.com`
- **Password**: `admin123`
- **Name**: Admin User
- **Role**: Admin
- **Subscription**: Enterprise
- **Permissions**: All 70+ permissions
  - Full access to everything
  - User management
  - System configuration
  - Analytics

**Use this account to test**:
- Admin dashboard
- User management
- System settings
- All features with full access

---

### 📅 Event Organizer Account
**Competition and event management**

- **Email**: `organizer@test.com`
- **Password**: `organizer123`
- **Name**: Mike Wilson
- **Role**: Event Organizer
- **Subscription**: Free
- **Permissions**: 11 permissions
  - Read animals
  - View/export reports
  - Events CRUD
  - Registrations management
  - Results management

**Use this account to test**:
- Event creation and management
- Registration handling
- Results tracking
- Limited animal viewing

---

## Database Commands

### Seed Database
Creates test users with the credentials above:
```bash
npm run db:seed
```

### Clear Database
**WARNING**: Deletes ALL users from database:
```bash
npm run db:seed:clear
```

### View Credentials
Display test credentials without seeding:
```bash
npm run db:seed:creds
```

---

## Permission Testing

### Testing Permission-Based UI
Each role has different permissions. Use the test accounts to verify:

1. **UI Elements** - Buttons/features should hide based on permissions
2. **Page Access** - Unauthorized pages redirect to `/unauthorized`
3. **API Protection** - API routes return 403 for unauthorized actions

### Example: Animal Management

| Action | Breeder | Vet | Admin | Organizer |
|--------|---------|-----|-------|-----------|
| Create Animal | ✅ | ❌ | ✅ | ❌ |
| View Animals | ✅ | ✅ (shared) | ✅ | ✅ |
| Edit Animal | ✅ | ❌ | ✅ | ❌ |
| Delete Animal | ✅ | ❌ | ✅ | ❌ |

### Example: Reports

| Report Type | Breeder | Vet | Admin | Organizer |
|-------------|---------|-----|-------|-----------|
| View Reports | ✅ | ✅ | ✅ | ✅ |
| Export Reports | ✅ | ✅ | ✅ | ✅ |
| Mating History | ✅ | ❌ | ✅ | ❌ |
| Events Report | ✅ | ❌ | ✅ | ✅ |

---

## Security Notes

### Development Only
- These credentials are **hardcoded for testing only**
- Passwords are simple for easy testing
- **NEVER use these in production**

### Production Considerations
- Use strong, unique passwords
- Enable email verification
- Implement rate limiting
- Add 2FA for admin accounts
- Remove test accounts before deploying

---

## Troubleshooting

### Can't sign in?
1. Check database is seeded: `npm run db:seed`
2. Check database connection in `.env.local`
3. View credentials: `npm run db:seed:creds`

### Getting 403 errors?
- Check you're using the correct role for the feature
- Admin account has all permissions
- Check permission definitions in `lib/permissions/definitions.ts`

### Database errors?
1. Run migrations: `npm run db:migrate`
2. Clear and reseed: `npm run db:seed:clear && npm run db:seed`
3. Check PostgreSQL connection

---

## Quick Reference

```bash
# Database Management
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:push          # Push schema changes
npm run db:studio        # Open Drizzle Studio

# Seeding
npm run db:seed          # Seed test users
npm run db:seed:clear    # Clear all users
npm run db:seed:creds    # Show credentials

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
```

---

## Feature Access Matrix

### Breeder Features
- ✅ Dashboard with stats
- ✅ Animal management (full CRUD)
- ✅ Mating calculator
- ✅ Progesterone calculator
- ✅ Conception rating calculator
- ✅ All 7 report types
- ✅ Task management
- ✅ Puppy feeding generator
- ✅ Marketplace (create listings)
- ✅ Frozen semen inventory
- ✅ Breeders network
- ✅ Documents
- ✅ Settings

### Veterinarian Features
- ✅ Dashboard
- ✅ View shared animals (read-only)
- ✅ Appointments
- ✅ Medical records
- ✅ View reports
- ✅ Settings
- ❌ Cannot create/edit animals
- ❌ Cannot use calculators
- ❌ Cannot manage tasks

### Admin Features
- ✅ Everything (all 70+ permissions)
- ✅ User management
- ✅ System configuration
- ✅ Analytics
- ✅ All breeder features
- ✅ All vet features
- ✅ All organizer features

### Event Organizer Features
- ✅ Dashboard
- ✅ View animals (read-only)
- ✅ Events management
- ✅ Registrations
- ✅ Results
- ✅ View reports
- ✅ Settings
- ❌ Cannot create/edit animals
- ❌ Cannot use calculators
- ❌ Cannot manage marketplace

---

**Happy Testing! 🚀**
