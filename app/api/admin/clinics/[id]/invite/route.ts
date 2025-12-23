import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { officialClinics, vetInvitations, users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/server';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { sendVetInvitation } from '@/lib/email/send-vet-invitation';

/**
 * POST /api/admin/clinics/[id]/invite
 * Invite a veterinarian to join a clinic (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: clinicId } = await params;
    const body = await request.json();

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Verify clinic exists
    const clinic = await db.query.officialClinics.findFirst({
      where: eq(officialClinics.id, clinicId),
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Check if email is already registered
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation for this email to this clinic
    const existingInvitation = await db.query.vetInvitations.findFirst({
      where: eq(vetInvitations.email, body.email),
    });

    if (existingInvitation && existingInvitation.status === 'pending') {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      );
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');

    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    console.log('Creating vet invitation for:', body.email);

    // Create invitation
    const [invitation] = await db
      .insert(vetInvitations)
      .values({
        clinicId,
        email: body.email,
        firstName: body.firstName || null,
        lastName: body.lastName || null,
        role: body.role || 'vet',
        specialization: body.specialization || null,
        token,
        invitedBy: session.user.id,
        inviterRole: 'admin',
        message: body.message || null,
        status: 'pending',
        expiresAt,
      })
      .returning();

    // Send invitation email
    try {
      await sendVetInvitation({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        clinicName: clinic.clinicName,
        inviterName: session.user.name || 'Admin',
        inviterRole: 'System Administrator',
        token,
        message: body.message,
        expiresInDays: 7,
      });

      console.log('Invitation email sent successfully to:', body.email);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the request if email fails, but log it
      // The invitation is still created and can be resent
    }

    return NextResponse.json({
      success: true,
      invitation,
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}
