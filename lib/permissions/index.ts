/**
 * Permission System
 *
 * This module provides a comprehensive permission system for role-based access control.
 *
 * Usage:
 *
 * Client-side (components):
 * ```typescript
 * import { usePermissions, PERMISSIONS } from '@/lib/permissions';
 *
 * function MyComponent() {
 *   const { hasPermission, canCreate } = usePermissions();
 *
 *   if (hasPermission(PERMISSIONS.ANIMALS_CREATE)) {
 *     return <CreateButton />;
 *   }
 *
 *   if (canCreate('animals')) {
 *     return <AddAnimalButton />;
 *   }
 * }
 * ```
 *
 * Server-side (server components, API routes):
 * ```typescript
 * import { requirePermission, hasPermission, PERMISSIONS } from '@/lib/permissions/server';
 *
 * export default async function ProtectedPage() {
 *   await requirePermission(PERMISSIONS.ANIMALS_CREATE);
 *   return <div>Protected content</div>;
 * }
 *
 * // In API routes
 * export async function POST(request: Request) {
 *   const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_CREATE);
 *   if (!allowed) {
 *     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 *   }
 * }
 * ```
 */

// Export definitions
export { PERMISSIONS, ROLE_PERMISSIONS, type Permission } from './definitions';
export { getPermissionsForRole, roleHasPermission } from './definitions';

// Export client hooks
export { usePermissions, useResourcePermissions } from './hooks';
