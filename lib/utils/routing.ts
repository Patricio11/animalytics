/**
 * Routing utilities for role-based navigation
 * Future-proof for all user roles in the system
 */

export type UserRole = 'buyer' | 'breeder' | 'vet' | 'event_organizer' | 'admin';

/**
 * Get the messages route path for a specific user role
 * @param role - User role
 * @returns Base path for messages (e.g., '/messages', '/buyer/messages')
 */
export function getMessagesPath(role: UserRole): string {
  switch (role) {
    case 'buyer':
      return '/buyer/messages';
    case 'breeder':
      return '/messages';
    case 'vet':
      return '/vet/messages';
    case 'event_organizer':
      return '/events/messages';
    case 'admin':
      return '/messages'; // Admin uses breeder interface
    default:
      return '/messages'; // Fallback to breeder interface
  }
}

/**
 * Get the full conversation URL for a specific user role
 * @param role - User role
 * @param conversationId - Conversation ID
 * @returns Full path to conversation (e.g., '/messages/123', '/buyer/messages/123')
 */
export function getConversationUrl(role: UserRole, conversationId: string): string {
  const basePath = getMessagesPath(role);
  return `${basePath}/${conversationId}`;
}

/**
 * Get the dashboard route path for a specific user role
 * @param role - User role
 * @returns Dashboard path (e.g., '/dashboard', '/buyer/dashboard')
 */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'buyer':
      return '/buyer/dashboard';
    case 'breeder':
      return '/dashboard';
    case 'vet':
      return '/vet/dashboard';
    case 'event_organizer':
      return '/events/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/dashboard';
  }
}

/**
 * Get the profile route path for a specific user role
 * @param role - User role
 * @returns Profile path (e.g., '/profile', '/buyer/profile')
 */
export function getProfilePath(role: UserRole): string {
  switch (role) {
    case 'buyer':
      return '/buyer/profile';
    case 'breeder':
      return '/profile';
    case 'vet':
      return '/vet/profile';
    case 'event_organizer':
      return '/events/profile';
    case 'admin':
      return '/admin/profile';
    default:
      return '/profile';
  }
}

/**
 * Check if a user role has access to a specific feature
 * @param role - User role
 * @param feature - Feature name
 * @returns Whether the role has access
 */
export function hasFeatureAccess(
  role: UserRole,
  feature: 'messaging' | 'marketplace' | 'breeding' | 'events' | 'admin'
): boolean {
  const accessMap: Record<UserRole, string[]> = {
    buyer: ['messaging', 'marketplace'],
    breeder: ['messaging', 'marketplace', 'breeding'],
    vet: ['messaging', 'marketplace'],
    event_organizer: ['messaging', 'events'],
    admin: ['messaging', 'marketplace', 'breeding', 'events', 'admin'],
  };

  return accessMap[role]?.includes(feature) ?? false;
}
