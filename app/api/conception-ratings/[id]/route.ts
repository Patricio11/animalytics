import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { matings } from '@/lib/db/schema/matings';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// DELETE /api/conception-ratings/[id]
// ============================================================================
// Delete a conception rating (mating record)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const matingId = params.id;

    // Check if mating exists and belongs to user
    const mating = await db.query.matings.findFirst({
      where: and(
        eq(matings.id, matingId),
        eq(matings.userId, userId)
      ),
    });

    if (!mating) {
      return NextResponse.json(
        { error: 'Conception rating not found' },
        { status: 404 }
      );
    }

    // Delete the mating record
    await db
      .delete(matings)
      .where(and(
        eq(matings.id, matingId),
        eq(matings.userId, userId)
      ));

    return NextResponse.json({
      success: true,
      message: 'Conception rating deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting conception rating:', error);
    return NextResponse.json(
      { error: 'Failed to delete conception rating' },
      { status: 500 }
    );
  }
}
