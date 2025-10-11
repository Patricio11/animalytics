/**
 * Drop All Tables Script
 *
 * WARNING: This will delete ALL tables in the database!
 * Use only in development.
 */

import { sql } from 'drizzle-orm';
import { db } from '../lib/db';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function dropAllTables() {
  console.log('⚠️  WARNING: About to drop ALL tables from database!');
  console.log('This action cannot be undone.\n');

  try {
    console.log('Dropping all tables...\n');

    // Drop all tables in the public schema
    await db.execute(sql`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);

    // Drop all custom types/enums
    await db.execute(sql`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
          EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
        END LOOP;
      END $$;
    `);

    console.log('✅ All tables and types dropped successfully!\n');
    console.log('💡 Next steps:');
    console.log('   1. Run: npm run db:push');
    console.log('   2. Run: npm run dev (start server)');
    console.log('   3. Run: npm run db:seed (in another terminal)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    process.exit(1);
  }
}

dropAllTables();
