import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

import { db } from '../lib/db/config';
import * as schema from '../lib/db/schema/users';
import { wallets } from '../lib/db/schema/wallet';
import { kycVerifications } from '../lib/db/schema/kyc';
import { breederProfiles } from '../lib/db/schema/profiles';
import { eq } from 'drizzle-orm';
import { initializeWalletBalances } from '../lib/utils/wallet';

// Sample users for each role
const seedUsers = [
  // Admin User
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin' as const,
    isVerified: true,
    emailVerified: true,
  },

  // Breeder User
  {
    name: 'John Smith',
    email: 'breeder@test.com',
    password: 'breeder123',
    role: 'breeder' as const,
    isVerified: true,
    emailVerified: true,
  },

  // Veterinarian User
  {
    name: 'Dr. Sarah Johnson',
    email: 'vet@test.com',
    password: 'vet123456',
    role: 'veterinarian' as const,
    isVerified: true,
    emailVerified: true,
    organization: 'Johnson Veterinary Clinic',
    licenseNumber: 'VET-12345',
    specializations: ['Reproduction', 'Genetics', 'Breeding'],
  },

  // Event Organizer User
  {
    name: 'Mike Wilson',
    email: 'organizer@test.com',
    password: 'organizer123',
    role: 'event_organizer' as const,
    isVerified: true,
    emailVerified: true,
    organization: 'National Dog Show Association',
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing test users and related data
    console.log('🧹 Clearing existing test users...');
    for (const userData of seedUsers) {
      const existingUsers = await db.select().from(schema.users).where(eq(schema.users.email, userData.email));
      if (existingUsers.length > 0) {
        const userId = existingUsers[0].id;
        // Delete related records (cascade will handle most, but let's be explicit)
        await db.delete(breederProfiles).where(eq(breederProfiles.userId, userId));
        await db.delete(kycVerifications).where(eq(kycVerifications.userId, userId));
        await db.delete(wallets).where(eq(wallets.userId, userId));
        // Delete from accounts table (foreign key constraint)
        await db.delete(schema.accounts).where(eq(schema.accounts.userId, userId));
        // Then delete from users table
        await db.delete(schema.users).where(eq(schema.users.email, userData.email));
      }
    }
    console.log('✅ Test users cleared');

    // Seed Users via Better Auth API
    console.log('\n👥 Seeding users via Better Auth API...');
    const createdUsers = [];
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    for (const userData of seedUsers) {
      try {
        // Use Better Auth signup API to create user with password
        const response = await fetch(`${baseURL}/api/auth/sign-up/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            name: userData.name,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`⚠️  Failed to create ${userData.email}: ${errorText}`);
          continue;
        }

        // Update user with role and other fields (Better Auth doesn't support these in signup)
        const updatedUsers = await db
          .update(schema.users)
          .set({
            role: userData.role,
            emailVerified: userData.emailVerified,
            isVerified: userData.isVerified,
            organization: userData.organization,
            licenseNumber: userData.licenseNumber,
            specializations: userData.specializations,
            preferences: {
              notifications: true,
              emailUpdates: true,
              darkMode: false,
              language: 'en',
              timezone: 'UTC',
              currency: 'USD',
              locale: 'en-US',
              dateFormat: 'MM/DD/YYYY',
              timeFormat: '12h',
              measurementUnit: 'metric',
              firstDayOfWeek: 0,
            },
          })
          .where(eq(schema.users.email, userData.email))
          .returning();

        if (updatedUsers.length > 0) {
          const user = updatedUsers[0];
          createdUsers.push(user);
          console.log(`✅ Created ${userData.role}: ${userData.email}`);

          // Create wallet for user
          await db.insert(wallets).values({
            id: `wallet_${user.id}`,
            userId: user.id,
            balances: initializeWalletBalances(),
            pendingBalance: initializeWalletBalances(),
            totalEarnings: 0,
            totalWithdrawals: 0,
            totalTransactions: 0,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log(`  💰 Created wallet for ${userData.email}`);

          // Create KYC verification record (all users except admin)
          if (userData.role !== 'admin') {
            await db.insert(kycVerifications).values({
              id: `kyc_${user.id}`,
              userId: user.id,
              level: 0, // Not verified by default
              status: 'not_started',
              monthlyLimit: 0,
              transactionLimit: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            console.log(`  🔒 Created KYC record for ${userData.email}`);
          }

          // Create breeder profile for breeders only
          if (userData.role === 'breeder') {
            const slug = userData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            await db.insert(breederProfiles).values({
              id: `profile_${user.id}`,
              userId: user.id,
              displayName: userData.name,
              slug: `${slug}-${Math.random().toString(36).substr(2, 4)}`, // Ensure uniqueness
              tagline: 'Professional dog breeder',
              bio: 'Passionate about breeding healthy, well-tempered dogs.',
              isPublic: true,
              profileComplete: false,
              profileCompleteness: 20, // Basic info filled
              kycVerified: false,
              premiumMember: false,
              acceptsInternationalOrders: true,
              totalSales: 0,
              totalListings: 0,
              activeListings: 0,
              totalEarnings: '0.00',
              successfulTransactions: 0,
              totalAnimals: 0,
              totalLitters: 0,
              averageRating: '0.00',
              totalReviews: 0,
              fiveStarReviews: 0,
              fourStarReviews: 0,
              threeStarReviews: 0,
              twoStarReviews: 0,
              oneStarReviews: 0,
              responseRate: 100,
              responseTimeHours: 24,
              onTimeDeliveryRate: 100,
              profileViews: 0,
              profileViewsThisMonth: 0,
              primaryBreeds: [],
              secondaryBreeds: [],
              specializations: [],
              certifications: [],
              awards: [],
              kennelClubs: [],
              shipsTo: [],
              acceptedPaymentMethods: ['wallet', 'stripe', 'paypal'],
              keywords: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            console.log(`  👤 Created breeder profile for ${userData.email}`);
          }
        }
      } catch (error: any) {
        console.log(`❌ Error creating ${userData.email}: ${error.message}`);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`   - Admins: ${createdUsers.filter(u => u.role === 'admin').length}`);
    console.log(`   - Breeders: ${createdUsers.filter(u => u.role === 'breeder').length}`);
    console.log(`   - Veterinarians: ${createdUsers.filter(u => u.role === 'veterinarian').length}`);
    console.log(`   - Event Organizers: ${createdUsers.filter(u => u.role === 'event_organizer').length}`);

    console.log('\n🔑 Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  DEVELOPMENT/TESTING ONLY - DO NOT USE IN PRODUCTION!\n');

    seedUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}:`);
      console.log(`  Email:    ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Name:     ${user.name}`);
      if (user.organization) console.log(`  Org:      ${user.organization}`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Quick Start:');
    console.log('   1. Go to: http://localhost:3000/auth/signin');
    console.log('   2. Sign in with credentials above\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
