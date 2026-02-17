import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { boostPricing } from '@/lib/db/schema/boost';
import { eq, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

async function isAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.role === 'admin';
}

/**
 * GET /api/admin/marketplace/boost-pricing
 * Fetch all boost pricing configurations
 */
export async function GET() {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const pricing = await db
      .select()
      .from(boostPricing)
      .orderBy(asc(boostPricing.sortOrder));

    return NextResponse.json({ success: true, pricing });
  } catch (error) {
    console.error('Error fetching boost pricing:', error);
    return NextResponse.json({ error: 'Failed to fetch boost pricing' }, { status: 500 });
  }
}

/**
 * POST /api/admin/marketplace/boost-pricing
 * Create or update boost pricing for a platform
 */
export async function POST(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, platform, displayName, pricePerDay, currency, isActive, description, sortOrder } = body;

    if (!platform || !displayName || pricePerDay === undefined) {
      return NextResponse.json(
        { error: 'Platform, display name, and price per day are required' },
        { status: 400 }
      );
    }

    if (id) {
      // Update existing
      const [updated] = await db
        .update(boostPricing)
        .set({
          platform,
          displayName,
          pricePerDay: Math.round(pricePerDay),
          currency: currency || 'USD',
          isActive: isActive ?? true,
          description,
          sortOrder: sortOrder ?? 0,
          updatedAt: new Date(),
        })
        .where(eq(boostPricing.id, id))
        .returning();

      return NextResponse.json({ success: true, pricing: updated });
    }

    // Create new
    const [created] = await db
      .insert(boostPricing)
      .values({
        platform,
        displayName,
        pricePerDay: Math.round(pricePerDay),
        currency: currency || 'USD',
        isActive: isActive ?? true,
        description,
        sortOrder: sortOrder ?? 0,
      })
      .returning();

    return NextResponse.json({ success: true, pricing: created });
  } catch (error) {
    console.error('Error saving boost pricing:', error);
    return NextResponse.json({ error: 'Failed to save boost pricing' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/marketplace/boost-pricing
 * Delete a boost pricing entry
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.delete(boostPricing).where(eq(boostPricing.id, id));

    return NextResponse.json({ success: true, message: 'Pricing deleted' });
  } catch (error) {
    console.error('Error deleting boost pricing:', error);
    return NextResponse.json({ error: 'Failed to delete pricing' }, { status: 500 });
  }
}
