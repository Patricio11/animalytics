/**
 * Pregnancy Screening Tasks Generation API
 * POST - Generate pregnancy screening tasks for a breeding record marked as last mating
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import {
  generatePregnancyScreeningTasks,
  markAsLastMatingAndGenerateTasks,
} from '@/lib/services/pregnancy-screening-tasks';

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

    const { id: breedingRecordId } = await params;
    const body = await request.json();
    const { markAsLast = true } = body;

    let result;

    if (markAsLast) {
      // Mark this breeding as last mating and generate tasks
      result = await markAsLastMatingAndGenerateTasks(
        breedingRecordId,
        session.user.id
      );
    } else {
      // Just generate tasks (assumes already marked as last)
      result = await generatePregnancyScreeningTasks(
        breedingRecordId,
        session.user.id
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate tasks' },
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
    console.error('Error in generate-screening-tasks API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
