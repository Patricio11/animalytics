import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function cleanupDuplicateColumn() {
  console.log('🔄 Cleaning up duplicate column...\n');

  try {
    console.log('📝 Dropping pet_owner_confirmed_at_old column...');
    await sql`ALTER TABLE purchases DROP COLUMN IF EXISTS pet_owner_confirmed_at_old`;
    console.log('✅ Done\n');

    // Final verification
    console.log('🔍 Final column check...');
    const cols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'purchases' 
      AND (column_name LIKE '%pet_owner%' OR column_name LIKE '%buyer%')
      ORDER BY column_name
    `;

    console.log('Columns in purchases table:');
    cols.forEach(c => console.log(`  ✅ ${c.column_name}`));

    console.log('\n✅ Cleanup complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

cleanupDuplicateColumn().catch(console.error);
