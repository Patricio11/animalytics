import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function fixRemainingBuyerColumns() {
  console.log('🔄 Renaming remaining buyer columns in purchases table...\n');

  try {
    // Rename buyer_confirmed_at to pet_owner_confirmed_at (if it still exists)
    console.log('📝 Checking buyer_confirmed_at...');
    try {
      await sql`ALTER TABLE purchases RENAME COLUMN buyer_confirmed_at TO pet_owner_confirmed_at_old`;
      console.log('⚠️  Found duplicate buyer_confirmed_at - renamed to _old for manual cleanup\n');
    } catch (error: any) {
      if (error.code === '42703') {
        console.log('✅ buyer_confirmed_at already renamed\n');
      } else {
        throw error;
      }
    }

    // Rename buyer_review_id to pet_owner_review_id
    console.log('📝 Renaming buyer_review_id to pet_owner_review_id...');
    try {
      await sql`ALTER TABLE purchases RENAME COLUMN buyer_review_id TO pet_owner_review_id`;
      console.log('✅ Done\n');
    } catch (error: any) {
      if (error.code === '42703') {
        console.log('ℹ️  Already renamed\n');
      } else {
        throw error;
      }
    }

    // Rename buyer_review_submitted to pet_owner_review_submitted
    console.log('📝 Renaming buyer_review_submitted to pet_owner_review_submitted...');
    try {
      await sql`ALTER TABLE purchases RENAME COLUMN buyer_review_submitted TO pet_owner_review_submitted`;
      console.log('✅ Done\n');
    } catch (error: any) {
      if (error.code === '42703') {
        console.log('ℹ️  Already renamed\n');
      } else {
        throw error;
      }
    }

    // Verify
    console.log('🔍 Final verification...');
    const buyerCols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'purchases' 
      AND column_name LIKE '%buyer%'
      ORDER BY column_name
    `;

    if (buyerCols.length > 0) {
      console.log('⚠️  Remaining buyer columns:');
      buyerCols.forEach(c => console.log(`  - ${c.column_name}`));
    } else {
      console.log('✅ All buyer columns renamed!\n');
    }

    const petOwnerCols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'purchases' 
      AND column_name LIKE '%pet_owner%'
      ORDER BY column_name
    `;

    console.log('\nPet owner columns:');
    petOwnerCols.forEach(c => console.log(`  ✅ ${c.column_name}`));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

fixRemainingBuyerColumns().catch(console.error);
