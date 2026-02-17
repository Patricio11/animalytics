import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { boostPricing } from '@/lib/db/schema/boost';
import { eq, asc } from 'drizzle-orm';

/**
 * GET /api/marketplace/boost-pricing
 * Fetch active boost pricing for the boost dialog (public)
 */
export async function GET() {
  try {
    const pricing = await db
      .select()
      .from(boostPricing)
      .where(eq(boostPricing.isActive, true))
      .orderBy(asc(boostPricing.sortOrder));

    return NextResponse.json({ success: true, pricing });
  } catch (error) {
    console.error('Error fetching boost pricing:', error);
    return NextResponse.json({ error: 'Failed to fetch boost pricing' }, { status: 500 });
  }
}
