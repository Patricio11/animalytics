import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vetInvitations, officialClinics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/invitations/[token]
 * Verify and get invitation details by token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find invitation
    const invitation = await db.query.vetInvitations.findFirst({
      where: eq(vetInvitations.token, token),
      with: {
        clinic: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expiresAt)) {
      // Update status to expired
      await db
        .update(vetInvitations)
        .set({ status: 'expired' })
        .where(eq(vetInvitations.token, token));

      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 410 }
      );
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'This invitation has already been accepted' },
        { status: 410 }
      );
    }

    // Check if cancelled
    if (invitation.status === 'cancelled') {
      return NextResponse.json(
        { error: 'This invitation has been cancelled' },
        { status: 410 }
      );
    }

    // Get clinic details
    const clinic = await db.query.officialClinics.findFirst({
      where: eq(officialClinics.id, invitation.clinicId),
    });

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        role: invitation.role,
        specialization: invitation.specialization,
        message: invitation.message,
        expiresAt: invitation.expiresAt,
      },
      clinic: {
        id: clinic?.id,
        name: clinic?.clinicName,
        city: clinic?.city,
        state: clinic?.state,
      },
    });
  } catch (error) {
    console.error('Error verifying invitation:', error);
    return NextResponse.json(
      { error: 'Failed to verify invitation' },
      { status: 500 }
    );
  }
}
