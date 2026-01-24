import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { listings, animals } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// ============================================================================
// GET /api/marketplace/listings/[id] - Get single listing
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

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
            photos: true,
          },
        },
        user: {
          columns: {
            id: true,
            name: true,
            avatar: true,
          },
          with: {
            breederProfile: {
              columns: {
                slug: true,
                displayName: true,
                location: true,
                kycVerified: true,
                isPublic: true,
              },
            },
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

    // Only allow viewing active listings publicly, or if user is the owner/admin
    const isOwner = session && listing.userId === session.user.id;
    const isAdmin = session && session.user.role === 'admin';

    if (listing.status !== 'active' && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Increment view count (async, don't wait)
    db.update(listings)
      .set({ 
        viewCount: sql`${listings.viewCount} + 1`,
      })
      .where(eq(listings.id, id))
      .execute()
      .catch(console.error);
    
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
    
    // Prepare update data
    const updateData: Record<string, any> = {
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
      updatedAt: new Date(),
    };

    // Only allow status changes to draft or if admin
    // Users cannot set status to 'active' - only admins can approve
    if (body.status) {
      const isAdmin = session.user.role === 'admin';

      if (body.status === 'active' && !isAdmin) {
        return NextResponse.json(
          { error: 'Only administrators can approve listings' },
          { status: 403 }
        );
      }

      // Users can only set to draft
      if (body.status === 'draft' || isAdmin) {
        updateData.status = body.status;
      }
    }

    // If listing was previously rejected and user is updating, reset to pending for re-review
    if (existingListing.status === 'removed' && existingListing.rejectedAt) {
      updateData.status = 'pending';
      updateData.requiresApproval = true;
      updateData.rejectedBy = null;
      updateData.rejectedAt = null;
      updateData.rejectionReason = null;
    }

    // Update listing
    const [updatedListing] = await db
      .update(listings)
      .set(updateData)
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
