import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function fixArchivedColumns() {
  console.log('🔄 Fixing archived and blocked columns in conversations table...\n');

  try {
    // Rename archived columns
    console.log('📝 Renaming archived_by_buyer to archived_by_pet_owner...');
    await sql`ALTER TABLE conversations RENAME COLUMN archived_by_buyer TO archived_by_pet_owner`;
    console.log('✅ Done\n');

    console.log('📝 Renaming archived_by_buyer_at to archived_by_pet_owner_at...');
    await sql`ALTER TABLE conversations RENAME COLUMN archived_by_buyer_at TO archived_by_pet_owner_at`;
    console.log('✅ Done\n');

    // Rename blocked columns
    console.log('📝 Renaming blocked_by_buyer to blocked_by_pet_owner...');
    await sql`ALTER TABLE conversations RENAME COLUMN blocked_by_buyer TO blocked_by_pet_owner`;
    console.log('✅ Done\n');

    console.log('📝 Renaming blocked_by_buyer_at to blocked_by_pet_owner_at...');
    await sql`ALTER TABLE conversations RENAME COLUMN blocked_by_buyer_at TO blocked_by_pet_owner_at`;
    console.log('✅ Done\n');

    console.log('✅ All columns renamed successfully!\n');

    // Verify
    console.log('🔍 Verifying columns...');
    const cols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'conversations' 
      AND (column_name LIKE '%pet_owner%' OR column_name LIKE '%buyer%')
      ORDER BY column_name
    `;
    console.log('Columns in conversations table:');
    cols.forEach(c => console.log(`  - ${c.column_name}`));

  } catch (error: any) {
    if (error.code === '42703') {
      console.log('ℹ️  Columns may already be renamed or do not exist');
    } else {
      console.error('❌ Error:', error);
      throw error;
    }
  }
}

fixArchivedColumns().catch(console.error);
