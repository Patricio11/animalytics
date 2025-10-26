import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { litters, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

// ============================================================================
// GET /api/litters - List all litters for current user
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const bitchId = searchParams.get('bitchId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Build where clause
    let whereConditions: any[] = [];

    // Filter by bitch
    if (bitchId) {
      whereConditions.push(eq(litters.bitchId, bitchId));
    }

    // Filter by date range (actual whelping date)
    if (fromDate) {
      whereConditions.push(gte(litters.actualWhelpingDate, fromDate));
    }
    if (toDate) {
      whereConditions.push(lte(litters.actualWhelpingDate, toDate));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const userLitters = await db.query.litters.findMany({
      where: whereClause,
      with: {
        bitch: {
          columns: {
            id: true,
            name: true,
            sex: true,
            profileImageUrl: true,
          },
          with: {
            breed: true,
          },
        },
        sire: {
          columns: {
            id: true,
            name: true,
            sex: true,
            profileImageUrl: true,
          },
          with: {
            breed: true,
          },
        },
        puppies: true, // ✅ Include puppies using the relation
      },
      orderBy: [desc(litters.actualWhelpingDate), desc(litters.createdAt)],
    });

    // Filter by user after fetching (since litters don't have userId directly)
    const filteredLitters = userLitters.filter(
      (litter: any) => litter.bitch?.userId === session.user.id
    );

    return successResponse(filteredLitters, undefined, {
      total: filteredLitters.length,
    });
  } catch (error) {
    console.error('Error fetching litters:', error);
    return serverErrorResponse('Failed to fetch litters');
  }
}
