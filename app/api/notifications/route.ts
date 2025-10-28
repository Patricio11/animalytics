import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { notifications, notificationPreferences } from '@/lib/db/schema';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  errorResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { eq, and, desc, sql, isNull, or } from 'drizzle-orm';
import { z } from 'zod';
import type { 
  CreateNotificationRequest,
  NotificationFilters,
  NotificationStats 
} from '@/lib/types/notification';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.string(),
  category: z.enum(['breeding', 'health', 'financial', 'marketplace', 'system', 'social']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  actionUrl: z.string().url().optional().or(z.literal('')),
  actionLabel: z.string().max(50).optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().uuid().optional(),
  icon: z.string().optional(),
  iconColor: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  expiresAt: z.string().datetime().optional(),
});

const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
  archived: z.boolean().optional(),
});

// ============================================================================
// GET /api/notifications - Get user notifications
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: NotificationFilters = {
      read: searchParams.get('read') === 'true' ? true : searchParams.get('read') === 'false' ? false : undefined,
      archived: searchParams.get('archived') === 'true' ? true : searchParams.get('archived') === 'false' ? false : undefined,
      category: searchParams.get('category') as any,
      priority: searchParams.get('priority') as any,
      type: searchParams.get('type') as any,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Special query for stats
    if (searchParams.get('stats') === 'true') {
      return getNotificationStats(session.user.id);
    }

    // Build where clause
    const conditions = [eq(notifications.userId, session.user.id)];

    if (filters.read !== undefined) {
      conditions.push(eq(notifications.read, filters.read));
    }

    if (filters.archived !== undefined) {
      conditions.push(eq(notifications.archived, filters.archived));
    } else {
      // By default, don't show archived notifications
      conditions.push(eq(notifications.archived, false));
    }

    if (filters.category) {
      conditions.push(eq(notifications.category, filters.category));
    }

    if (filters.priority) {
      conditions.push(eq(notifications.priority, filters.priority));
    }

    if (filters.type) {
      conditions.push(eq(notifications.type, filters.type));
    }

    // Add expiration filter - don't show expired notifications
    conditions.push(
      or(
        isNull(notifications.expiresAt),
        sql`${notifications.expiresAt} > NOW()`
      )!
    );

    // Query notifications
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(filters.limit!)
      .offset(filters.offset!);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(...conditions));

    return successResponse(userNotifications, undefined, {
      total: Number(count),
      limit: filters.limit,
      offset: filters.offset,
      hasMore: Number(count) > (filters.offset! + filters.limit!),
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}

// ============================================================================
// POST /api/notifications - Create notification (internal use)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    // Only allow admins or system to create notifications
    // For now, we'll allow it but in production you'd check permissions
    
    const body = await request.json();
    const validation = createNotificationSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const data = validation.data;

    // Create notification
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: data.userId,
        type: data.type as any,
        category: data.category,
        priority: data.priority || 'normal',
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl || undefined,
        actionLabel: data.actionLabel || undefined,
        relatedEntityType: data.relatedEntityType || undefined,
        relatedEntityId: data.relatedEntityId || undefined,
        icon: data.icon || undefined,
        iconColor: data.iconColor || undefined,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      })
      .returning();

    return createdResponse(notification, 'Notification created successfully');

  } catch (error) {
    console.error('Error creating notification:', error);
    return errorResponse('Failed to create notification', 500);
  }
}

// ============================================================================
// Helper: Get notification statistics
// ============================================================================

async function getNotificationStats(userId: string) {
  try {
    // Get total and unread counts
    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        unread: sql<number>`count(*) filter (where ${notifications.read} = false)`,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.archived, false),
          or(
            isNull(notifications.expiresAt),
            sql`${notifications.expiresAt} > NOW()`
          )!
        )
      );

    // Get counts by category
    const categoryStats = await db
      .select({
        category: notifications.category,
        count: sql<number>`count(*)`,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.archived, false),
          eq(notifications.read, false),
          or(
            isNull(notifications.expiresAt),
            sql`${notifications.expiresAt} > NOW()`
          )!
        )
      )
      .groupBy(notifications.category);

    // Get counts by priority
    const priorityStats = await db
      .select({
        priority: notifications.priority,
        count: sql<number>`count(*)`,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.archived, false),
          eq(notifications.read, false),
          or(
            isNull(notifications.expiresAt),
            sql`${notifications.expiresAt} > NOW()`
          )!
        )
      )
      .groupBy(notifications.priority);

    const result: NotificationStats = {
      total: Number(stats.total),
      unread: Number(stats.unread),
      byCategory: {
        breeding: 0,
        health: 0,
        financial: 0,
        marketplace: 0,
        system: 0,
        social: 0,
      },
      byPriority: {
        low: 0,
        normal: 0,
        high: 0,
        urgent: 0,
      },
    };

    // Fill in category counts
    categoryStats.forEach(stat => {
      result.byCategory[stat.category] = Number(stat.count);
    });

    // Fill in priority counts
    priorityStats.forEach(stat => {
      result.byPriority[stat.priority] = Number(stat.count);
    });

    return successResponse(result);

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return errorResponse('Failed to fetch notification stats', 500);
  }
}
