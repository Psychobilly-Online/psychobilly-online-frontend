/**
 * Authorization hook
 *
 * Provides convenient access to user role and authorization checks.
 * Built on top of AuthContext with role abstraction layer.
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  isAdmin,
  isModerator,
  isAuthenticatedUser,
  hasRole,
  getUserRole,
  type UserRole,
  type User,
} from '@/lib/auth/roles';

interface UseAuthorizationReturn {
  /**
   * Current user object (null if not authenticated)
   */
  user: User | null;

  /**
   * JWT token (null if not authenticated)
   */
  token: string | null;

  /**
   * Current user's role ('guest' if not authenticated)
   */
  role: UserRole;

  /**
   * Whether user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Whether auth state is still loading
   */
  isLoading: boolean;

  /**
   * Whether user is an administrator
   */
  isAdmin: boolean;

  /**
   * Whether user is a moderator (includes admins)
   */
  isModerator: boolean;

  /**
   * Whether user is an authenticated user (not guest)
   */
  isAuthenticatedUser: boolean;

  /**
   * Check if user has a specific role or higher
   * @param requiredRole - Minimum required role
   * @returns true if user meets or exceeds required role
   */
  hasRole: (requiredRole: UserRole) => boolean;

  /**
   * Login function
   */
  login: (username: string, password: string) => Promise<void>;

  /**
   * Logout function
   */
  logout: () => void;
}

/**
 * Hook for accessing authentication and authorization state
 *
 * @returns Authorization state and helper functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isAdmin, user, role } = useAuthorization();
 *
 *   if (isAdmin) {
 *     return <AdminPanel />;
 *   }
 *
 *   return <p>Hello {user?.username}, you are a {role}</p>;
 * }
 * ```
 */
export function useAuthorization(): UseAuthorizationReturn {
  const { user, token, role, isAuthenticated, isLoading, login, logout } = useAuth();

  // Memoize authorization checks to avoid unnecessary recalculations
  const authChecks = useMemo(
    () => ({
      isAdmin: isAdmin(user),
      isModerator: isModerator(user),
      isAuthenticatedUser: isAuthenticatedUser(user),
      hasRole: (requiredRole: UserRole) => hasRole(user, requiredRole),
    }),
    [user],
  );

  return {
    user,
    token,
    role,
    isAuthenticated,
    isLoading,
    ...authChecks,
    login,
    logout,
  };
}
