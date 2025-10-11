import { seedUsers, TEST_USERS } from './users';
import { seedAnimals } from './animals';
import { seedMatings } from './matings';
import { seedTasks } from './tasks';
import { seedFrozenSemen } from './frozen-semen';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Main seed function
 * Seeds all test data into the database via Better Auth API
 *
 * IMPORTANT: The development server must be running!
 * Run: npm run dev (in another terminal)
 * Then: npm run db:seed
 */
async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Step 1: Seed users via Better Auth API
    await seedUsers();

    // Step 2: Get breeder user ID from database
    // After user creation via Better Auth, query the database for the breeder user
    const { db } = await import('@/lib/db');
    const { users } = await import('@/lib/db/schema');

    const breederUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, TEST_USERS.breeder.email),
    });

    if (!breederUser) {
      throw new Error('Breeder user not found after creation');
    }

    console.log(`\n📦 Seeding data for breeder: ${breederUser.name} (${breederUser.id})\n`);

    // Step 3: Seed animals
    const animals = await seedAnimals(breederUser.id);
    const animalIds = animals.map((a) => a.id);

    // Step 4: Seed matings
    await seedMatings(breederUser.id, animalIds);

    // Step 5: Seed tasks
    await seedTasks(breederUser.id, animalIds);

    // Step 6: Seed frozen semen
    await seedFrozenSemen(breederUser.id, animalIds);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n💡 You can now sign in at: http://localhost:3002/auth/signin');
    console.log(`💡 Use email: ${TEST_USERS.breeder.email}`);
    console.log(`💡 Password: ${TEST_USERS.breeder.password}\n`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    console.error('\n💡 Make sure the dev server is running: npm run dev');
    process.exit(1);
  }
}

/**
 * Display test credentials
 */
function showCredentials() {
  console.log('\n📝 Test User Credentials');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n⚠️  DEVELOPMENT/TESTING ONLY - DO NOT USE IN PRODUCTION!\n');

  Object.entries(TEST_USERS).forEach(([role, user]) => {
    console.log(`${role.toUpperCase()}:`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Name:     ${user.name}`);
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('💡 Quick Start:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Run: npm run db:seed (in another terminal)');
  console.log('   3. Go to: http://localhost:3000/auth/signin');
  console.log('   4. Sign in with credentials above\n');
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'seed':
    seed();
    break;
  case 'credentials':
  case 'creds':
    showCredentials();
    break;
  default:
    console.log('\n📦 Database Seeding Commands\n');
    console.log('Usage:');
    console.log('  npm run db:seed         - Seed database with test users');
    console.log('  npm run db:seed:creds   - Display test user credentials\n');
    console.log('📝 Note: Server must be running (npm run dev) before seeding\n');
    process.exit(0);
}
