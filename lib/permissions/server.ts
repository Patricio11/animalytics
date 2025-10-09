import { getSession, getUserRole } from '@/lib/auth/server';
import { PERMISSIONS, ROLE_PERMISSIONS, type Permission, roleHasPermission } from './definitions';
import { redirect } from 'next/navigation';

/**
 * Server-side permission checking
 * For use in Server Components and API Routes
 */

/**
 * Check if the current user has a specific permission
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const role = await getUserRole();
  if (!role) return false;

  return roleHasPermission(role, permission);
}

/**
 * Check if user can create a resource
 */
export async function canCreate(resource: string): Promise<boolean> {
  return hasPermission(`${resource}:create` as Permission);
}

/**
 * Check if user can read a resource
 */
export async function canRead(resource: string): Promise<boolean> {
  return hasPermission(`${resource}:read` as Permission);
}

/**
 * Check if user can update a resource
 */
export async function canUpdate(resource: string): Promise<boolean> {
  return hasPermission(`${resource}:update` as Permission);
}

/**
 * Check if user can delete a resource
 */
export async function canDelete(resource: string): Promise<boolean> {
  return hasPermission(`${resource}:delete` as Permission);
}

/**
 * Require a specific permission or redirect to unauthorized
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const hasAccess = await hasPermission(permission);

  if (!hasAccess) {
    redirect('/unauthorized');
  }
}

/**
 * Require any of the given permissions
 */
export async function requireAnyPermission(permissions: Permission[]): Promise<void> {
  for (const permission of permissions) {
    if (await hasPermission(permission)) {
      return;
    }
  }

  redirect('/unauthorized');
}

/**
 * Require all of the given permissions
 */
export async function requireAllPermissions(permissions: Permission[]): Promise<void> {
  for (const permission of permissions) {
    if (!(await hasPermission(permission))) {
      redirect('/unauthorized');
    }
  }
}

/**
 * Get all permissions for the current user
 */
export async function getUserPermissions(): Promise<readonly Permission[]> {
  const role = await getUserRole();
  if (!role) return [];

  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
}

/**
 * API Route permission middleware
 * Returns boolean instead of redirecting
 */
export async function checkPermission(permission: Permission): Promise<{ allowed: boolean; role: string | null }> {
  const role = await getUserRole();

  if (!role) {
    return { allowed: false, role: null };
  }

  const allowed = roleHasPermission(role, permission);

  return { allowed, role };
}

/**
 * Check resource permissions for API routes
 */
export async function checkResourcePermissions(resource: string) {
  const role = await getUserRole();

  if (!role) {
    return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      role: null,
    };
  }

  return {
    canCreate: roleHasPermission(role, `${resource}:create` as Permission),
    canRead: roleHasPermission(role, `${resource}:read` as Permission),
    canUpdate: roleHasPermission(role, `${resource}:update` as Permission),
    canDelete: roleHasPermission(role, `${resource}:delete` as Permission),
    role,
  };
}
