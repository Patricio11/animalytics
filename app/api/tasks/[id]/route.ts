import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema/tasks';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateTaskSchema = z.object({
  taskType: z
    .enum(['feeding', 'exercise', 'grooming', 'weight', 'cleaning', 'event'])
    .optional(),
  animalId: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  taskData: z.any().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  isCompleted: z.boolean().optional(),
  completedAt: z.string().optional(),
});

// ============================================================================
// GET /api/tasks/[id] - Get single task
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const task = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, id), eq(tasks.userId, session.user.id)),
      with: {
        animal: {
          with: {
            breed: true,
          },
        },
      },
    });

    if (!task) {
      return notFoundResponse('Task not found');
    }

    return successResponse(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return serverErrorResponse('Failed to fetch task');
  }
}

// ============================================================================
// PATCH /api/tasks/[id] - Update task
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    // Verify task exists and belongs to user
    const existing = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, id), eq(tasks.userId, session.user.id)),
    });

    if (!existing) {
      return notFoundResponse('Task not found');
    }

    const body = await request.json();

    // Validate request body
    const validation = updateTaskSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    const validatedData = validation.data;

    // Update task
    const updated = await db
      .update(tasks)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
      .returning();

    return successResponse(updated[0], 'Task updated successfully');
  } catch (error) {
    console.error('Error updating task:', error);
    return serverErrorResponse('Failed to update task');
  }
}

// ============================================================================
// DELETE /api/tasks/[id] - Delete task
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    // Verify task exists and belongs to user
    const existing = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, id), eq(tasks.userId, session.user.id)),
    });

    if (!existing) {
      return notFoundResponse('Task not found');
    }

    // Delete task
    await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)));

    return successResponse(null, 'Task deleted successfully');
  } catch (error) {
    console.error('Error deleting task:', error);
    return serverErrorResponse('Failed to delete task');
  }
}
