import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { purchases, purchaseTimeline } from '@/lib/db/schema/purchases';
import { users } from '@/lib/db/schema/users';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * GET /api/purchases/[id]/timeline
 * Get timeline events for a purchase
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

    // Get timeline events visible to this user
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

    // Get actor details for each event
    const timelineWithActors = await Promise.all(
      timeline.map(async (event) => {
        let actor = null;
        if (event.actorId) {
          const [actorUser] = await db
            .select({
              id: users.id,
              name: users.name,
              image: users.image,
            })
            .from(users)
            .where(eq(users.id, event.actorId))
            .limit(1);
          actor = actorUser;
        }

        return {
          id: event.id,
          eventType: event.eventType,
          eventTitle: event.eventTitle,
          eventDescription: event.eventDescription,
          oldStatus: event.oldStatus,
          newStatus: event.newStatus,
          metadata: event.metadata,
          createdAt: event.createdAt,
          actor,
          actorRole: event.actorRole,
        };
      })
    );

    return NextResponse.json({
      success: true,
      timeline: timelineWithActors,
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/purchases/[id]/timeline
 * Add a custom timeline event (e.g., note, update)
 */
export async function POST(
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

    const { eventType, eventTitle, eventDescription, metadata, visibleToOther = true } = body;

    if (!eventTitle) {
      return NextResponse.json(
        { error: 'Event title is required' },
        { status: 400 }
      );
    }

    // Create timeline event
    const [newEvent] = await db
      .insert(purchaseTimeline)
      .values({
        purchaseId,
        eventType: eventType || 'note',
        eventTitle,
        eventDescription,
        actorId: userId,
        actorRole: userRole,
        metadata: metadata ? JSON.stringify(metadata) : null,
        visibleToPetOwner: userRole === 'pet_owner' || visibleToOther,
        visibleToSeller: userRole === 'seller' || visibleToOther,
      })
      .returning();

    return NextResponse.json({
      success: true,
      event: newEvent,
    });
  } catch (error) {
    console.error('Error creating timeline event:', error);
    return NextResponse.json(
      { error: 'Failed to create timeline event' },
      { status: 500 }
    );
  }
}
