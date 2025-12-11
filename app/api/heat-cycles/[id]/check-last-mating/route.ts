/**
 * Check Last Mating and Generate Screening Tasks API
 * POST - Automatically detect last mating and generate pregnancy screening tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { checkAndGenerateTasksForLastMating } from '@/lib/services/pregnancy-screening-tasks';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: heatCycleId } = await params;

    const result = await checkAndGenerateTasksForLastMating(
      heatCycleId,
      session.user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to generate tasks',
          info: result.error // Provide info even on "failure" (e.g., too soon)
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${result.tasksCreated} pregnancy screening tasks`,
      tasksCreated: result.tasksCreated,
      tasks: result.tasks,
    });
  } catch (error) {
    console.error('Error in check-last-mating API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
