import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

import { db } from '../lib/db/config';
import * as schema from '../lib/db/schema/users';
import { eq } from 'drizzle-orm';

/**
 * Script to make a user an admin
 * Usage: tsx scripts/make-user-admin.ts <email>
 */
async function makeUserAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: npm run make-admin <email>');
    process.exit(1);
  }

  console.log(`🔍 Looking for user: ${email}`);

  try {
    // Find user
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (users.length === 0) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`   Current role: ${user.role}`);

    if (user.role === 'admin') {
      console.log('✅ User is already an admin!');
      process.exit(0);
    }

    // Update user to admin
    const [updatedUser] = await db
      .update(schema.users)
      .set({
        role: 'admin',
        isVerified: true,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.email, email))
      .returning();

    console.log('✅ User updated to admin successfully!');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Verified: ${updatedUser.isVerified}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

makeUserAdmin();
