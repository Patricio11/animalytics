import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { listings, animals } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// ============================================================================
// POST /api/marketplace/listings - Create new listing
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE LISTING API CALLED ===');
    
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('✅ User ID:', userId);
    
    const body = await request.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    // Verify animal ownership
    if (body.animalId) {
      console.log('🔍 Looking for animal:', body.animalId);
      
      const animal = await db.query.animals.findFirst({
        where: and(
          eq(animals.id, body.animalId),
          eq(animals.userId, userId)
        ),
        with: {
          breed: true,
        },
      });
      
      if (!animal) {
        console.log('❌ Animal not found or no permission');
        return NextResponse.json(
          { error: 'Animal not found or you do not have permission' },
          { status: 403 }
        );
      }
      
      console.log('✅ Animal found:', animal.name);
      
      // Update animal to be breeding active
      console.log('📝 Updating animal to breeding active...');
      await db
        .update(animals)
        .set({ isBreedingActive: true })
        .where(eq(animals.id, body.animalId));
      
      console.log('✅ Animal updated');
      
      // Create listing with animal details
      console.log('📝 Creating listing...');
      const [newListing] = await db
        .insert(listings)
        .values({
          userId,
          category: body.category || 'stud_dog',
          animalId: body.animalId,
          title: body.title,
          description: body.description,
          price: body.price ? Math.round(body.price * 100) : null, // Convert to cents
          currency: body.currency || 'USD',
          contactName: body.contactName,
          contactEmail: body.contactEmail,
          contactPhone: body.contactPhone,
          location: body.contactLocation,
          availabilityNotes: body.availabilityNotes,
          clinicId: body.clinicId,
          additionalImages: body.additionalImages || [],
          breed: animal.breed?.name,
          sex: animal.sex,
          color: animal.color,
          registrationNumber: animal.registrationNumber,
          healthCertified: animal.healthCertifications ? true : false,
          championLines: animal.isChampion,
          status: 'active',
          publishedAt: new Date(),
        })
        .returning();
      
      console.log('✅ Listing created successfully:', newListing.id);
      console.log('=== END CREATE LISTING ===');
      
      return NextResponse.json({
        success: true,
        listing: newListing,
      }, { status: 201 });
    }
    
    console.log('❌ No animal ID provided');
    return NextResponse.json(
      { error: 'Animal ID is required' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('❌ Error creating listing:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to create listing' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/marketplace/listings - Get user's listings
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    const userListings = await db.query.listings.findMany({
      where: eq(listings.userId, userId),
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
      orderBy: [desc(listings.createdAt)],
    });
    
    return NextResponse.json({
      success: true,
      listings: userListings,
    });
    
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
