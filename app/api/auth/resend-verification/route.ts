import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/resend-verification
 * Proxy to Better Auth's sendVerificationEmail endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('📧 Resending verification email for:', email);

    // Call Better Auth's sendVerificationEmail endpoint
    // Now that we've configured emailVerification properly, this should work
    const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseURL}/api/auth/send-verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        callbackURL: `${baseURL}/auth/signin?verified=true`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Better Auth resend failed:', data);
      return NextResponse.json(
        { error: data.error || data.message || 'Failed to resend verification email' },
        { status: response.status }
      );
    }

    console.log('✅ Verification email sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error: any) {
    console.error('❌ Error resending verification email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
