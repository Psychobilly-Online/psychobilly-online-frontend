import { describe, it, expect } from 'vitest';
import { getAvatarUrl } from '../user-utils';

describe('user-utils', () => {
  describe('getAvatarUrl', () => {
    it('returns full avatar URL for valid avatar ID', () => {
      const avatarId = '12345';
      const url = getAvatarUrl(avatarId);
      expect(url).toBe(
        'https://www.psychobilly-online.de/community/download/file.php?avatar=12345',
      );
    });

    it('returns full avatar URL for numeric avatar ID', () => {
      const avatarId = '67890';
      const url = getAvatarUrl(avatarId);
      expect(url).toBe(
        'https://www.psychobilly-online.de/community/download/file.php?avatar=67890',
      );
    });

    it('returns full avatar URL for avatar with alphanumeric ID', () => {
      const avatarId = 'abc123def';
      const url = getAvatarUrl(avatarId);
      expect(url).toBe(
        'https://www.psychobilly-online.de/community/download/file.php?avatar=abc123def',
      );
    });

    it('returns null for undefined avatar', () => {
      expect(getAvatarUrl(undefined)).toBeNull();
    });

    it('returns null for empty string avatar', () => {
      expect(getAvatarUrl('')).toBeNull();
    });

    it('handles avatars with special characters', () => {
      const avatarId = 'user_avatar-123.png';
      const url = getAvatarUrl(avatarId);
      expect(url).toBe(
        'https://www.psychobilly-online.de/community/download/file.php?avatar=user_avatar-123.png',
      );
    });

    it('constructs correct URL with query parameter format', () => {
      const avatarId = 'test';
      const url = getAvatarUrl(avatarId);
      expect(url).toContain('?avatar=');
      expect(url).toContain('download/file.php');
    });

    it('uses correct domain', () => {
      const avatarId = 'test';
      const url = getAvatarUrl(avatarId);
      expect(url).toContain('psychobilly-online.de');
    });

    it('uses correct protocol (https)', () => {
      const avatarId = 'test';
      const url = getAvatarUrl(avatarId);
      expect(url).toMatch(/^https:\/\//);
    });

    it('handles single character avatar ID', () => {
      const avatarId = '1';
      const url = getAvatarUrl(avatarId);
      expect(url).toBe('https://www.psychobilly-online.de/community/download/file.php?avatar=1');
    });

    it('handles long avatar ID', () => {
      const avatarId = 'very-long-avatar-id-with-many-characters-12345678901234567890';
      const url = getAvatarUrl(avatarId);
      expect(url).toBe(
        'https://www.psychobilly-online.de/community/download/file.php?avatar=very-long-avatar-id-with-many-characters-12345678901234567890',
      );
    });
  });
});
