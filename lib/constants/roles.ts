export const USER_ROLES = {
  BREEDER: 'breeder',
  ADMIN: 'admin',
  VET: 'vet',
  EVENT_ORGANIZER: 'event_organizer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_PERMISSIONS = {
  [USER_ROLES.BREEDER]: {
    animals: ['read', 'create', 'update', 'delete'],
    matings: ['read', 'create', 'update'],
    activities: ['read', 'create', 'update', 'delete'],
    marketplace: ['read', 'create', 'update'],
    calculators: ['read', 'use'],
    reports: ['read', 'export'],
    events: ['read', 'register'],
  },
  [USER_ROLES.ADMIN]: {
    users: ['read', 'create', 'update', 'delete', 'manage'],
    animals: ['read', 'update', 'delete'],
    matings: ['read', 'update', 'delete'],
    activities: ['read', 'delete'],
    marketplace: ['read', 'update', 'delete', 'moderate'],
    calculators: ['read', 'use', 'configure'],
    reports: ['read', 'export', 'advanced'],
    events: ['read', 'create', 'update', 'delete', 'manage'],
    system: ['configure', 'monitor', 'backup'],
  },
  [USER_ROLES.VET]: {
    animals: ['read', 'update_health'],
    health_records: ['read', 'create', 'update'],
    appointments: ['read', 'create', 'update', 'delete'],
    vaccinations: ['read', 'create', 'update'],
    reports: ['read', 'export', 'medical'],
    recommendations: ['create', 'update'],
  },
  [USER_ROLES.EVENT_ORGANIZER]: {
    events: ['read', 'create', 'update', 'delete', 'manage'],
    registrations: ['read', 'create', 'update', 'delete'],
    results: ['read', 'create', 'update'],
    participants: ['read', 'manage'],
    awards: ['create', 'update'],
    reports: ['read', 'export', 'event'],
  },
} as const;

export const ROLE_LABELS = {
  [USER_ROLES.BREEDER]: 'Breeder',
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.VET]: 'Veterinarian',
  [USER_ROLES.EVENT_ORGANIZER]: 'Event Organizer',
} as const;

export const ROLE_COLORS = {
  [USER_ROLES.BREEDER]: 'bg-primary-500',
  [USER_ROLES.ADMIN]: 'bg-red-500',
  [USER_ROLES.VET]: 'bg-green-500',
  [USER_ROLES.EVENT_ORGANIZER]: 'bg-purple-500',
} as const;

export const ROLE_ROUTES = {
  [USER_ROLES.BREEDER]: '/(breeder)',
  [USER_ROLES.ADMIN]: '/(admin)',
  [USER_ROLES.VET]: '/(vet)',
  [USER_ROLES.EVENT_ORGANIZER]: '/(event-organizer)',
} as const;