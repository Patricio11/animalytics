import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { listings, animals } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateSlug } from '@/lib/utils/slugify';

// ============================================================================
// POST /api/marketplace/listings - Create new listing
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
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
      
      // Check if animal already has an active listing
      console.log('🔍 Checking for existing active listings...');
      const existingListing = await db.query.listings.findFirst({
        where: and(
          eq(listings.animalId, body.animalId),
          eq(listings.status, 'active')
        ),
      });
      
      if (existingListing) {
        console.log('❌ Animal already has an active listing');
        return NextResponse.json(
          { error: 'This animal already has an active listing. You can only list each animal once at a time.' },
          { status: 400 }
        );
      }
      
      console.log('✅ No existing listing found');
      
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
          status: 'pending', // Requires admin approval before going live
          requiresApproval: true,
        })
        .returning();
      
      // Generate and save SEO-friendly slug
      const slug = generateSlug(body.title, newListing.id.substring(0, 8));
      await db.update(listings)
        .set({ slug })
        .where(eq(listings.id, newListing.id));
      
      console.log('✅ Listing created successfully:', newListing.id, 'slug:', slug);
      console.log('=== END CREATE LISTING ===');
      
      return NextResponse.json({
        success: true,
        listing: { ...newListing, slug },
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
// GET /api/marketplace/listings - Get listings (user's own or public)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get('public') === 'true';
    const userOnly = searchParams.get('userOnly') === 'true';
    const userId = searchParams.get('userId'); // For admin to fetch specific user's listings
    
    const session = await auth.api.getSession({ headers: request.headers });
    
    // If requesting user's own listings, require auth
    if (userOnly && !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let listingsQuery;
    
    if (publicOnly) {
      // Get all active, approved public listings (status=active means admin approved)
      listingsQuery = await db.query.listings.findMany({
        where: eq(listings.status, 'active'),
        with: {
          animal: {
            columns: {
              id: true,
              name: true,
              profileImageUrl: true,
              dateOfBirth: true,
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
          },
        },
        orderBy: [desc(listings.isFeatured), desc(listings.featuredPriority), desc(listings.createdAt)],
      });

      // Add isOwner flag and boosted status for each listing
      const now = new Date();
      const listingsWithOwnership = listingsQuery.map(listing => ({
        ...listing,
        isOwner: session ? listing.userId === session.user.id : false,
        boosted: listing.isFeatured && listing.featuredEndDate ? new Date(listing.featuredEndDate) > now : false,
      }));
      
      return NextResponse.json({
        success: true,
        listings: listingsWithOwnership,
      });
    } else if (userOnly && session) {
      // Get user's own listings
      const userId = session.user.id;
      
      listingsQuery = await db.query.listings.findMany({
        where: eq(listings.userId, userId),
        with: {
          animal: {
            columns: {
              id: true,
              name: true,
              profileImageUrl: true,
              dateOfBirth: true,
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
          },
        },
        orderBy: [desc(listings.createdAt)],
      });
      
      return NextResponse.json({
        success: true,
        listings: listingsQuery,
      });
    } else if (userId) {
      // Get listings for a specific user (for admin)
      listingsQuery = await db.query.listings.findMany({
        where: eq(listings.userId, userId),
        with: {
          animal: {
            columns: {
              id: true,
              name: true,
              profileImageUrl: true,
              dateOfBirth: true,
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
          },
        },
        orderBy: [desc(listings.createdAt)],
      });
      
      return NextResponse.json({
        success: true,
        listings: listingsQuery,
      });
    } else if (session) {
      // Default: Get user's own listings when authenticated
      const currentUserId = session.user.id;
      
      listingsQuery = await db.query.listings.findMany({
        where: eq(listings.userId, currentUserId),
        with: {
          animal: {
            columns: {
              id: true,
              name: true,
              profileImageUrl: true,
              dateOfBirth: true,
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
          },
        },
        orderBy: [desc(listings.createdAt)],
      });
      
      return NextResponse.json({
        success: true,
        listings: listingsQuery,
      });
    } else {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
