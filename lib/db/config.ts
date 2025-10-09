import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables if running in Node.js (for scripts)
if (typeof window === 'undefined') {
  dotenv.config({ path: '.env.local' });
  dotenv.config();
}

// Get the database URL from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create the neon connection
const sql = neon(connectionString);

// Create the drizzle database instance with schema
export const db = drizzle(sql, { schema });

// Export types
export type DbType = typeof db;