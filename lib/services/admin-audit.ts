import { db } from '@/lib/db';
import { adminAuditLogs } from '@/lib/db/schema/admin-audit-logs';

interface AuditLogParams {
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  targetUserId?: string;
  targetUserName?: string;
  targetUserEmail?: string;
  description: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an admin audit log entry
 */
export async function createAdminAuditLog(params: AuditLogParams) {
  try {
    await db.insert(adminAuditLogs).values({
      adminId: params.adminId,
      adminName: params.adminName,
      adminEmail: params.adminEmail,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      targetUserId: params.targetUserId,
      targetUserName: params.targetUserName,
      targetUserEmail: params.targetUserEmail,
      description: params.description,
      changes: params.changes,
      metadata: params.metadata || {},
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Get audit logs for a specific resource
 */
export async function getAuditLogsForResource(resource: string, resourceId: string) {
  return await db
    .select()
    .from(adminAuditLogs)
    .where((logs) => logs.resource === resource && logs.resourceId === resourceId)
    .orderBy((logs) => logs.createdAt);
}

/**
 * Get audit logs for a specific admin
 */
export async function getAuditLogsForAdmin(adminId: string, limit = 100) {
  return await db
    .select()
    .from(adminAuditLogs)
    .where((logs) => logs.adminId === adminId)
    .orderBy((logs) => logs.createdAt)
    .limit(limit);
}

/**
 * Get recent audit logs
 */
export async function getRecentAuditLogs(limit = 50) {
  return await db
    .select()
    .from(adminAuditLogs)
    .orderBy((logs) => logs.createdAt)
    .limit(limit);
}
