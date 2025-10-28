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
import { eq, and, inArray } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const bulkActionSchema = z.object({
  action: z.enum(['mark_read', 'mark_unread', 'archive', 'unarchive', 'delete']),
  notificationIds: z.array(z.string().uuid()).min(1).max(100),
});

// ============================================================================
// POST /api/notifications/bulk - Bulk actions on notifications
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = bulkActionSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const { action, notificationIds } = validation.data;

    let result;

    switch (action) {
      case 'mark_read':
        result = await db
          .update(notifications)
          .set({ read: true, readAt: new Date() })
          .where(
            and(
              eq(notifications.userId, session.user.id),
              inArray(notifications.id, notificationIds)
            )
          )
          .returning();
        break;

      case 'mark_unread':
        result = await db
          .update(notifications)
          .set({ read: false, readAt: null })
          .where(
            and(
              eq(notifications.userId, session.user.id),
              inArray(notifications.id, notificationIds)
            )
          )
          .returning();
        break;

      case 'archive':
        result = await db
          .update(notifications)
          .set({ archived: true, archivedAt: new Date() })
          .where(
            and(
              eq(notifications.userId, session.user.id),
              inArray(notifications.id, notificationIds)
            )
          )
          .returning();
        break;

      case 'unarchive':
        result = await db
          .update(notifications)
          .set({ archived: false, archivedAt: null })
          .where(
            and(
              eq(notifications.userId, session.user.id),
              inArray(notifications.id, notificationIds)
            )
          )
          .returning();
        break;

      case 'delete':
        result = await db
          .delete(notifications)
          .where(
            and(
              eq(notifications.userId, session.user.id),
              inArray(notifications.id, notificationIds)
            )
          )
          .returning();
        break;

      default:
        return errorResponse('Invalid action', 400);
    }

    return successResponse(
      { affected: result.length },
      `Successfully ${action.replace('_', ' ')}ed ${result.length} notification(s)`
    );

  } catch (error) {
    console.error('Error performing bulk action:', error);
    return errorResponse('Failed to perform bulk action', 500);
  }
}
