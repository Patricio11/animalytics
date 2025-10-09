'use client';

import { useRole } from '@/lib/auth/client';
import { PERMISSIONS, ROLE_PERMISSIONS, type Permission } from './definitions';

/**
 * Client-side permission checking hook
 * Uses the user's role to determine permissions
 */
export function usePermissions() {
  const { role } = useRole();

  /**
   * Check if the current user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    const rolePerms = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
    return rolePerms.includes(permission);
  };

  /**
   * Check if user can create a resource
   */
  const canCreate = (resource: string): boolean => {
    return hasPermission(`${resource}:create` as Permission);
  };

  /**
   * Check if user can read a resource
   */
  const canRead = (resource: string): boolean => {
    return hasPermission(`${resource}:read` as Permission);
  };

  /**
   * Check if user can update a resource
   */
  const canUpdate = (resource: string): boolean => {
    return hasPermission(`${resource}:update` as Permission);
  };

  /**
   * Check if user can delete a resource
   */
  const canDelete = (resource: string): boolean => {
    return hasPermission(`${resource}:delete` as Permission);
  };

  /**
   * Check if user has any of the given permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * Check if user has all of the given permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  /**
   * Get all permissions for the current user's role
   */
  const getUserPermissions = (): readonly Permission[] => {
    return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
  };

  return {
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    permissions: PERMISSIONS,
  };
}

/**
 * Hook for specific resource permissions
 * Provides convenient boolean flags for a resource
 */
export function useResourcePermissions(resource: string) {
  const { canCreate, canRead, canUpdate, canDelete } = usePermissions();

  return {
    canCreate: canCreate(resource),
    canRead: canRead(resource),
    canUpdate: canUpdate(resource),
    canDelete: canDelete(resource),
  };
}
