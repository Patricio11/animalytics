/**
 * Permission Definitions
 * Defines all permissions in the system using resource:action pattern
 */

export const PERMISSIONS = {
  // Animal Management
  ANIMALS_CREATE: 'animals:create',
  ANIMALS_READ: 'animals:read',
  ANIMALS_UPDATE: 'animals:update',
  ANIMALS_DELETE: 'animals:delete',
  ANIMALS_SHARE: 'animals:share',

  // Mating & Calculations
  MATINGS_CREATE: 'matings:create',
  MATINGS_READ: 'matings:read',
  MATINGS_UPDATE: 'matings:update',
  MATINGS_DELETE: 'matings:delete',

  // Calculators
  CALCULATORS_USE: 'calculators:use',
  CALCULATORS_PROGESTERONE: 'calculators:progesterone',
  CALCULATORS_CONCEPTION: 'calculators:conception',

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  REPORTS_EVENTS: 'reports:events',
  REPORTS_FEEDING: 'reports:feeding',
  REPORTS_EXERCISE: 'reports:exercise',
  REPORTS_GROOMING: 'reports:grooming',
  REPORTS_CLEANING: 'reports:cleaning',
  REPORTS_PUPPIES: 'reports:puppies',
  REPORTS_MATING_HISTORY: 'reports:mating_history',

  // Tasks
  TASKS_CREATE: 'tasks:create',
  TASKS_READ: 'tasks:read',
  TASKS_UPDATE: 'tasks:update',
  TASKS_DELETE: 'tasks:delete',
  TASKS_COMPLETE: 'tasks:complete',

  // Marketplace
  MARKETPLACE_LIST: 'marketplace:list',
  MARKETPLACE_CREATE: 'marketplace:create',
  MARKETPLACE_UPDATE: 'marketplace:update',
  MARKETPLACE_DELETE: 'marketplace:delete',

  // Frozen Semen
  FROZEN_SEMEN_CREATE: 'frozen_semen:create',
  FROZEN_SEMEN_READ: 'frozen_semen:read',
  FROZEN_SEMEN_UPDATE: 'frozen_semen:update',
  FROZEN_SEMEN_DELETE: 'frozen_semen:delete',

  // Documents
  DOCUMENTS_CREATE: 'documents:create',
  DOCUMENTS_READ: 'documents:read',
  DOCUMENTS_DELETE: 'documents:delete',

  // Breeders Network
  BREEDERS_VIEW: 'breeders:view',
  BREEDERS_CONNECT: 'breeders:connect',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',

  // Admin
  USERS_MANAGE: 'users:manage',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_ANALYTICS: 'system:analytics',

  // Veterinarian
  APPOINTMENTS_CREATE: 'appointments:create',
  APPOINTMENTS_READ: 'appointments:read',
  APPOINTMENTS_UPDATE: 'appointments:update',
  APPOINTMENTS_DELETE: 'appointments:delete',
  RECORDS_CREATE: 'records:create',
  RECORDS_READ: 'records:read',
  RECORDS_UPDATE: 'records:update',

  // Event Organizer
  EVENTS_CREATE: 'events:create',
  EVENTS_READ: 'events:read',
  EVENTS_UPDATE: 'events:update',
  EVENTS_DELETE: 'events:delete',
  REGISTRATIONS_MANAGE: 'registrations:manage',
  RESULTS_MANAGE: 'results:manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Role-based permission mappings
 * Each role has a predefined set of permissions
 */
export const ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  breeder: [
    // Full access to breeder features
    PERMISSIONS.ANIMALS_CREATE,
    PERMISSIONS.ANIMALS_READ,
    PERMISSIONS.ANIMALS_UPDATE,
    PERMISSIONS.ANIMALS_DELETE,
    PERMISSIONS.ANIMALS_SHARE,
    PERMISSIONS.MATINGS_CREATE,
    PERMISSIONS.MATINGS_READ,
    PERMISSIONS.MATINGS_UPDATE,
    PERMISSIONS.MATINGS_DELETE,
    PERMISSIONS.CALCULATORS_USE,
    PERMISSIONS.CALCULATORS_PROGESTERONE,
    PERMISSIONS.CALCULATORS_CONCEPTION,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_EVENTS,
    PERMISSIONS.REPORTS_FEEDING,
    PERMISSIONS.REPORTS_EXERCISE,
    PERMISSIONS.REPORTS_GROOMING,
    PERMISSIONS.REPORTS_CLEANING,
    PERMISSIONS.REPORTS_PUPPIES,
    PERMISSIONS.REPORTS_MATING_HISTORY,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.TASKS_COMPLETE,
    PERMISSIONS.MARKETPLACE_LIST,
    PERMISSIONS.MARKETPLACE_CREATE,
    PERMISSIONS.MARKETPLACE_UPDATE,
    PERMISSIONS.MARKETPLACE_DELETE,
    PERMISSIONS.FROZEN_SEMEN_CREATE,
    PERMISSIONS.FROZEN_SEMEN_READ,
    PERMISSIONS.FROZEN_SEMEN_UPDATE,
    PERMISSIONS.FROZEN_SEMEN_DELETE,
    PERMISSIONS.DOCUMENTS_CREATE,
    PERMISSIONS.DOCUMENTS_READ,
    PERMISSIONS.DOCUMENTS_DELETE,
    PERMISSIONS.BREEDERS_VIEW,
    PERMISSIONS.BREEDERS_CONNECT,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
  ] as const,

  veterinarian: [
    // Read-only access to shared animals and records
    PERMISSIONS.ANIMALS_READ,
    PERMISSIONS.MATINGS_READ,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_UPDATE,
    PERMISSIONS.APPOINTMENTS_DELETE,
    PERMISSIONS.RECORDS_CREATE,
    PERMISSIONS.RECORDS_READ,
    PERMISSIONS.RECORDS_UPDATE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
  ] as const,

  admin: [
    // Full system access
    ...Object.values(PERMISSIONS),
  ] as const,

  event_organizer: [
    // Event management and limited animal viewing
    PERMISSIONS.ANIMALS_READ,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.EVENTS_UPDATE,
    PERMISSIONS.EVENTS_DELETE,
    PERMISSIONS.REGISTRATIONS_MANAGE,
    PERMISSIONS.RESULTS_MANAGE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
  ] as const,

  pet_owner: [
    // Pet owners can manage their own animals and use marketplace
    PERMISSIONS.ANIMALS_CREATE,
    PERMISSIONS.ANIMALS_READ,
    PERMISSIONS.ANIMALS_UPDATE,
    PERMISSIONS.ANIMALS_DELETE,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.TASKS_COMPLETE,
    PERMISSIONS.MARKETPLACE_LIST,
    PERMISSIONS.MARKETPLACE_CREATE,
    PERMISSIONS.DOCUMENTS_CREATE,
    PERMISSIONS.DOCUMENTS_READ,
    PERMISSIONS.DOCUMENTS_DELETE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
  ] as const,
} as const;

/**
 * Helper to get permissions for a role
 */
export function getPermissionsForRole(role: string): readonly Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: string, permission: Permission): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}
