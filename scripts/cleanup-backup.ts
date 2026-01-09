import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function cleanupBackup() {
  console.log('🗑️  Cleaning up migration backup...\n');

  try {
    // Check if backup schema exists
    const schemas = await sql`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'backup_pre_migration'
    `;

    if (schemas.length === 0) {
      console.log('ℹ️  No backup schema found - already cleaned up!\n');
      return;
    }

    // Show what will be deleted
    console.log('📋 Backup tables to be deleted:');
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'backup_pre_migration'
      ORDER BY tablename
    `;
    
    tables.forEach(t => console.log(`  - ${t.tablename}`));
    console.log('');

    // Drop the backup schema
    console.log('🗑️  Dropping backup_pre_migration schema...');
    await sql`DROP SCHEMA backup_pre_migration CASCADE`;
    console.log('✅ Backup schema deleted successfully!\n');

    console.log('✨ Cleanup complete! Your database is now clean.\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

cleanupBackup().catch(console.error);
