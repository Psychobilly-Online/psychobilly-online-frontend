'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { getUserRole, type User, type UserRole } from '@/lib/auth/roles';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

// Token lifetime is 3600 seconds (1 hour)
const TOKEN_LIFETIME_MS = 3600 * 1000;
// Refresh when 15 minutes (25%) remain
const REFRESH_WHEN_REMAINING_MS = 15 * 60 * 1000;
// Activity-based refresh threshold (5 minutes)
const ACTIVITY_REFRESH_THRESHOLD = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Logout function (defined early so it can be used in callbacks)
  const logout = useCallback(async () => {
    // Call logout API to clear httpOnly cookie
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }

    // Clear localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    
    // Clear state
    setToken(null);
    setUser(null);
    setTokenExpiry(null);

    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(
    async (currentToken: string): Promise<boolean> => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: currentToken }),
        });

        if (!response.ok) {
          // Token refresh failed, logout user
          logout();
          return false;
        }

        const data = await response.json();

        if (data.token) {
          const newExpiry = Date.now() + data.expires_in * 1000;

          // Update token and expiry
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(TOKEN_EXPIRY_KEY, newExpiry.toString());
          setToken(data.token);
          setTokenExpiry(newExpiry);

          return true;
        }

        return false;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
      }
    },
    [logout],
  );

  // Check if token needs refresh
  // Use refs to avoid recreating this callback
  const tokenRef = useRef<string | null>(null);
  const tokenExpiryRef = useRef<number | null>(null);

  // Keep refs in sync
  useEffect(() => {
    tokenRef.current = token;
    tokenExpiryRef.current = tokenExpiry;
  }, [token, tokenExpiry]);

  const checkAndRefreshToken = useCallback(async () => {
    const currentToken = tokenRef.current;
    const currentExpiry = tokenExpiryRef.current;

    if (!currentToken || !currentExpiry) return;

    const now = Date.now();
    const timeUntilExpiry = currentExpiry - now;

    // Only refresh if token is still valid and less than 15 minutes remain
    if (timeUntilExpiry > 0 && timeUntilExpiry <= REFRESH_WHEN_REMAINING_MS) {
      await refreshToken(currentToken);
    }
  }, [refreshToken]);

  // Track user activity - stabilized with useCallback
  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();

    const currentToken = tokenRef.current;
    const currentExpiry = tokenExpiryRef.current;

    // Check if we should refresh on activity
    if (currentToken && currentExpiry) {
      const timeUntilExpiry = currentExpiry - Date.now();

      // If token is close to expiring and user is active, refresh it
      if (timeUntilExpiry > 0 && timeUntilExpiry <= ACTIVITY_REFRESH_THRESHOLD) {
        checkAndRefreshToken();
      }
    }
  }, [checkAndRefreshToken]);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (storedToken && storedUser && storedExpiry) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const expiry = parseInt(storedExpiry, 10);

        // Check if token is expired
        if (expiry > Date.now()) {
          setToken(storedToken);
          setUser(parsedUser);
          setTokenExpiry(expiry);
        } else {
          // Token expired, clear storage
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_EXPIRY_KEY);
        }
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  // Set up automatic token refresh timer (stable - only runs when token presence changes)
  useEffect(() => {
    if (!token || !tokenExpiry) {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      return;
    }

    // Clear any existing timer first
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    // Check token refresh every minute
    refreshTimerRef.current = setInterval(() => {
      checkAndRefreshToken();
    }, 60 * 1000);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [token, tokenExpiry, checkAndRefreshToken]);

  // Set up activity listeners (stable - only runs when token presence or handleActivity changes)
  useEffect(() => {
    if (!token) return;

    // Throttle activity tracking to avoid excessive checks
    let activityTimeout: NodeJS.Timeout | null = null;
    const throttledActivity = () => {
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      activityTimeout = setTimeout(() => {
        handleActivity();
        activityTimeout = null;
      }, 1000);
    };

    window.addEventListener('mousemove', throttledActivity);
    window.addEventListener('keydown', throttledActivity);
    window.addEventListener('click', throttledActivity);
    window.addEventListener('scroll', throttledActivity, { passive: true });

    return () => {
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      window.removeEventListener('mousemove', throttledActivity);
      window.removeEventListener('keydown', throttledActivity);
      window.removeEventListener('click', throttledActivity);
      window.removeEventListener('scroll', throttledActivity);
    };
  }, [token, handleActivity]);

  const login = async (username: string, password: string) => {
    // Call BFF login route which sets httpOnly cookie
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Validate required fields
    if (!data.token || !data.user || !data.user.id || !data.user.username || !data.user.email) {
      throw new Error('Invalid response data from server');
    }

    // Calculate token expiry (expires_in is in seconds)
    const expiryTime = Date.now() + data.expires_in * 1000;

    // Add role to user object
    const userWithRole = {
      ...data.user,
      role: getUserRole(data.user.group_id),
    };

    // Store token, user data, and expiry
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(userWithRole));
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

    setToken(data.token);
    setUser(userWithRole);
    setTokenExpiry(expiryTime);
  };

  const value: AuthContextType = {
    user,
    token,
    role: user ? getUserRole(user.group_id) : 'guest',
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
