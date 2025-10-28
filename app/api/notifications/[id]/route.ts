import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
  archived: z.boolean().optional(),
});

// ============================================================================
// GET /api/notifications/[id] - Get single notification
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const notificationId = params.id;

    const [notification] = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, session.user.id)
        )
      )
      .limit(1);

    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    return successResponse(notification);

  } catch (error) {
    console.error('Error fetching notification:', error);
    return errorResponse('Failed to fetch notification', 500);
  }
}

// ============================================================================
// PATCH /api/notifications/[id] - Update notification
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const notificationId = params.id;
    const body = await request.json();
    const validation = updateNotificationSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const { read, archived } = validation.data;

    // Build update object
    const updateData: any = {};

    if (read !== undefined) {
      updateData.read = read;
      updateData.readAt = read ? new Date() : null;
    }

    if (archived !== undefined) {
      updateData.archived = archived;
      updateData.archivedAt = archived ? new Date() : null;
    }

    // Update notification
    const [updatedNotification] = await db
      .update(notifications)
      .set(updateData)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, session.user.id)
        )
      )
      .returning();

    if (!updatedNotification) {
      return errorResponse('Notification not found', 404);
    }

    return successResponse(updatedNotification, 'Notification updated successfully');

  } catch (error) {
    console.error('Error updating notification:', error);
    return errorResponse('Failed to update notification', 500);
  }
}

// ============================================================================
// DELETE /api/notifications/[id] - Delete notification
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const notificationId = params.id;

    const [deletedNotification] = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, session.user.id)
        )
      )
      .returning();

    if (!deletedNotification) {
      return errorResponse('Notification not found', 404);
    }

    return successResponse(null, 'Notification deleted successfully');

  } catch (error) {
    console.error('Error deleting notification:', error);
    return errorResponse('Failed to delete notification', 500);
  }
}
