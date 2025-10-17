import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animalPhotos } from '@/lib/db/schema/animals';
import { requireAuth } from '@/lib/auth/server';
import { eq, and, count } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

/**
 * GET /api/animals/[id]/photos
 * Get all photos for an animal, optionally filtered by category
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await requireAuth();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Build query
    let query = db
      .select()
      .from(animalPhotos)
      .where(eq(animalPhotos.animalId, id));

    // Filter by category if provided
    if (category) {
      query = query.where(
        and(
          eq(animalPhotos.animalId, id),
          eq(animalPhotos.category, category as any)
        )
      );
    }

    const photos = await query.orderBy(animalPhotos.displayOrder, animalPhotos.uploadedAt);

    return NextResponse.json({
      success: true,
      photos,
      count: photos.length,
    });
  } catch (error) {
    console.error('Error fetching animal photos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch photos',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/animals/[id]/photos
 * Upload a new photo for an animal
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await requireAuth();

    const { id } = await params;
    const body = await request.json();
    const { category, fileUrl, fileName, fileSize, thumbnailUrl, caption, width, height } = body;

    // Validate required fields
    if (!category || !fileUrl || !fileName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: category, fileUrl, fileName',
        },
        { status: 400 }
      );
    }

    // Check category limit (10 per category, 1 for profile)
    const categoryLimit = category === 'profile' ? 1 : 10;

    const [{ count: photoCount }] = await db
      .select({ count: count() })
      .from(animalPhotos)
      .where(
        and(
          eq(animalPhotos.animalId, id),
          eq(animalPhotos.category, category)
        )
      );

    if (photoCount >= categoryLimit) {
      return NextResponse.json(
        {
          success: false,
          error: `Photo limit reached for category "${category}". Maximum ${categoryLimit} photo(s) allowed.`,
        },
        { status: 400 }
      );
    }

    // If profile category, delete existing profile photo
    if (category === 'profile') {
      await db
        .delete(animalPhotos)
        .where(
          and(
            eq(animalPhotos.animalId, id),
            eq(animalPhotos.category, 'profile')
          )
        );
    }

    // Insert new photo
    const [newPhoto] = await db
      .insert(animalPhotos)
      .values({
        id: createId(),
        animalId: id,
        category,
        fileUrl,
        fileName,
        fileSize: fileSize || null,
        thumbnailUrl: thumbnailUrl || null,
        caption: caption || null,
        width: width || null,
        height: height || null,
        displayOrder: photoCount, // Append to end
        isPrimary: category === 'profile' || photoCount === 0,
        uploadedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      photo: newPhoto,
    });
  } catch (error) {
    console.error('Error uploading animal photo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload photo',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/animals/[id]/photos
 * Delete a photo by photo ID (passed in query params)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await requireAuth();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');

    if (!photoId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing photoId parameter',
        },
        { status: 400 }
      );
    }

    // Delete the photo
    await db
      .delete(animalPhotos)
      .where(
        and(
          eq(animalPhotos.id, photoId),
          eq(animalPhotos.animalId, id) // Ensure it belongs to this animal
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting animal photo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete photo',
      },
      { status: 500 }
    );
  }
}
