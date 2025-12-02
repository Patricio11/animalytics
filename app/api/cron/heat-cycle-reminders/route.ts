import { NextRequest, NextResponse } from 'next/server';
import { sendNextCycleReminders } from '@/lib/services/heat-cycle-reminders';

/**
 * POST /api/cron/heat-cycle-reminders
 * Cron job endpoint to check and send heat cycle reminders
 * 
 * This should be called daily by a cron service (e.g., Vercel Cron, GitHub Actions, etc.)
 * 
 * For security, you can add a CRON_SECRET to verify the request:
 * if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Heat cycle reminder cron job triggered');

    // Optional: Verify cron secret for production
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.error('❌ Unauthorized cron request');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Run the reminder check
    const result = await sendNextCycleReminders();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully processed ${result.remindersCreated} reminders`,
        remindersCreated: result.remindersCreated,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error in heat cycle reminder cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/heat-cycle-reminders
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'heat-cycle-reminders',
    message: 'Use POST to trigger the cron job',
  });
}
