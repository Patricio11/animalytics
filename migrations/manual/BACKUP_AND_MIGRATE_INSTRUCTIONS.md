# Database Backup and Migration Instructions

## ⚠️ IMPORTANT: Follow These Steps in Order

### Step 1: Create Full Database Backup (Recommended)

Create a complete database dump as a safety measure:

```powershell
# Navigate to project directory
cd "C:\Users\patri\Downloads\animal\the system\animalytics"

# Create backup with timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
pg_dump -U postgres animalytics > "backups\animalytics_backup_$timestamp.sql"
```

### Step 2: Create Table-Level Backup (Quick)

This creates backup tables within the database:

```powershell
psql -U postgres -d animalytics -f "migrations\manual\backup_database.sql"
```

**Expected Output:**
```
BEGIN
CREATE SCHEMA
DROP TABLE
CREATE TABLE AS
...
COMMIT
```

### Step 3: Run the Migration

After backup is complete, run the migration:

```powershell
psql -U postgres -d animalytics -f "migrations\manual\rename_buyer_to_pet_owner.sql"
```

**Expected Output:**
```
BEGIN
ALTER TABLE
ALTER TABLE
...
COMMIT
Migration complete!
```

### Step 4: Verify Migration

Check that columns were renamed correctly:

```powershell
psql -U postgres -d animalytics -c "\d conversations"
psql -U postgres -d animalytics -c "\d purchases"
psql -U postgres -d animalytics -c "SELECT role, COUNT(*) FROM users GROUP BY role;"
```

### Step 5: Restart Development Server

```powershell
npm run dev
```

---

## 🔄 Rollback Instructions (If Needed)

If something goes wrong, you can restore from backup:

### Option 1: Restore from Full Dump
```powershell
# Drop and recreate database
psql -U postgres -c "DROP DATABASE animalytics;"
psql -U postgres -c "CREATE DATABASE animalytics;"

# Restore from backup
psql -U postgres animalytics < "backups\animalytics_backup_TIMESTAMP.sql"
```

### Option 2: Restore Individual Tables
```sql
-- Connect to database
psql -U postgres animalytics

-- Restore from backup schema
BEGIN;

-- Restore buyer_profiles
DROP TABLE IF EXISTS buyer_profiles CASCADE;
CREATE TABLE buyer_profiles AS 
SELECT * FROM backup_pre_migration.buyer_profiles_backup;

-- Restore conversations
DROP TABLE IF EXISTS conversations CASCADE;
CREATE TABLE conversations AS 
SELECT * FROM backup_pre_migration.conversations_backup;

-- Restore purchases
DROP TABLE IF EXISTS purchases CASCADE;
CREATE TABLE purchases AS 
SELECT * FROM backup_pre_migration.purchases_backup;

-- Restore purchase_timeline
DROP TABLE IF EXISTS purchase_timeline CASCADE;
CREATE TABLE purchase_timeline AS 
SELECT * FROM backup_pre_migration.purchase_timeline_backup;

-- Restore wallet_transactions
DROP TABLE IF EXISTS wallet_transactions CASCADE;
CREATE TABLE wallet_transactions AS 
SELECT * FROM backup_pre_migration.wallet_transactions_backup;

-- Restore users
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users AS 
SELECT * FROM backup_pre_migration.users_backup;

COMMIT;
```

---

## 📋 Pre-Migration Checklist

- [ ] Created full database dump
- [ ] Created table-level backups
- [ ] Verified backup file exists and has data
- [ ] Stopped development server
- [ ] No active database connections

## 📋 Post-Migration Checklist

- [ ] Migration completed without errors
- [ ] Verified column names changed
- [ ] Verified user roles updated
- [ ] Restarted development server
- [ ] Tested application routes
- [ ] No console errors

---

## 🔍 Verification Queries

After migration, run these to verify:

```sql
-- Check pet_owner_profiles table exists
SELECT COUNT(*) FROM pet_owner_profiles;

-- Check conversations has pet_owner_id column
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND column_name LIKE '%pet_owner%';

-- Check purchases has pet_owner_id column
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'purchases' 
AND column_name LIKE '%pet_owner%';

-- Check user roles
SELECT role, COUNT(*) 
FROM users 
GROUP BY role;

-- Verify no buyer_id columns remain
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE column_name LIKE '%buyer_id%'
AND table_schema = 'public';
```

---

## 📞 Troubleshooting

### Error: "relation already exists"
- The migration has already been partially run
- Check which tables exist with `\dt` in psql
- May need to manually fix schema

### Error: "column does not exist"
- Database schema doesn't match code
- Check column names with `\d table_name`
- Verify migration ran completely

### Error: "type already exists"
- Enum types already exist
- This is normal, migration will skip them
- Check with: `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype;`

---

## ✅ Success Indicators

After successful migration, you should see:

1. **No `buyer_id` columns** in conversations, purchases, wallet_transactions
2. **`pet_owner_id` columns** exist in those tables
3. **`pet_owner_profiles` table** exists
4. **User roles** show `pet_owner` instead of `buyer`
5. **Dev server starts** without database errors
6. **Routes work** at `/pet-owner/*`

---

**Ready to proceed? Run the backup script first!**
