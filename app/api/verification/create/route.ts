import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verificationRequests, verificationAuditLog } from '@/lib/db/schema/verification-requests';
import { users } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { eq } from 'drizzle-orm';

/**
 * POST /api/verification/create
 * Create a new verification request or get existing draft
 */
export async function POST(request: NextRequest) {
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

    const userId = session.user.id;
    const userRole = (session.user as any).role;

    // Validate role
    if (userRole !== 'breeder' && userRole !== 'pet_owner') {
      return NextResponse.json(
        { error: 'Only breeders and pet owners can request verification' },
        { status: 403 }
      );
    }

    // Check if user already has a verification request
    const existingRequest = await db.query.verificationRequests.findFirst({
      where: eq(verificationRequests.userId, userId),
      orderBy: (requests, { desc }) => [desc(requests.createdAt)],
    });

    // If there's an existing draft or pending request, return it
    if (existingRequest && ['draft', 'submitted', 'under_review'].includes(existingRequest.status)) {
      return NextResponse.json({
        success: true,
        verificationRequest: existingRequest,
        message: 'Existing verification request found',
      });
    }

    // Get user info for pre-filling
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // Create new verification request
    const [newRequest] = await db.insert(verificationRequests).values({
      userId,
      userRole,
      status: 'draft',
      currentStep: 'personal_info',
      completedSteps: [],
      phoneVerified: false,
      feePaid: false,
      additionalDocuments: [],
      // Pre-fill from user data if available
      firstName: user?.name?.split(' ')[0] || undefined,
      lastName: user?.name?.split(' ').slice(1).join(' ') || undefined,
      phoneNumber: (user?.preferences as any)?.phoneNumber || undefined,
    }).returning();

    // Create audit log entry
    await db.insert(verificationAuditLog).values({
      verificationRequestId: newRequest.id,
      userId,
      action: 'created',
      newStatus: 'draft',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    console.log(`✅ Verification request created: ${newRequest.id} for user ${userId}`);

    return NextResponse.json({
      success: true,
      verificationRequest: newRequest,
      message: 'Verification request created successfully',
    });
  } catch (error) {
    console.error('Error creating verification request:', error);
    return NextResponse.json(
      { error: 'Failed to create verification request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/verification/create
 * Get current user's verification request
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

    const userId = session.user.id;

    // Get latest verification request
    const verificationRequest = await db.query.verificationRequests.findFirst({
      where: eq(verificationRequests.userId, userId),
      orderBy: (requests, { desc }) => [desc(requests.createdAt)],
    });

    if (!verificationRequest) {
      return NextResponse.json({
        success: true,
        verificationRequest: null,
        message: 'No verification request found',
      });
    }

    return NextResponse.json({
      success: true,
      verificationRequest,
    });
  } catch (error) {
    console.error('Error fetching verification request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification request' },
      { status: 500 }
    );
  }
}
