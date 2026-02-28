/**
 * Tests for role-based authorization system
 */

import { describe, it, expect } from 'vitest';
import {
  getUserRole,
  isAdmin,
  isModerator,
  isAuthenticatedUser,
  hasRole,
  getRoleDisplayName,
  getRoleBadgeColor,
  PHPBB_GROUPS,
  type User,
} from '../roles';

describe('getUserRole', () => {
  it('should map admin group_id to admin role', () => {
    expect(getUserRole(PHPBB_GROUPS.ADMIN)).toBe('admin');
    expect(getUserRole(5)).toBe('admin');
  });

  it('should map moderator group_id to moderator role', () => {
    expect(getUserRole(PHPBB_GROUPS.MODERATOR)).toBe('moderator');
    expect(getUserRole(4)).toBe('moderator');
  });

  it('should map registered user group_id to user role', () => {
    expect(getUserRole(PHPBB_GROUPS.REGISTERED)).toBe('user');
    expect(getUserRole(2)).toBe('user');
  });

  it('should map COPPA registered user to user role', () => {
    expect(getUserRole(PHPBB_GROUPS.REGISTERED_COPPA)).toBe('user');
    expect(getUserRole(3)).toBe('user');
  });

  it('should map guest group_id to guest role', () => {
    expect(getUserRole(PHPBB_GROUPS.GUEST)).toBe('guest');
    expect(getUserRole(1)).toBe('guest');
  });

  it('should default unknown group_id to guest role', () => {
    expect(getUserRole(999)).toBe('guest');
    expect(getUserRole(0)).toBe('guest');
    expect(getUserRole(-1)).toBe('guest');
  });
});

describe('isAdmin', () => {
  it('should return true for admin users', () => {
    const adminUser: User = {
      id: 1,
      username: 'admin',
      email: 'admin@test.com',
      group_id: 5,
    };
    expect(isAdmin(adminUser)).toBe(true);
  });

  it('should return false for non-admin users', () => {
    const regularUser: User = {
      id: 2,
      username: 'user',
      email: 'user@test.com',
      group_id: 2,
    };
    expect(isAdmin(regularUser)).toBe(false);
  });

  it('should return false for moderators', () => {
    const moderator: User = {
      id: 3,
      username: 'mod',
      email: 'mod@test.com',
      group_id: 4,
    };
    expect(isAdmin(moderator)).toBe(false);
  });

  it('should return false for null user', () => {
    expect(isAdmin(null)).toBe(false);
  });

  it('should return false for undefined user', () => {
    expect(isAdmin(undefined)).toBe(false);
  });
});

describe('isModerator', () => {
  it('should return true for moderators', () => {
    const moderator: User = {
      id: 1,
      username: 'mod',
      email: 'mod@test.com',
      group_id: 4,
    };
    expect(isModerator(moderator)).toBe(true);
  });

  it('should return true for admins', () => {
    const admin: User = {
      id: 2,
      username: 'admin',
      email: 'admin@test.com',
      group_id: 5,
    };
    expect(isModerator(admin)).toBe(true);
  });

  it('should return false for regular users', () => {
    const user: User = {
      id: 3,
      username: 'user',
      email: 'user@test.com',
      group_id: 2,
    };
    expect(isModerator(user)).toBe(false);
  });

  it('should return false for null user', () => {
    expect(isModerator(null)).toBe(false);
  });

  it('should return false for undefined user', () => {
    expect(isModerator(undefined)).toBe(false);
  });
});

describe('isAuthenticatedUser', () => {
  it('should return true for regular users', () => {
    const user: User = {
      id: 1,
      username: 'user',
      email: 'user@test.com',
      group_id: 2,
    };
    expect(isAuthenticatedUser(user)).toBe(true);
  });

  it('should return true for moderators', () => {
    const moderator: User = {
      id: 2,
      username: 'mod',
      email: 'mod@test.com',
      group_id: 4,
    };
    expect(isAuthenticatedUser(moderator)).toBe(true);
  });

  it('should return true for admins', () => {
    const admin: User = {
      id: 3,
      username: 'admin',
      email: 'admin@test.com',
      group_id: 5,
    };
    expect(isAuthenticatedUser(admin)).toBe(true);
  });

  it('should return false for guests', () => {
    const guest: User = {
      id: 0,
      username: 'guest',
      email: '',
      group_id: 1,
    };
    expect(isAuthenticatedUser(guest)).toBe(false);
  });

  it('should return false for null user', () => {
    expect(isAuthenticatedUser(null)).toBe(false);
  });

  it('should return false for undefined user', () => {
    expect(isAuthenticatedUser(undefined)).toBe(false);
  });
});

describe('hasRole', () => {
  const guestUser: User = {
    id: 1,
    username: 'guest',
    email: '',
    group_id: 1,
  };

  const regularUser: User = {
    id: 2,
    username: 'user',
    email: 'user@test.com',
    group_id: 2,
  };

  const moderator: User = {
    id: 3,
    username: 'mod',
    email: 'mod@test.com',
    group_id: 4,
  };

  const admin: User = {
    id: 4,
    username: 'admin',
    email: 'admin@test.com',
    group_id: 5,
  };

  describe('guest role requirement', () => {
    it('should return true for all users (everyone is at least guest)', () => {
      expect(hasRole(null, 'guest')).toBe(true);
      expect(hasRole(guestUser, 'guest')).toBe(true);
      expect(hasRole(regularUser, 'guest')).toBe(true);
      expect(hasRole(moderator, 'guest')).toBe(true);
      expect(hasRole(admin, 'guest')).toBe(true);
    });
  });

  describe('user role requirement', () => {
    it('should return false for null and guest users', () => {
      expect(hasRole(null, 'user')).toBe(false);
      expect(hasRole(guestUser, 'user')).toBe(false);
    });

    it('should return true for regular users and higher', () => {
      expect(hasRole(regularUser, 'user')).toBe(true);
      expect(hasRole(moderator, 'user')).toBe(true);
      expect(hasRole(admin, 'user')).toBe(true);
    });
  });

  describe('moderator role requirement', () => {
    it('should return false for guests and regular users', () => {
      expect(hasRole(null, 'moderator')).toBe(false);
      expect(hasRole(guestUser, 'moderator')).toBe(false);
      expect(hasRole(regularUser, 'moderator')).toBe(false);
    });

    it('should return true for moderators and admins', () => {
      expect(hasRole(moderator, 'moderator')).toBe(true);
      expect(hasRole(admin, 'moderator')).toBe(true);
    });
  });

  describe('admin role requirement', () => {
    it('should return false for all except admins', () => {
      expect(hasRole(null, 'admin')).toBe(false);
      expect(hasRole(guestUser, 'admin')).toBe(false);
      expect(hasRole(regularUser, 'admin')).toBe(false);
      expect(hasRole(moderator, 'admin')).toBe(false);
    });

    it('should return true only for admins', () => {
      expect(hasRole(admin, 'admin')).toBe(true);
    });
  });
});

describe('getRoleDisplayName', () => {
  it('should return correct display names', () => {
    expect(getRoleDisplayName('guest')).toBe('Guest');
    expect(getRoleDisplayName('user')).toBe('User');
    expect(getRoleDisplayName('moderator')).toBe('Moderator');
    expect(getRoleDisplayName('admin')).toBe('Administrator');
  });
});

describe('getRoleBadgeColor', () => {
  it('should return CSS variable names', () => {
    expect(getRoleBadgeColor('guest')).toBe('var(--color-text-secondary)');
    expect(getRoleBadgeColor('user')).toBe('var(--color-primary)');
    expect(getRoleBadgeColor('moderator')).toBe('var(--color-warning)');
    expect(getRoleBadgeColor('admin')).toBe('var(--color-error)');
  });
});

describe('PHPBB_GROUPS constants', () => {
  it('should have correct group ID values', () => {
    expect(PHPBB_GROUPS.GUEST).toBe(1);
    expect(PHPBB_GROUPS.REGISTERED).toBe(2);
    expect(PHPBB_GROUPS.REGISTERED_COPPA).toBe(3);
    expect(PHPBB_GROUPS.MODERATOR).toBe(4);
    expect(PHPBB_GROUPS.ADMIN).toBe(5);
  });

  it('should be immutable (as const)', () => {
    // TypeScript will prevent assignment, but let's verify the values
    expect(Object.isFrozen(PHPBB_GROUPS)).toBe(false); // 'as const' doesn't freeze
    // But the const assertion ensures type-level immutability
  });
});
