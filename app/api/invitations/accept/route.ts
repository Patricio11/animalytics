import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vetInvitations, officialClinics, clinicStaff, users, accounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { hash } from 'bcrypt';
import { sendVetWelcomeEmail } from '@/lib/email/send-vet-invitation';
import { createId } from '@paralleldrive/cuid2';

/**
 * POST /api/invitations/accept
 * Accept a veterinarian invitation and create user account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, name } = body;

    if (!token || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find invitation
    const invitation = await db.query.vetInvitations.findFirst({
      where: eq(vetInvitations.token, token),
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expiresAt)) {
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

    // Check if email is already registered
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, invitation.email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Get clinic details
    const clinic = await db.query.officialClinics.findFirst({
      where: eq(officialClinics.id, invitation.clinicId),
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    console.log('Accepting invitation for:', invitation.email);

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Generate IDs
    const userId = createId();
    const accountId = createId();

    // Create user record (Better Auth manages users table)
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        email: invitation.email,
        name: name,
        role: 'veterinarian',
        emailVerified: true, // Auto-verify since they came from invitation
        isVerified: true,
      })
      .returning();

    console.log('User created:', newUser.id);

    // Create account record with password (Better Auth stores passwords here)
    await db
      .insert(accounts)
      .values({
        id: accountId,
        accountId: userId, // Link to user
        providerId: 'credential', // Email/password provider
        userId: userId,
        password: hashedPassword,
      });

    console.log('Account created with password');

    // Check if this is the first vet for the clinic (should be main admin)
    const existingStaff = await db
      .select()
      .from(clinicStaff)
      .where(eq(clinicStaff.clinicId, invitation.clinicId));

    const isMainAdmin = existingStaff.length === 0 || invitation.role === 'main_admin';

    // Add user to clinic staff
    await db
      .insert(clinicStaff)
      .values({
        clinicId: invitation.clinicId,
        userId: newUser.id,
        role: isMainAdmin ? 'main_admin' : invitation.role,
        specialization: invitation.specialization,
        status: 'active',
        invitedBy: invitation.invitedBy,
        canInviteStaff: isMainAdmin,
        canManageClinic: isMainAdmin,
        canViewAllRecords: true,
      });

    console.log('Staff member added to clinic');

    // Update clinic main admin if this is the first vet
    if (isMainAdmin && !clinic.mainAdminId) {
      await db
        .update(officialClinics)
        .set({ 
          mainAdminId: newUser.id,
          updatedAt: new Date(),
        })
        .where(eq(officialClinics.id, invitation.clinicId));

      console.log('Set as main clinic admin');
    }

    // Mark invitation as accepted
    await db
      .update(vetInvitations)
      .set({
        status: 'accepted',
        acceptedAt: new Date(),
      })
      .where(eq(vetInvitations.token, token));

    console.log('Invitation marked as accepted');

    // Send welcome email
    try {
      await sendVetWelcomeEmail({
        email: newUser.email,
        firstName: invitation.firstName || name,
        clinicName: clinic.clinicName,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      clinic: {
        id: clinic.id,
        name: clinic.clinicName,
      },
      isMainAdmin,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
