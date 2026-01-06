import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { purchases, purchaseTimeline, purchaseDocuments } from '@/lib/db/schema/purchases';
import { listings } from '@/lib/db/schema/marketplace';
import { animals } from '@/lib/db/schema/animals';
import { users } from '@/lib/db/schema/users';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { 
  createItemDispatchedNotification, 
  createPurchaseCompletedNotification 
} from '@/lib/services/notification-creator';

/**
 * GET /api/purchases/[id]
 * Get a single purchase with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: purchaseId } = await params;

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

    // Get purchase with related data
    const [purchaseData] = await db
      .select({
        purchase: purchases,
        listing: listings,
        animal: animals,
      })
      .from(purchases)
      .leftJoin(listings, eq(purchases.listingId, listings.id))
      .leftJoin(animals, eq(purchases.animalId, animals.id))
      .where(eq(purchases.id, purchaseId))
      .limit(1);

    if (!purchaseData) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    const { purchase, listing, animal } = purchaseData;

    // Check if user is part of the purchase
    if (purchase.petOwnerId !== userId && purchase.sellerId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Determine user's role
    const userRole = purchase.petOwnerId === userId ? 'pet_owner' : 'seller';

    // Get pet owner details
    const [petOwner] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
      })
      .from(users)
      .where(eq(users.id, purchase.petOwnerId))
      .limit(1);

    // Get seller details
    const [seller] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
      })
      .from(users)
      .where(eq(users.id, purchase.sellerId))
      .limit(1);

    // Get timeline events
    const timeline = await db
      .select()
      .from(purchaseTimeline)
      .where(
        and(
          eq(purchaseTimeline.purchaseId, purchaseId),
          userRole === 'pet_owner'
            ? eq(purchaseTimeline.visibleToPetOwner, true)
            : eq(purchaseTimeline.visibleToSeller, true)
        )
      )
      .orderBy(desc(purchaseTimeline.createdAt));

    // Get documents
    const documents = await db
      .select()
      .from(purchaseDocuments)
      .where(
        and(
          eq(purchaseDocuments.purchaseId, purchaseId),
          userRole === 'pet_owner'
            ? eq(purchaseDocuments.accessibleToPetOwner, true)
            : eq(purchaseDocuments.accessibleToSeller, true)
        )
      )
      .orderBy(desc(purchaseDocuments.createdAt));

    return NextResponse.json({
      success: true,
      purchase: {
        id: purchase.id,
        status: purchase.status,
        purchasePrice: purchase.purchasePrice,
        currency: purchase.currency,
        platformFee: purchase.platformFee,
        deliveryFee: purchase.deliveryFee,
        totalAmount: purchase.totalAmount,
        paymentMethod: purchase.paymentMethod,
        paymentStatus: purchase.paymentStatus,
        paymentCompletedAt: purchase.paymentCompletedAt,
        deliveryMethod: purchase.deliveryMethod,
        deliveryAddress: purchase.deliveryAddress,
        deliveryCity: purchase.deliveryCity,
        deliveryState: purchase.deliveryState,
        deliveryPostalCode: purchase.deliveryPostalCode,
        deliveryCountry: purchase.deliveryCountry,
        deliveryNotes: purchase.deliveryNotes,
        scheduledDate: purchase.scheduledDate,
        scheduledTime: purchase.scheduledTime,
        actualHandoverDate: purchase.actualHandoverDate,
        ownershipTransferred: purchase.ownershipTransferred,
        transferredAt: purchase.transferredAt,
        isDisputed: purchase.isDisputed,
        disputeReason: purchase.disputeReason,
        petOwnerNotes: purchase.petOwnerNotes,
        sellerNotes: userRole === 'seller' ? purchase.sellerNotes : undefined,
        initiatedAt: purchase.initiatedAt,
        confirmedAt: purchase.confirmedAt,
        completedAt: purchase.completedAt,
        cancelledAt: purchase.cancelledAt,
        cancelReason: purchase.cancelReason,
        createdAt: purchase.createdAt,
        userRole,
      },
      petOwner,
      seller,
      listing: listing ? {
        id: listing.id,
        title: listing.title,
        category: listing.category,
        price: listing.price,
        currency: listing.currency,
        contactName: listing.contactName,
        contactEmail: listing.contactEmail,
        contactPhone: listing.contactPhone,
        location: listing.location,
        additionalImages: listing.additionalImages,
      } : null,
      animal: animal ? {
        id: animal.id,
        name: animal.name,
        breedId: animal.breedId,
        sex: animal.sex,
        dateOfBirth: animal.dateOfBirth,
        registrationNumber: animal.registrationNumber,
        primaryPhotoUrl: animal.profileImageUrl,
      } : null,
      timeline,
      documents,
    });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/purchases/[id]
 * Update purchase status or details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: purchaseId } = await params;

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
    const body = await request.json();

    // Get purchase
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, purchaseId))
      .limit(1);

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Check if user is part of the purchase
    if (purchase.petOwnerId !== userId && purchase.sellerId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const userRole = purchase.petOwnerId === userId ? 'pet_owner' : 'seller';
    const { action } = body;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    let eventTitle = '';
    let eventDescription = '';
    let oldStatus = purchase.status;
    let newStatus = purchase.status;

    // Handle different actions based on user role and current status
    switch (action) {
      case 'confirm':
        // Seller confirms the purchase
        if (userRole !== 'seller') {
          return NextResponse.json(
            { error: 'Only seller can confirm purchase' },
            { status: 403 }
          );
        }
        if (purchase.status !== 'pending' && purchase.status !== 'payment_completed') {
          return NextResponse.json(
            { error: 'Purchase cannot be confirmed in current status' },
            { status: 400 }
          );
        }
        newStatus = 'confirmed';
        updateData.status = newStatus;
        updateData.confirmedAt = new Date();
        eventTitle = 'Purchase Confirmed';
        eventDescription = 'Seller has confirmed the purchase request';
        break;

      case 'prepare':
        // Seller marks as preparing
        if (userRole !== 'seller') {
          return NextResponse.json(
            { error: 'Only seller can mark as preparing' },
            { status: 403 }
          );
        }
        if (purchase.status !== 'confirmed') {
          return NextResponse.json(
            { error: 'Purchase must be confirmed before preparing' },
            { status: 400 }
          );
        }
        newStatus = 'preparing';
        updateData.status = newStatus;
        updateData.preparedAt = new Date();
        eventTitle = 'Preparing for Handover';
        eventDescription = 'Seller is preparing the animal for handover';
        break;

      case 'ready':
        // Seller marks as ready for pickup
        if (userRole !== 'seller') {
          return NextResponse.json(
            { error: 'Only seller can mark as ready' },
            { status: 403 }
          );
        }
        if (purchase.status !== 'preparing') {
          return NextResponse.json(
            { error: 'Purchase must be in preparing status' },
            { status: 400 }
          );
        }
        newStatus = 'ready_for_pickup';
        updateData.status = newStatus;
        updateData.readyAt = new Date();
        eventTitle = 'Ready for Pickup';
        eventDescription = 'Animal is ready for pickup/delivery';
        break;

      case 'dispatch':
      case 'in_transit':
        // Mark as dispatched/in transit (seller marks as shipped)
        if (userRole !== 'seller') {
          return NextResponse.json(
            { error: 'Only seller can mark as dispatched' },
            { status: 403 }
          );
        }
        // Allow dispatch from payment_completed, confirmed, preparing, or ready_for_pickup
        if (!['payment_completed', 'confirmed', 'preparing', 'ready_for_pickup'].includes(purchase.status)) {
          return NextResponse.json(
            { error: 'Purchase cannot be dispatched in current status' },
            { status: 400 }
          );
        }
        newStatus = 'in_transit';
        updateData.status = newStatus;
        updateData.readyAt = new Date(); // Mark as ready when dispatched
        eventTitle = 'Dispatched';
        eventDescription = 'Seller has dispatched the item';
        break;

      case 'complete':
        // Only PET OWNER can complete (confirm receipt)
        if (userRole !== 'pet_owner') {
          return NextResponse.json(
            { error: 'Only pet owner can confirm receipt and complete purchase' },
            { status: 403 }
          );
        }
        if (purchase.status !== 'ready_for_pickup' && purchase.status !== 'in_transit') {
          return NextResponse.json(
            { error: 'Purchase cannot be completed in current status' },
            { status: 400 }
          );
        }
        newStatus = 'completed';
        updateData.status = newStatus;
        updateData.completedAt = new Date();
        updateData.actualHandoverDate = new Date();
        updateData.ownershipTransferred = true;
        updateData.transferredAt = new Date();
        eventTitle = 'Purchase Completed';
        eventDescription = 'Buyer confirmed receipt of item';

        // Update listing status to sold
        if (purchase.listingId) {
          await db
            .update(listings)
            .set({
              status: 'sold',
              soldAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(listings.id, purchase.listingId));
        }
        break;

      case 'cancel':
        // Either party can cancel (with restrictions based on status)
        if (['completed', 'cancelled', 'refunded'].includes(purchase.status)) {
          return NextResponse.json(
            { error: 'Purchase cannot be cancelled in current status' },
            { status: 400 }
          );
        }
        newStatus = 'cancelled';
        updateData.status = newStatus;
        updateData.cancelledAt = new Date();
        updateData.cancelledBy = userRole;
        updateData.cancelReason = body.reason || 'No reason provided';
        eventTitle = 'Purchase Cancelled';
        eventDescription = `${userRole === 'pet_owner' ? 'Pet Owner' : 'Seller'} cancelled the purchase: ${body.reason || 'No reason provided'}`;

        // Reactivate listing
        if (purchase.listingId) {
          await db
            .update(listings)
            .set({
              status: 'active',
              updatedAt: new Date(),
            })
            .where(eq(listings.id, purchase.listingId));
        }
        break;

      case 'dispute':
        // Pet owner can open a dispute
        if (userRole !== 'pet_owner') {
          return NextResponse.json(
            { error: 'Only pet owner can open a dispute' },
            { status: 403 }
          );
        }
        if (purchase.isDisputed) {
          return NextResponse.json(
            { error: 'Purchase is already disputed' },
            { status: 400 }
          );
        }
        newStatus = 'disputed';
        updateData.status = newStatus;
        updateData.isDisputed = true;
        updateData.disputeReason = body.reason || 'No reason provided';
        updateData.disputeOpenedAt = new Date();
        eventTitle = 'Dispute Opened';
        eventDescription = `Pet owner opened a dispute: ${body.reason || 'No reason provided'}`;
        break;

      case 'update_notes':
        // Update notes
        if (userRole === 'pet_owner') {
          updateData.petOwnerNotes = body.notes;
        } else {
          updateData.sellerNotes = body.notes;
        }
        eventTitle = 'Notes Updated';
        eventDescription = `${userRole === 'pet_owner' ? 'Pet Owner' : 'Seller'} updated notes`;
        break;

      case 'update_schedule':
        // Update scheduled date/time
        if (body.scheduledDate) updateData.scheduledDate = body.scheduledDate;
        if (body.scheduledTime) updateData.scheduledTime = body.scheduledTime;
        eventTitle = 'Schedule Updated';
        eventDescription = `${userRole === 'pet_owner' ? 'Pet Owner' : 'Seller'} updated pickup/delivery schedule`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update purchase
    const [updatedPurchase] = await db
      .update(purchases)
      .set(updateData)
      .where(eq(purchases.id, purchaseId))
      .returning();

    // Create timeline event
    await db.insert(purchaseTimeline).values({
      purchaseId,
      eventType: action === 'update_notes' || action === 'update_schedule' ? 'update' : 'status_change',
      eventTitle,
      eventDescription,
      oldStatus,
      newStatus,
      actorId: userId,
      actorRole: userRole,
    });

    // Send notifications for key actions
    try {
      if (action === 'dispatch' || action === 'in_transit') {
        // Notify pet owner when seller dispatches
        const [listing] = await db
          .select({ title: listings.title })
          .from(listings)
          .where(eq(listings.id, purchase.listingId!))
          .limit(1);

        if (listing) {
          await createItemDispatchedNotification({
            buyerId: purchase.petOwnerId,
            listingTitle: listing.title,
            purchaseId,
          });
        }
      } else if (action === 'complete') {
        // Notify seller when pet owner confirms receipt
        const [listing] = await db
          .select({ title: listings.title })
          .from(listings)
          .where(eq(listings.id, purchase.listingId!))
          .limit(1);

        const [petOwner] = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, purchase.petOwnerId))
          .limit(1);

        if (listing && petOwner) {
          await createPurchaseCompletedNotification({
            sellerId: purchase.sellerId,
            buyerName: petOwner.name || 'The pet owner',
            listingTitle: listing.title,
            purchaseId,
          });
        }
      }
    } catch (notifError) {
      console.error('Failed to send purchase notification:', notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      purchase: updatedPurchase,
    });
  } catch (error) {
    console.error('Error updating purchase:', error);
    return NextResponse.json(
      { error: 'Failed to update purchase' },
      { status: 500 }
    );
  }
}
