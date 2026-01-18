import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verificationRequests } from '@/lib/db/schema/verification-requests';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { petOwnerProfiles } from '@/lib/db/schema/pet-owner-profiles';
import { auth } from '@/lib/auth/config';
import { eq } from 'drizzle-orm';

/**
 * GET /api/verification/status
 * Get current user's verification status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({
        isVerified: false,
        verificationStatus: 'not_started',
      });
    }

    const userId = session.user.id;
    const userRole = (session.user as any).role;

    // Get verification request
    const verificationRequest = await db.query.verificationRequests.findFirst({
      where: eq(verificationRequests.userId, userId),
      orderBy: (requests, { desc }) => [desc(requests.createdAt)],
    });

    // If no verification request, check profile for legacy verified status
    if (!verificationRequest) {
      if (userRole === 'breeder') {
        const profile = await db.query.breederProfiles.findFirst({
          where: eq(breederProfiles.userId, userId),
        });

        return NextResponse.json({
          isVerified: profile?.kycVerified || false,
          verificationStatus: profile?.kycVerified ? 'approved' : 'not_started',
        });
      } else if (userRole === 'pet_owner') {
        const profile = await db.query.petOwnerProfiles.findFirst({
          where: eq(petOwnerProfiles.userId, userId),
        });

        return NextResponse.json({
          isVerified: profile?.isVerified || false,
          verificationStatus: profile?.isVerified ? 'approved' : 'not_started',
          verifiedAt: profile?.verifiedAt,
        });
      }

      return NextResponse.json({
        isVerified: false,
        verificationStatus: 'not_started',
      });
    }

    // Return verification request status
    return NextResponse.json({
      isVerified: verificationRequest.status === 'approved',
      verificationStatus: verificationRequest.status,
      verifiedAt: verificationRequest.verifiedAt,
      expiresAt: verificationRequest.expiresAt,
      submittedAt: verificationRequest.submittedAt,
      reviewedAt: verificationRequest.reviewedAt,
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json({
      isVerified: false,
      verificationStatus: 'not_started',
    });
  }
}
