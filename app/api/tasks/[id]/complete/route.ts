import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema/tasks';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// POST /api/tasks/[id]/complete - Mark task as completed
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    // Verify task exists and belongs to user
    const existing = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, params.id), eq(tasks.userId, session.user.id)),
    });

    if (!existing) {
      return notFoundResponse('Task not found');
    }

    // Mark task as completed
    const updated = await db
      .update(tasks)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, params.id), eq(tasks.userId, session.user.id)))
      .returning();

    return successResponse(updated[0], 'Task marked as completed');
  } catch (error) {
    console.error('Error completing task:', error);
    return serverErrorResponse('Failed to complete task');
  }
}
