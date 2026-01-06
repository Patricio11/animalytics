import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function backupTables() {
  console.log('🔄 Starting backup process...\n');

  try {
    // Create backup schema
    console.log('📦 Creating backup schema...');
    await sql`CREATE SCHEMA IF NOT EXISTS backup_pre_migration`;
    console.log('✅ Backup schema created\n');

    // Backup buyer_profiles
    console.log('📦 Backing up buyer_profiles...');
    await sql`DROP TABLE IF EXISTS backup_pre_migration.buyer_profiles_backup CASCADE`;
    await sql`CREATE TABLE backup_pre_migration.buyer_profiles_backup AS SELECT * FROM buyer_profiles`;
    const buyerProfilesCount = await sql`SELECT COUNT(*) as count FROM backup_pre_migration.buyer_profiles_backup`;
    console.log(`✅ Backed up ${buyerProfilesCount[0].count} buyer profiles\n`);

    // Backup conversations
    console.log('📦 Backing up conversations...');
    await sql`DROP TABLE IF EXISTS backup_pre_migration.conversations_backup CASCADE`;
    await sql`CREATE TABLE backup_pre_migration.conversations_backup AS SELECT * FROM conversations`;
    const conversationsCount = await sql`SELECT COUNT(*) as count FROM backup_pre_migration.conversations_backup`;
    console.log(`✅ Backed up ${conversationsCount[0].count} conversations\n`);

    // Backup purchases
    console.log('📦 Backing up purchases...');
    await sql`DROP TABLE IF EXISTS backup_pre_migration.purchases_backup CASCADE`;
    await sql`CREATE TABLE backup_pre_migration.purchases_backup AS SELECT * FROM purchases`;
    const purchasesCount = await sql`SELECT COUNT(*) as count FROM backup_pre_migration.purchases_backup`;
    console.log(`✅ Backed up ${purchasesCount[0].count} purchases\n`);

    // Backup purchase_timeline
    console.log('📦 Backing up purchase_timeline...');
    await sql`DROP TABLE IF EXISTS backup_pre_migration.purchase_timeline_backup CASCADE`;
    await sql`CREATE TABLE backup_pre_migration.purchase_timeline_backup AS SELECT * FROM purchase_timeline`;
    const timelineCount = await sql`SELECT COUNT(*) as count FROM backup_pre_migration.purchase_timeline_backup`;
    console.log(`✅ Backed up ${timelineCount[0].count} timeline entries\n`);

    // Backup wallet_transactions (if exists)
    console.log('📦 Backing up wallet_transactions...');
    try {
      await sql`DROP TABLE IF EXISTS backup_pre_migration.wallet_transactions_backup CASCADE`;
      await sql`CREATE TABLE backup_pre_migration.wallet_transactions_backup AS SELECT * FROM wallet_transactions`;
      const walletCount = await sql`SELECT COUNT(*) as count FROM backup_pre_migration.wallet_transactions_backup`;
      console.log(`✅ Backed up ${walletCount[0].count} wallet transactions\n`);
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log('ℹ️  wallet_transactions table does not exist, skipping...\n');
      } else {
        throw error;
      }
    }

    // Backup users
    console.log('📦 Backing up users...');
    await sql`DROP TABLE IF EXISTS backup_pre_migration.users_backup CASCADE`;
    await sql`CREATE TABLE backup_pre_migration.users_backup AS SELECT * FROM users`;
    const usersCount = await sql`SELECT COUNT(*) as count FROM backup_pre_migration.users_backup`;
    console.log(`✅ Backed up ${usersCount[0].count} users\n`);

    console.log('✅ Backup completed successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    return false;
  }
}

async function runMigration() {
  console.log('🔄 Starting migration process...\n');

  try {
    // 1. Rename buyer_profiles table
    console.log('📝 Renaming buyer_profiles to pet_owner_profiles...');
    await sql`ALTER TABLE IF EXISTS buyer_profiles RENAME TO pet_owner_profiles`;
    console.log('✅ Table renamed\n');

    // 2. Rename conversations columns
    console.log('📝 Updating conversations table...');
    await sql`ALTER TABLE IF EXISTS conversations RENAME COLUMN buyer_id TO pet_owner_id`;
    await sql`ALTER TABLE IF EXISTS conversations RENAME COLUMN unread_count_buyer TO unread_count_pet_owner`;
    console.log('✅ Conversations updated\n');

    // 3. Rename purchases columns
    console.log('📝 Updating purchases table...');
    await sql`ALTER TABLE IF EXISTS purchases RENAME COLUMN buyer_id TO pet_owner_id`;
    await sql`ALTER TABLE IF EXISTS purchases RENAME COLUMN buyer_notes TO pet_owner_notes`;
    await sql`ALTER TABLE IF EXISTS purchases RENAME COLUMN buyer_confirmed_receipt TO pet_owner_confirmed_receipt`;
    console.log('✅ Purchases updated\n');

    // 4. Rename purchase_timeline column
    console.log('📝 Updating purchase_timeline table...');
    await sql`ALTER TABLE IF EXISTS purchase_timeline RENAME COLUMN visible_to_buyer TO visible_to_pet_owner`;
    console.log('✅ Purchase timeline updated\n');

    // 5. Rename wallet_transactions column (if exists)
    console.log('📝 Updating wallet_transactions table...');
    try {
      await sql`ALTER TABLE IF EXISTS wallet_transactions RENAME COLUMN buyer_id TO pet_owner_id`;
      console.log('✅ Wallet transactions updated\n');
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log('ℹ️  wallet_transactions table does not exist, skipping...\n');
      } else {
        throw error;
      }
    }

    // 6. Add pet_owner to user_role enum if not exists
    console.log('📝 Updating user_role enum...');
    try {
      await sql`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'pet_owner'`;
      console.log('✅ Added pet_owner to enum\n');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('ℹ️  pet_owner already exists in enum\n');
      } else {
        throw error;
      }
    }

    // 7. Update existing users
    console.log('📝 Updating user roles...');
    const result = await sql`UPDATE users SET role = 'pet_owner' WHERE role = 'buyer'`;
    console.log(`✅ Updated ${result.length} users from buyer to pet_owner\n`);

    console.log('✅ Migration completed successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...\n');

  try {
    // Check pet_owner_profiles exists
    const profiles = await sql`SELECT COUNT(*) as count FROM pet_owner_profiles`;
    console.log(`✅ pet_owner_profiles table: ${profiles[0].count} records`);

    // Check conversations columns
    const convCols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'conversations' 
      AND column_name LIKE '%pet_owner%'
    `;
    console.log(`✅ conversations pet_owner columns: ${convCols.map(c => c.column_name).join(', ')}`);

    // Check purchases columns
    const purchCols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'purchases' 
      AND column_name LIKE '%pet_owner%'
    `;
    console.log(`✅ purchases pet_owner columns: ${purchCols.map(c => c.column_name).join(', ')}`);

    // Check user roles
    const roles = await sql`SELECT role, COUNT(*) as count FROM users GROUP BY role`;
    console.log('✅ User roles:');
    roles.forEach(r => console.log(`   - ${r.role}: ${r.count}`));

    console.log('\n✅ Verification complete!\n');
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  BUYER → PET_OWNER MIGRATION');
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 1: Backup
  const backupSuccess = await backupTables();
  if (!backupSuccess) {
    console.error('❌ Backup failed. Aborting migration.');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════════\n');

  // Step 2: Migration
  const migrationSuccess = await runMigration();
  if (!migrationSuccess) {
    console.error('❌ Migration failed. Database backup is available in backup_pre_migration schema.');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════════\n');

  // Step 3: Verification
  await verifyMigration();

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ✅ MIGRATION COMPLETE!');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('Next steps:');
  console.log('1. Restart your dev server: npm run dev');
  console.log('2. Test the application');
  console.log('3. If everything works, you can drop the backup schema:');
  console.log('   DROP SCHEMA backup_pre_migration CASCADE;\n');
}

main().catch(console.error);
