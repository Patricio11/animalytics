import { NextResponse } from 'next/server';
import { sendEmail, verifyEmailConfig } from '@/lib/services/email';

export async function GET() {
  try {
    // First verify email configuration
    console.log('🔍 Verifying email configuration...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MAILTRAP_HOST:', process.env.MAILTRAP_HOST);
    console.log('MAILTRAP_PORT:', process.env.MAILTRAP_PORT);
    console.log('MAILTRAP_USER:', process.env.MAILTRAP_USER ? '✓ Set' : '✗ Not set');
    console.log('MAILTRAP_PASS:', process.env.MAILTRAP_PASS ? '✓ Set' : '✗ Not set');
    
    const isConfigValid = await verifyEmailConfig();
    
    if (!isConfigValid) {
      return NextResponse.json({
        success: false,
        error: 'Email configuration verification failed',
        details: 'Check server logs for more information'
      }, { status: 500 });
    }

    // Send test email
    console.log('📧 Sending test email...');
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email from Animalytics',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #667eea;">✅ Email Configuration Working!</h1>
          <p>This is a test email from Animalytics.</p>
          <p>If you received this, your email configuration is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
    });

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully! Check your Mailtrap inbox.',
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email',
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ Email test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
