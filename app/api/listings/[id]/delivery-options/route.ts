import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederDeliverySettings, listingDeliveryOverrides } from '@/lib/db/schema/breeder-settings';
import { listings } from '@/lib/db/schema/marketplace';
import { eq } from 'drizzle-orm';

/**
 * GET /api/listings/[id]/delivery-options
 * Get available delivery options and fees for a listing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;

    // Get listing to find the breeder
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

    // Get breeder's delivery settings
    const [settings] = await db
      .select()
      .from(breederDeliverySettings)
      .where(eq(breederDeliverySettings.breederId, listing.userId))
      .limit(1);

    // Get listing-specific overrides (if any)
    const [override] = await db
      .select()
      .from(listingDeliveryOverrides)
      .where(eq(listingDeliveryOverrides.listingId, listingId))
      .limit(1);

    // Default settings if breeder hasn't configured
    const defaultSettings = {
      offersPickup: true,
      offersLocalDelivery: false,
      offersShipping: false,
      localDeliveryFee: 0,
      localDeliveryEstimatedDays: 1,
      shippingFee: 0,
      shippingFeeInternational: null,
      shippingEstimatedDays: 3,
    };

    const activeSettings = settings || defaultSettings;

    // Build delivery options array
    const options = [];

    // Check if listing is pickup-only
    const isPickupOnly = override?.pickupOnly || false;

    // PICKUP
    if (activeSettings.offersPickup) {
      options.push({
        method: 'pickup',
        available: true,
        fee: 0,
        label: 'Pickup',
        description: 'Pick up from breeder\'s location',
        estimatedDays: 0,
        notes: settings?.pickupInstructions || null,
      });
    }

    // LOCAL DELIVERY
    if (!isPickupOnly && activeSettings.offersLocalDelivery) {
      const deliveryFee = override?.deliveryIncluded 
        ? 0 
        : (override?.customLocalDeliveryFee ?? activeSettings.localDeliveryFee);

      options.push({
        method: 'delivery',
        available: true,
        fee: deliveryFee,
        label: override?.deliveryIncluded ? 'Local Delivery (FREE)' : 'Local Delivery',
        description: 'Delivered to your location',
        estimatedDays: activeSettings.localDeliveryEstimatedDays,
        notes: override?.specialDeliveryNotes || settings?.localDeliveryNotes || null,
      });
    }

    // SHIPPING
    if (!isPickupOnly && activeSettings.offersShipping) {
      const shippingFee = override?.shippingIncluded 
        ? 0 
        : (override?.customShippingFee ?? activeSettings.shippingFee);

      const shippingFeeInternational = override?.shippingIncluded
        ? 0
        : (override?.customShippingFeeInternational ?? activeSettings.shippingFeeInternational ?? shippingFee);

      options.push({
        method: 'shipping',
        available: true,
        fee: shippingFee,
        feeInternational: shippingFeeInternational,
        label: override?.shippingIncluded ? 'Shipping (FREE)' : 'Shipping',
        description: 'Shipped to your address',
        estimatedDays: activeSettings.shippingEstimatedDays,
        notes: override?.specialDeliveryNotes || settings?.shippingNotes || null,
      });
    }

    // If no options available (shouldn't happen, but handle it)
    if (options.length === 0) {
      options.push({
        method: 'pickup',
        available: true,
        fee: 0,
        label: 'Pickup',
        description: 'Pick up from breeder\'s location',
        estimatedDays: 0,
      });
    }

    return NextResponse.json({
      success: true,
      listingId,
      breederId: listing.userId,
      options,
      hasOverride: !!override,
      pickupLocation: settings?.pickupLocation || null,
      deliveryPolicy: settings?.deliveryPolicy || null,
    });
  } catch (error) {
    console.error('Error fetching delivery options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery options' },
      { status: 500 }
    );
  }
}
