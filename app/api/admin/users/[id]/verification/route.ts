import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verificationRequests } from '@/lib/db/schema/verification-requests';
import { users } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { eq } from 'drizzle-orm';

/**
 * Helper to check admin authorization
 */
async function checkAdminAuth(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session?.user) {
    return { authorized: false, session: null };
  }
  
  const userRole = (session.user as any).role;
  if (userRole !== 'admin') {
    return { authorized: false, session: null };
  }
  
  return { authorized: true, session };
}

/**
 * GET /api/admin/users/[id]/verification
 * Get verification status for a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await checkAdminAuth(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: userId } = await params;

    // Get user info
    const [targetUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        isVerified: users.isVerified,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get verification request
    const verification = await db.query.verificationRequests.findFirst({
      where: eq(verificationRequests.userId, userId),
      orderBy: (verificationRequests, { desc }) => [desc(verificationRequests.createdAt)],
    });

    return NextResponse.json({
      success: true,
      verification: verification || null,
      user: targetUser,
    });
  } catch (error) {
    console.error('Error fetching user verification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification' },
      { status: 500 }
    );
  }
}
