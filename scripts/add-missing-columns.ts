import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function addMissingColumns() {
  console.log('🔄 Adding missing columns to purchases table...\n');

  try {
    // Check if pet_owner_confirmed_at exists
    const cols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'purchases' 
      AND column_name = 'pet_owner_confirmed_at'
    `;

    if (cols.length === 0) {
      console.log('📝 Adding pet_owner_confirmed_at column...');
      await sql`
        ALTER TABLE purchases 
        ADD COLUMN IF NOT EXISTS pet_owner_confirmed_at timestamp without time zone
      `;
      console.log('✅ Column added\n');
    } else {
      console.log('ℹ️  pet_owner_confirmed_at already exists\n');
    }

    // Verify all pet_owner columns exist
    console.log('🔍 Verifying all pet_owner columns in purchases table...');
    const allCols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'purchases' 
      AND column_name LIKE '%pet_owner%'
      ORDER BY column_name
    `;
    
    console.log('Pet owner columns found:');
    allCols.forEach(c => console.log(`  ✅ ${c.column_name}`));

    // Check for any remaining buyer columns
    console.log('\n🔍 Checking for any remaining buyer columns...');
    const buyerCols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'purchases' 
      AND column_name LIKE '%buyer%'
      ORDER BY column_name
    `;

    if (buyerCols.length > 0) {
      console.log('⚠️  Found buyer columns that need renaming:');
      buyerCols.forEach(c => console.log(`  - ${c.column_name}`));
    } else {
      console.log('✅ No buyer columns found - all renamed!\n');
    }

    console.log('✅ All done!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

addMissingColumns().catch(console.error);
