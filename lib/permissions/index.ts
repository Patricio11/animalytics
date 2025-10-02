import { UserRole, ROLE_PERMISSIONS } from '@/lib/constants/roles';

export type Permission = string;
export type Resource = keyof typeof ROLE_PERMISSIONS[UserRole];

export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource as keyof typeof rolePermissions];
  if (!resourcePermissions) return false;

  return (resourcePermissions as readonly string[]).includes(action);
}

export function getUserPermissions(userRole: UserRole) {
  return ROLE_PERMISSIONS[userRole] || {};
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Define route access based on role
  const routePermissions: Record<string, UserRole[]> = {
    '/(breeder)': ['breeder'],
    '/(admin)': ['admin'],
    '/(vet)': ['vet'],
    '/(event-organizer)': ['event_organizer'],
    '/auth': ['breeder', 'admin', 'vet', 'event_organizer'], // All roles can access auth
  };

  for (const [routePattern, allowedRoles] of Object.entries(routePermissions)) {
    if (route.startsWith(routePattern)) {
      return allowedRoles.includes(userRole);
    }
  }

  return false;
}

export class PermissionChecker {
  constructor(private userRole: UserRole) {}

  can(resource: string, action: string): boolean {
    return hasPermission(this.userRole, resource, action);
  }

  canRead(resource: string): boolean {
    return this.can(resource, 'read');
  }

  canCreate(resource: string): boolean {
    return this.can(resource, 'create');
  }

  canUpdate(resource: string): boolean {
    return this.can(resource, 'update');
  }

  canDelete(resource: string): boolean {
    return this.can(resource, 'delete');
  }

  canManage(resource: string): boolean {
    return this.can(resource, 'manage');
  }
}