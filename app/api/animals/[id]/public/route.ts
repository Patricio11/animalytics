import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals, breeds, users, breederProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch animal with public information only
    const [animal] = await db
      .select({
        id: animals.id,
        name: animals.name,
        registeredName: animals.registeredName,
        registrationNumber: animals.registrationNumber,
        sex: animals.sex,
        dateOfBirth: animals.dateOfBirth,
        color: animals.color,
        colorHex: animals.colorHex,
        weight: animals.weight,
        height: animals.height,
        profileImageUrl: animals.profileImageUrl,
        description: animals.description,
        temperament: animals.temperament,
        achievements: animals.achievements,
        userId: animals.userId,
        breedId: animals.breedId,
        breed: {
          id: breeds.id,
          name: breeds.name,
          category: breeds.category,
        },
      })
      .from(animals)
      .leftJoin(breeds, eq(animals.breedId, breeds.id))
      .where(eq(animals.id, id))
      .limit(1);

    if (!animal) {
      return NextResponse.json(
        { error: 'Animal not found' },
        { status: 404 }
      );
    }

    // Fetch breeder profile information (public info only)
    const [breederProfile] = await db
      .select({
        displayName: breederProfiles.displayName,
        location: breederProfiles.location,
        bio: breederProfiles.bio,
      })
      .from(breederProfiles)
      .where(eq(breederProfiles.userId, animal.userId))
      .limit(1);

    // Fetch photos (public photos only)
    const photos = await db.query.animalPhotos.findMany({
      where: (animalPhotos, { eq }) => eq(animalPhotos.animalId, id),
      columns: {
        id: true,
        fileUrl: true,
        category: true,
        caption: true,
      },
      orderBy: (animalPhotos, { desc }) => [desc(animalPhotos.uploadedAt)],
    });

    // Return public profile data
    return NextResponse.json({
      success: true,
      animal: {
        ...animal,
        breed: animal.breed || undefined,
        breeder: breederProfile || undefined,
        photos: photos || [],
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
