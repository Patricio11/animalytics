import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * Ensures a breeder profile exists for the given user.
 * Creates one with seed data if it doesn't exist.
 * 
 * @param userId - The user ID from the session
 * @param userName - Optional user name for display
 * @param userEmail - Optional user email
 * @returns The breeder profile (existing or newly created)
 */
export async function ensureBreederProfile(
  userId: string,
  userName?: string | null,
  userEmail?: string | null
) {
  // Check if profile already exists
  const [existingProfile] = await db
    .select()
    .from(breederProfiles)
    .where(eq(breederProfiles.userId, userId))
    .limit(1);

  if (existingProfile) {
    return existingProfile;
  }

  // Generate slug from user name or email
  const displayName = userName || userEmail?.split('@')[0] || 'My Kennel';
  const slugBase = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const slug = `${slugBase}-${nanoid(6)}`;

  // Create minimal empty profile - user will fill in their own information
  const [newProfile] = await db
    .insert(breederProfiles)
    .values({
      userId,
      displayName,
      slug,
      publicEmail: userEmail,
      isPublic: false, // Private by default until user completes profile
    })
    .returning();

  console.log(`✅ Auto-created minimal breeder profile for user ${userId}`);
  
  return newProfile;
}
