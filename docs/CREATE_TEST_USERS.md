# How to Create Test Users

Since automatic seeding requires some Better Auth configuration adjustments, here's how to manually create the test users through the UI.

## Quick Setup (5 minutes)

### Step 1: Start the Server
```bash
npm run dev
```

### Step 2: Create Test Users

Go to: **http://localhost:3002/auth/signup**

Create each account with these credentials:

---

### 🐾 Account 1: Breeder
1. Select Role: **Breeder**
2. First Name: `John`
3. Last Name: `Smith`
4. Email: `breeder@test.com`
5. Password: `breeder123`
6. Confirm Password: `breeder123`
7. ✅ Check "I agree to the Terms"
8. Click **Create Account**

---

### 🩺 Account 2: Veterinarian
1. Select Role: **Veterinarian**
2. First Name: `Sarah`
3. Last Name: `Johnson`
4. Email: `vet@test.com`
5. Password: `vet123456`
6. Confirm Password: `vet123456`
7. ✅ Check "I agree to the Terms"
8. Click **Create Account**

---

### 👥 Account 3: Administrator
1. Select Role: **Administrator**
2. First Name: `Admin`
3. Last Name: `User`
4. Email: `admin@test.com`
5. Password: `admin123`
6. Confirm Password: `admin123`
7. ✅ Check "I agree to the Terms"
8. Click **Create Account**

---

### 📅 Account 4: Event Organizer
1. Select Role: **Event Organizer**
2. First Name: `Mike`
3. Last Name: `Wilson`
4. Email: `organizer@test.com`
5. Password: `organizer123`
6. Confirm Password: `organizer123`
7. ✅ Check "I agree to the Terms"
8. Click **Create Account**

---

## Testing Different Roles

After creating all accounts, test each role's permissions:

### Test Breeder Account
**Sign in:** breeder@test.com / breeder123

**Should have access to:**
- ✅ Dashboard
- ✅ My Animals (full CRUD)
- ✅ Mating Calculator
- ✅ All 7 Reports
- ✅ Tasks
- ✅ Marketplace (can create listings)
- ✅ Frozen Semen
- ✅ Breeders Network
- ✅ Documents
- ✅ Settings

### Test Veterinarian Account
**Sign in:** vet@test.com / vet123456

**Should have access to:**
- ✅ Dashboard
- ✅ Animals (read-only, shared animals)
- ✅ Reports (view/export only)
- ✅ Appointments (when implemented)
- ✅ Records (when implemented)
- ✅ Settings
- ❌ Cannot create/edit animals
- ❌ Cannot use calculators
- ❌ Cannot manage marketplace

### Test Admin Account
**Sign in:** admin@test.com / admin123

**Should have access to:**
- ✅ Everything (all 70+ permissions)
- ✅ User management (when implemented)
- ✅ System configuration
- ✅ Analytics
- ✅ All breeder features
- ✅ All vet features

### Test Event Organizer Account
**Sign in:** organizer@test.com / organizer123

**Should have access to:**
- ✅ Dashboard
- ✅ Animals (read-only)
- ✅ Reports (view/export)
- ✅ Events (when implemented)
- ✅ Registrations (when implemented)
- ✅ Results (when implemented)
- ✅ Settings
- ❌ Cannot create/edit animals
- ❌ Cannot use calculators

---

## Quick Reference Table

| Role | Email | Password |
|------|-------|----------|
| Breeder | breeder@test.com | breeder123 |
| Veterinarian | vet@test.com | vet123456 |
| Administrator | admin@test.com | admin123 |
| Event Organizer | organizer@test.com | organizer123 |

---

## Permission Testing Checklist

Use this checklist to verify permissions are working correctly:

### Breeder Tests
- [ ] Can create new animal
- [ ] Can edit own animals
- [ ] Can delete own animals
- [ ] Can use mating calculator
- [ ] Can view all 7 report types
- [ ] Can create marketplace listings
- [ ] Can manage frozen semen inventory

### Veterinarian Tests
- [ ] Can view dashboard
- [ ] Cannot see "Create Animal" button
- [ ] Can view reports
- [ ] Cannot access mating calculator
- [ ] Cannot create marketplace listings
- [ ] Redirected from unauthorized pages

### Admin Tests
- [ ] Has access to all features
- [ ] No "Access Denied" messages
- [ ] Can access all pages

### Event Organizer Tests
- [ ] Can view dashboard
- [ ] Can view animals (read-only)
- [ ] Cannot edit animals
- [ ] Cannot access calculators
- [ ] Can view reports

---

## Troubleshooting

### Can't create account?
- Check password is at least 8 characters
- Make sure email is unique
- Check "I agree to terms" is checked

### Getting "Access Denied"?
- Check you're signed in with correct role
- Admin account has all permissions
- Some features vary by role (expected behavior)

### Forgot which account you're using?
- Check top-right corner for user name
- Sign out and sign in with different account

---

## After Testing

Once you've created all test accounts and verified permissions work correctly, you can:

1. **Sign Out** - Top right corner
2. **Switch Accounts** - Sign out, then sign in with different credentials
3. **Test Features** - Try creating animals, viewing reports, etc.
4. **Verify Permissions** - Check that unauthorized features are hidden/blocked

---

**Happy Testing! 🚀**

All 4 test accounts give you complete coverage of the permission system!
