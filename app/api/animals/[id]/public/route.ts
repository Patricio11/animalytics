import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch animal with public information using relational query
    const animal = await db.query.animals.findFirst({
      where: (animals, { eq }) => eq(animals.id, id),
      columns: {
        id: true,
        name: true,
        registeredName: true,
        registrationNumber: true,
        sex: true,
        dateOfBirth: true,
        color: true,
        colorHex: true,
        weight: true,
        height: true,
        profileImageUrl: true,
        description: true,
        temperament: true,
        achievements: true,
        userId: true,
        breedId: true,
      },
      with: {
        breed: {
          columns: {
            id: true,
            name: true,
            category: true,
          },
        },
        photos: {
          columns: {
            id: true,
            fileUrl: true,
            category: true,
            caption: true,
          },
          orderBy: (photos, { desc }) => [desc(photos.uploadedAt)],
        },
      },
    });

    if (!animal) {
      return NextResponse.json(
        { error: 'Animal not found' },
        { status: 404 }
      );
    }

    // Fetch breeder profile information (public info only)
    const breederProfile = await db.query.breederProfiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, animal.userId),
      columns: {
        slug: true,
        displayName: true,
        location: true,
        bio: true,
      },
    });

    // Return public profile data
    return NextResponse.json({
      success: true,
      animal: {
        ...animal,
        breeder: breederProfile || undefined,
      },
    });
  } catch (error) {
    console.error('Error fetching public animal profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch animal profile' },
      { status: 500 }
    );
  }
}
