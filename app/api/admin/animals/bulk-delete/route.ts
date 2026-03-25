import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { animalIds } = body;

    if (!animalIds || !Array.isArray(animalIds) || animalIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid animal IDs' },
        { status: 400 }
      );
    }

    // Soft delete by marking as inactive
    await db
      .update(animals)
      .set({ isActive: false })
      .where(inArray(animals.id, animalIds));

    return NextResponse.json({
      success: true,
      deletedCount: animalIds.length,
    });
  } catch (error) {
    console.error('Error bulk deleting animals:', error);
    return NextResponse.json(
      { error: 'Failed to delete animals' },
      { status: 500 }
    );
  }
}
