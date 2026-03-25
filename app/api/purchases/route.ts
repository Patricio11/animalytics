import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { purchases, purchaseTimeline } from '@/lib/db/schema/purchases';
import { listings } from '@/lib/db/schema/marketplace';
import { users } from '@/lib/db/schema/users';
import { animals } from '@/lib/db/schema/animals';
import { conversations } from '@/lib/db/schema/conversations';
import { breederDeliverySettings, listingDeliveryOverrides } from '@/lib/db/schema/breeder-settings';
import { eq, and, or, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { settingsService } from '@/lib/services/payment/settings-service';

/**
 * GET /api/purchases
 * Get all purchases for the current user (as pet owner or seller)
 */
export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get query params
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'pet_owner', 'seller', or null for both
    const status = searchParams.get('status'); // Filter by status

    // Build where clause
    let whereClause;
    if (role === 'pet_owner') {
      whereClause = eq(purchases.petOwnerId, userId);
    } else if (role === 'seller') {
      whereClause = eq(purchases.sellerId, userId);
    } else {
      whereClause = or(
        eq(purchases.petOwnerId, userId),
        eq(purchases.sellerId, userId)
      );
    }

    // Add status filter if provided
    if (status) {
      whereClause = and(whereClause, eq(purchases.status, status as any));
    }

    // Fetch purchases with related data
    const userPurchases = await db
      .select({
        purchase: purchases,
        listing: {
          id: listings.id,
          title: listings.title,
          category: listings.category,
        },
        animal: {
          id: animals.id,
          name: animals.name,
          breedId: animals.breedId,
        },
      })
      .from(purchases)
      .leftJoin(listings, eq(purchases.listingId, listings.id))
      .leftJoin(animals, eq(purchases.animalId, animals.id))
      .where(whereClause)
      .orderBy(desc(purchases.createdAt));

    // Get participant details for each purchase
    const purchasesWithDetails = await Promise.all(
      userPurchases.map(async ({ purchase, listing, animal }) => {
        // Determine the other party
        const otherUserId = purchase.petOwnerId === userId
          ? purchase.sellerId
          : purchase.petOwnerId;

        // Get other user's details
        const [otherUser] = await db
          .select({
            id: users.id,
            name: users.name,
            avatar: users.avatar,
          })
          .from(users)
          .where(eq(users.id, otherUserId))
          .limit(1);

        // Determine user's role in this purchase
        const userRole = purchase.petOwnerId === userId ? 'pet_owner' : 'seller';

        return {
          id: purchase.id,
          status: purchase.status,
          purchasePrice: purchase.purchasePrice,
          currency: purchase.currency,
          totalAmount: purchase.totalAmount,
          paymentMethod: purchase.paymentMethod,
          paymentStatus: purchase.paymentStatus,
          deliveryMethod: purchase.deliveryMethod,
          scheduledDate: purchase.scheduledDate,
          ownershipTransferred: purchase.ownershipTransferred,
          createdAt: purchase.createdAt,
          completedAt: purchase.completedAt,
          userRole,
          otherParty: otherUser || {
            id: otherUserId,
            name: 'Unknown User',
            avatar: null,
          },
          listing: (listing && listing.id) ? {
            id: listing.id,
            title: listing.title,
            category: listing.category,
          } : null,
          animal: (animal && animal.id) ? {
            id: animal.id,
            name: animal.name,
            breedId: animal.breedId,
          } : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      purchases: purchasesWithDetails,
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/purchases
 * Initiate a new purchase
 */
export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const petOwnerId = session.user.id;
    const body = await request.json();

    // Debug logging
    console.log('📦 Purchase request body:', JSON.stringify(body, null, 2));

    const {
      listingId,
      paymentMethod,
      deliveryMethod,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryPostalCode,
      deliveryCountry,
      deliveryNotes,
      scheduledDate,
      scheduledTime,
      petOwnerNotes,
    } = body;

    // Default to stripe if paymentMethod not provided
    const finalPaymentMethod = paymentMethod || 'stripe';

    // Debug logging
    console.log('🔍 Extracted fields:', {
      listingId,
      paymentMethod: finalPaymentMethod,
      originalPaymentMethod: paymentMethod,
      deliveryMethod,
      petOwnerNotes,
    });

    // Validate required fields
    if (!listingId) {
      console.error('❌ Missing listingId');
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    if (!deliveryMethod) {
      return NextResponse.json(
        { error: 'Delivery method is required' },
        { status: 400 }
      );
    }

    // Get the listing
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check listing is active
    if (listing.status !== 'active') {
      return NextResponse.json(
        { error: 'This listing is no longer available' },
        { status: 400 }
      );
    }

    // Prevent pet owner from purchasing their own listing
    if (listing.userId === petOwnerId) {
      return NextResponse.json(
        { error: 'Cannot purchase your own listing' },
        { status: 400 }
      );
    }

    // Get seller info to check if premium
    const [seller] = await db
      .select({
        id: users.id,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, listing.userId))
      .limit(1);

    // Calculate platform fee using database settings
    const purchasePrice = listing.price || 0;
    const isPremiumSeller = false; // TODO: Check if seller has premium subscription
    const platformFee = await settingsService.calculateFee(purchasePrice, isPremiumSeller);
    
    // Calculate delivery fee based on breeder settings and delivery method
    let deliveryFee = 0;
    
    if (deliveryMethod !== 'pickup') {
      // Get breeder's delivery settings
      const [deliverySettings] = await db
        .select()
        .from(breederDeliverySettings)
        .where(eq(breederDeliverySettings.breederId, listing.userId))
        .limit(1);
      
      // Get listing-specific overrides
      const [deliveryOverride] = await db
        .select()
        .from(listingDeliveryOverrides)
        .where(eq(listingDeliveryOverrides.listingId, listingId))
        .limit(1);
      
      // Calculate fee based on delivery method
      if (deliveryMethod === 'delivery') {
        if (deliveryOverride?.deliveryIncluded) {
          deliveryFee = 0; // Free delivery for this listing
        } else if (deliveryOverride?.customLocalDeliveryFee !== null && deliveryOverride?.customLocalDeliveryFee !== undefined) {
          deliveryFee = deliveryOverride.customLocalDeliveryFee;
        } else if (deliverySettings) {
          deliveryFee = deliverySettings.localDeliveryFee || 0;
        }
      } else if (deliveryMethod === 'shipping') {
        // Check if international (simple check - can be enhanced)
        const isInternational = deliveryCountry && deliveryCountry !== 'USA' && deliveryCountry !== 'US';
        
        if (deliveryOverride?.shippingIncluded) {
          deliveryFee = 0; // Free shipping for this listing
        } else if (isInternational && deliveryOverride?.customShippingFeeInternational !== null && deliveryOverride?.customShippingFeeInternational !== undefined) {
          deliveryFee = deliveryOverride.customShippingFeeInternational;
        } else if (deliveryOverride?.customShippingFee !== null && deliveryOverride?.customShippingFee !== undefined) {
          deliveryFee = deliveryOverride.customShippingFee;
        } else if (deliverySettings) {
          if (isInternational && deliverySettings.shippingFeeInternational) {
            deliveryFee = deliverySettings.shippingFeeInternational;
          } else {
            deliveryFee = deliverySettings.shippingFee || 0;
          }
        }
      }
    }
    
    const totalAmount = purchasePrice + platformFee + deliveryFee;

    // Create purchase
    const [newPurchase] = await db
      .insert(purchases)
      .values({
        listingId,
        animalId: listing.animalId,
        petOwnerId,
        sellerId: listing.userId,
        purchasePrice,
        currency: listing.currency || 'USD',
        platformFee,
        deliveryFee,
        totalAmount,
        paymentMethod: finalPaymentMethod,
        deliveryMethod,
        deliveryAddress,
        deliveryCity,
        deliveryState,
        deliveryPostalCode,
        deliveryCountry,
        deliveryNotes,
        scheduledDate,
        scheduledTime,
        petOwnerNotes: petOwnerNotes || null,
        status: 'pending',
        initiatedAt: new Date(),
      })
      .returning();

    // Create initial timeline event
    await db.insert(purchaseTimeline).values({
      purchaseId: newPurchase.id,
      eventType: 'status_change',
      eventTitle: 'Purchase Initiated',
      eventDescription: 'Purchase request submitted by pet owner',
      oldStatus: null,
      newStatus: 'pending',
      actorId: petOwnerId,
      actorRole: 'pet_owner',
    });

    // Update listing status to pending
    await db
      .update(listings)
      .set({
        status: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId));

    // Create or get conversation for this purchase
    let [existingConversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.petOwnerId, petOwnerId),
          eq(conversations.sellerId, listing.userId),
          eq(conversations.listingId, listingId)
        )
      )
      .limit(1);

    if (!existingConversation) {
      // Create a new conversation for this purchase
      [existingConversation] = await db
        .insert(conversations)
        .values({
          petOwnerId,
          sellerId: listing.userId,
          listingId,
          subject: `Purchase: ${listing.title}`,
          lastMessageAt: new Date(),
          lastMessagePreview: 'Purchase request initiated',
          unreadCountSeller: 1,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      purchase: newPurchase,
      conversationId: existingConversation.id,
    });
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 }
    );
  }
}
