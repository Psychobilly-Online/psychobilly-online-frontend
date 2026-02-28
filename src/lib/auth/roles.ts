/**
 * Role-based authorization system
 *
 * Abstracts phpBB group_id values into a maintainable role system.
 * This provides type safety, clear semantics, and a single source of truth
 * for authorization logic throughout the application.
 */

/**
 * User roles in the system
 * Mapped from phpBB group IDs
 */
export type UserRole = 'guest' | 'user' | 'moderator' | 'admin';

/**
 * User object interface (matches AuthContext)
 */
export interface User {
  id: number;
  username: string;
  email: string;
  group_id: number;
  avatar?: string;
  role?: UserRole; // Computed from group_id
}

/**
 * phpBB Group ID constants
 * These values come from the phpBB forum database
 */
export const PHPBB_GROUPS = {
  GUEST: 1,
  REGISTERED: 2,
  REGISTERED_COPPA: 3, // Children's Online Privacy Protection Act
  MODERATOR: 4,
  ADMIN: 5,
} as const;

/**
 * Maps phpBB group_id to application role
 *
 * @param group_id - phpBB group ID from user object
 * @returns UserRole - Semantic role for the application
 *
 * @example
 * getUserRole(5) // returns 'admin'
 * getUserRole(2) // returns 'user'
 */
export function getUserRole(group_id: number): UserRole {
  switch (group_id) {
    case PHPBB_GROUPS.ADMIN:
      return 'admin';
    case PHPBB_GROUPS.MODERATOR:
      return 'moderator';
    case PHPBB_GROUPS.REGISTERED:
    case PHPBB_GROUPS.REGISTERED_COPPA:
      return 'user';
    case PHPBB_GROUPS.GUEST:
    default:
      return 'guest';
  }
}

/**
 * Check if user is an administrator
 *
 * @param user - User object or null
 * @returns true if user is admin, false otherwise
 *
 * @example
 * if (isAdmin(user)) {
 *   // Show admin features
 * }
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.group_id === PHPBB_GROUPS.ADMIN;
}

/**
 * Check if user is a moderator (includes admins)
 *
 * @param user - User object or null
 * @returns true if user is moderator or admin, false otherwise
 *
 * @example
 * if (isModerator(user)) {
 *   // Show moderation features
 * }
 */
export function isModerator(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.group_id === PHPBB_GROUPS.MODERATOR || user.group_id === PHPBB_GROUPS.ADMIN;
}

/**
 * Check if user is authenticated (registered user, moderator, or admin)
 *
 * @param user - User object or null
 * @returns true if user is authenticated, false otherwise
 *
 * @example
 * if (isAuthenticatedUser(user)) {
 *   // Show logged-in user features
 * }
 */
export function isAuthenticatedUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.group_id !== PHPBB_GROUPS.GUEST;
}

/**
 * Check if user has a specific role or higher
 *
 * Role hierarchy (lowest to highest):
 * guest < user < moderator < admin
 *
 * @param user - User object or null
 * @param requiredRole - Minimum required role
 * @returns true if user meets or exceeds required role
 *
 * @example
 * if (hasRole(user, 'moderator')) {
 *   // User is moderator or admin
 * }
 */
export function hasRole(user: User | null | undefined, requiredRole: UserRole): boolean {
  if (!user) return requiredRole === 'guest';

  const userRole = getUserRole(user.group_id);

  // Role hierarchy check
  const roleHierarchy: Record<UserRole, number> = {
    guest: 0,
    user: 1,
    moderator: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Get a human-readable role name for display
 *
 * @param role - UserRole
 * @returns Display name for the role
 *
 * @example
 * getRoleDisplayName('admin') // returns 'Administrator'
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    guest: 'Guest',
    user: 'User',
    moderator: 'Moderator',
    admin: 'Administrator',
  };

  return displayNames[role];
}

/**
 * Get role badge color for UI display
 *
 * @param role - UserRole
 * @returns CSS color variable name
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    guest: 'var(--color-text-secondary)',
    user: 'var(--color-primary)',
    moderator: 'var(--color-warning)',
    admin: 'var(--color-error)',
  };

  return colors[role];
}
