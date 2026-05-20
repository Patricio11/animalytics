import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { users } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.role === 'admin';
}

/**
 * PUT /api/admin/users/[id]/breeder-profile
 * Update a breeder's public profile fields. Creates the profile if missing.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  // Confirm the user exists and is a breeder
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (user.role !== 'breeder') {
    return NextResponse.json(
      { error: 'Breeder profile can only be edited for users with the breeder role' },
      { status: 400 }
    );
  }

  // Find or create the breeder profile
  let [profile] = await db
    .select()
    .from(breederProfiles)
    .where(eq(breederProfiles.userId, id))
    .limit(1);

  // Validate slug uniqueness if it's changing
  if (body.slug && (!profile || profile.slug !== body.slug)) {
    const [collision] = await db
      .select({ id: breederProfiles.id })
      .from(breederProfiles)
      .where(eq(breederProfiles.slug, body.slug))
      .limit(1);
    if (collision && collision.id !== profile?.id) {
      return NextResponse.json(
        { error: 'That slug is already taken by another breeder' },
        { status: 400 }
      );
    }
  }

  // Whitelist editable fields
  const allowed = [
    'displayName',
    'slug',
    'tagline',
    'bio',
    'logoUrl',
    'bannerUrl',
    'publicEmail',
    'publicPhone',
    'website',
    'socialMedia',
    'location',
    'businessName',
    'businessType',
    'registrationNumber',
    'yearsInBusiness',
    'establishedYear',
    'breedingPhilosophy',
    'isPublic',
    'kennelClubs',
    'kennelClubMember',
    'healthCertified',
    'metaTitle',
    'metaDescription',
  ] as const;

  const updates: Record<string, any> = { updatedAt: new Date() };
  for (const field of allowed) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  if (!profile) {
    // Create the profile — require at least displayName + slug
    const displayName = body.displayName || user.name || 'Breeder';
    const slug =
      body.slug ||
      `${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${id.substring(0, 8)}`;

    [profile] = await db
      .insert(breederProfiles)
      .values({
        userId: id,
        displayName,
        slug,
        isPublic: true,
        ...updates,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  } else {
    [profile] = await db
      .update(breederProfiles)
      .set(updates)
      .where(eq(breederProfiles.id, profile.id))
      .returning();
  }

  return NextResponse.json({ success: true, breederProfile: profile });
}
