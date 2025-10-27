import { NextRequest } from 'next/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response';
import { processPendingReminders } from '@/lib/services/notifications';

/**
 * POST /api/cron/send-reminders
 * Cron job to send pending progesterone reminders
 * 
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions, etc.)
 * Recommended schedule: Every hour
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return errorResponse('Cron job not configured', 500);
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return unauthorizedResponse();
    }

    console.log('🔔 Processing pending progesterone reminders...');

    // Process all pending reminders
    const results = await processPendingReminders();

    console.log(`✅ Reminders processed:`, results);

    return successResponse({
      message: 'Reminders processed successfully',
      ...results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in cron job:', error);
    return errorResponse('Failed to process reminders', 500);
  }
}

/**
 * GET /api/cron/send-reminders
 * Test endpoint to check cron job status
 */
export async function GET(request: NextRequest) {
  return successResponse({
    message: 'Progesterone reminder cron job endpoint',
    status: 'active',
    schedule: 'Every hour',
    lastRun: new Date().toISOString(),
  });
}
