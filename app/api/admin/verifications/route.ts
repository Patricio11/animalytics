import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verificationRequests } from '@/lib/db/schema/verification-requests';
import { users } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { eq, or, and, desc, ilike, sql, count } from 'drizzle-orm';

/**
 * GET /api/admin/verifications
 * List all verification requests (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userRoleFilter = searchParams.get('userRole');
    const search = searchParams.get('search');
    const limit = Number(searchParams.get('limit') || '50');
    const offset = Number(searchParams.get('offset') || '0');

    // Build where conditions
    const conditions: any[] = [];

    if (status) {
      conditions.push(eq(verificationRequests.status, status));
    }

    if (userRoleFilter) {
      conditions.push(eq(verificationRequests.userRole, userRoleFilter));
    }

    if (search) {
      conditions.push(
        or(
          ilike(verificationRequests.firstName, `%${search}%`),
          ilike(verificationRequests.lastName, `%${search}%`)
        )
      );
    }

    // Fetch verification requests with user info
    const requests = await db
      .select({
        verification: verificationRequests,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        },
      })
      .from(verificationRequests)
      .leftJoin(users, eq(verificationRequests.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(verificationRequests.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: verificationRequests.id })
      .from(verificationRequests)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult.length;

    // Get counts by status
    const statusCounts = await db
      .select({
        status: verificationRequests.status,
        count: count(verificationRequests.id),
      })
      .from(verificationRequests)
      .groupBy(verificationRequests.status);

    return NextResponse.json({
      success: true,
      requests: requests.map(r => ({
        ...r.verification,
        user: r.user,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      statusCounts: statusCounts.reduce((acc, { status, count }) => {
        acc[status] = count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification requests' },
      { status: 500 }
    );
  }
}
