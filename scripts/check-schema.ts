import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function checkSchema() {
  console.log('🔍 Checking conversations table schema...\n');

  const cols = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'conversations' 
    ORDER BY ordinal_position
  `;

  console.log('Conversations table columns:');
  cols.forEach(c => {
    console.log(`  ${c.column_name.padEnd(30)} ${c.data_type.padEnd(20)} ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
  });
}

checkSchema().catch(console.error);
