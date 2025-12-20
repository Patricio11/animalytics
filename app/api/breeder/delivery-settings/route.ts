import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederDeliverySettings } from '@/lib/db/schema/breeder-settings';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * GET /api/breeder/delivery-settings
 * Get breeder's delivery settings
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

    // Only breeders can access delivery settings
    if (session.user.role !== 'breeder') {
      return NextResponse.json(
        { error: 'Only breeders can access delivery settings' },
        { status: 403 }
      );
    }

    const breederId = session.user.id;

    // Get delivery settings
    const [settings] = await db
      .select()
      .from(breederDeliverySettings)
      .where(eq(breederDeliverySettings.breederId, breederId))
      .limit(1);

    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json({
        success: true,
        settings: {
          breederId,
          offersPickup: true,
          offersLocalDelivery: false,
          offersShipping: false,
          pickupLocation: null,
          pickupInstructions: null,
          localDeliveryFee: 0,
          localDeliveryNotes: null,
          localDeliveryEstimatedDays: 1,
          shippingFee: 0,
          shippingFeeInternational: null,
          shippingEstimatedDays: 3,
          shippingNotes: null,
          deliveryPolicy: null,
          isActive: true,
        },
        exists: false,
      });
    }

    return NextResponse.json({
      success: true,
      settings,
      exists: true,
    });
  } catch (error) {
    console.error('Error fetching delivery settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/breeder/delivery-settings
 * Create or update breeder's delivery settings
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

    // Only breeders can update delivery settings
    if (session.user.role !== 'breeder') {
      return NextResponse.json(
        { error: 'Only breeders can update delivery settings' },
        { status: 403 }
      );
    }

    const breederId = session.user.id;
    const body = await request.json();

    // Validate input
    const {
      offersPickup = true,
      offersLocalDelivery = false,
      offersShipping = false,
      pickupLocation,
      pickupInstructions,
      localDeliveryFee = 0,
      localDeliveryNotes,
      localDeliveryEstimatedDays = 1,
      shippingFee = 0,
      shippingFeeInternational,
      shippingEstimatedDays = 3,
      shippingNotes,
      deliveryPolicy,
      isActive = true,
    } = body;

    // Validation: At least one delivery method must be enabled
    if (!offersPickup && !offersLocalDelivery && !offersShipping) {
      return NextResponse.json(
        { error: 'At least one delivery method must be enabled' },
        { status: 400 }
      );
    }

    // Validation: Fees must be non-negative
    if (localDeliveryFee < 0 || shippingFee < 0) {
      return NextResponse.json(
        { error: 'Delivery fees must be non-negative' },
        { status: 400 }
      );
    }

    // Validation: Estimated days must be positive
    if (localDeliveryEstimatedDays < 0 || shippingEstimatedDays < 0) {
      return NextResponse.json(
        { error: 'Estimated days must be non-negative' },
        { status: 400 }
      );
    }

    // Check if settings already exist
    const [existingSettings] = await db
      .select()
      .from(breederDeliverySettings)
      .where(eq(breederDeliverySettings.breederId, breederId))
      .limit(1);

    let settings;

    if (existingSettings) {
      // Update existing settings
      [settings] = await db
        .update(breederDeliverySettings)
        .set({
          offersPickup,
          offersLocalDelivery,
          offersShipping,
          pickupLocation,
          pickupInstructions,
          localDeliveryFee,
          localDeliveryNotes,
          localDeliveryEstimatedDays,
          shippingFee,
          shippingFeeInternational,
          shippingEstimatedDays,
          shippingNotes,
          deliveryPolicy,
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(breederDeliverySettings.breederId, breederId))
        .returning();
    } else {
      // Create new settings
      [settings] = await db
        .insert(breederDeliverySettings)
        .values({
          breederId,
          offersPickup,
          offersLocalDelivery,
          offersShipping,
          pickupLocation,
          pickupInstructions,
          localDeliveryFee,
          localDeliveryNotes,
          localDeliveryEstimatedDays,
          shippingFee,
          shippingFeeInternational,
          shippingEstimatedDays,
          shippingNotes,
          deliveryPolicy,
          isActive,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      settings,
      message: existingSettings ? 'Delivery settings updated successfully' : 'Delivery settings created successfully',
    });
  } catch (error) {
    console.error('Error saving delivery settings:', error);
    return NextResponse.json(
      { error: 'Failed to save delivery settings' },
      { status: 500 }
    );
  }
}
