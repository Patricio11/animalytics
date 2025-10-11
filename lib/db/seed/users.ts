/**
 * Test Users for Development and Testing
 *
 * IMPORTANT: These are test accounts with known passwords.
 * DO NOT use these credentials in production!
 */

export const TEST_USERS = {
  breeder: {
    email: 'breeder@test.com',
    password: 'breeder123',
    name: 'John Smith',
    role: 'breeder' as const,
  },
  veterinarian: {
    email: 'vet@test.com',
    password: 'veterinarian123',
    name: 'Dr. Sarah Johnson',
    role: 'veterinarian' as const,
  },
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const,
  },
  event_organizer: {
    email: 'organizer@test.com',
    password: 'organizer123',
    name: 'Mike Wilson',
    role: 'event_organizer' as const,
  },
} as const;

/**
 * Seed test users using Better Auth API
 *
 * NOTE: This should be run AFTER the server is running
 * Use the API route to create users with Better Auth
 */
export async function seedUsers() {
  console.log('🌱 Seeding test users via Better Auth API...\n');
  console.log('⚠️  Make sure the development server is running!\n');

  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    for (const [roleName, userData] of Object.entries(TEST_USERS)) {
      console.log(`Creating ${roleName} account...`);

      try {
        const response = await fetch(`${baseURL}/api/auth/sign-up/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            name: userData.name,
            // Better Auth will handle the role through user.additionalFields
          }),
        });

        if (response.ok) {
          console.log(`✅ ${roleName} account created successfully`);
        } else {
          const error = await response.text();
          if (error.includes('already exists') || error.includes('duplicate')) {
            console.log(`ℹ️  ${roleName} account already exists (skipping)`);
          } else {
            console.log(`⚠️  ${roleName} account creation failed: ${error}`);
          }
        }
      } catch (error) {
        console.log(`⚠️  ${roleName} account creation error:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    console.log('\n✅ User seeding completed!');
    console.log('\n📝 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Object.entries(TEST_USERS).forEach(([role, user]) => {
      console.log(`\n${role.toUpperCase()}:`);
      console.log(`  Email:    ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Name:     ${user.name}`);
    });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

/**
 * Alternative: Manual database seed (bypassing Better Auth)
 * Use this if you need to seed without the server running
 */
export async function seedUsersDirectly() {
  console.log('⚠️  Direct database seeding not recommended with Better Auth');
  console.log('Please use the API-based seeding instead (npm run db:seed)');
  console.log('\nAlternatively, you can manually create accounts via the signup page:');
  console.log('http://localhost:3000/auth/signup\n');
}
