import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { listings, animals } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// GET /api/marketplace/listings/[id] - Get single listing
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const listing = await db.query.listings.findFirst({
      where: eq(listings.id, id),
      with: {
        animal: {
          columns: {
            id: true,
            name: true,
            profileImageUrl: true,
          },
          with: {
            breed: true,
          },
        },
      },
    });
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      listing,
    });
    
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/marketplace/listings/[id] - Update listing
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id } = await params;
    const body = await request.json();
    
    // Verify ownership
    const existingListing = await db.query.listings.findFirst({
      where: and(
        eq(listings.id, id),
        eq(listings.userId, userId)
      ),
    });
    
    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Update listing
    const [updatedListing] = await db
      .update(listings)
      .set({
        title: body.title,
        description: body.description,
        price: body.price ? Math.round(body.price * 100) : null,
        currency: body.currency || 'USD',
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        location: body.contactLocation,
        availabilityNotes: body.availabilityNotes,
        clinicId: body.clinicId,
        additionalImages: body.additionalImages || [],
        status: body.status || existingListing.status,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, id))
      .returning();
    
    return NextResponse.json({
      success: true,
      listing: updatedListing,
    });
    
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/marketplace/listings/[id] - Delete listing
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id } = await params;
    
    // Verify ownership
    const existingListing = await db.query.listings.findFirst({
      where: and(
        eq(listings.id, id),
        eq(listings.userId, userId)
      ),
    });
    
    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Mark animal as not breeding active
    if (existingListing.animalId) {
      await db
        .update(animals)
        .set({ isBreedingActive: false })
        .where(eq(animals.id, existingListing.animalId));
    }
    
    // Delete listing
    await db
      .delete(listings)
      .where(eq(listings.id, id));
    
    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    });
    
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
