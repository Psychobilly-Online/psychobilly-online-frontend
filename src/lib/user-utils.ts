/**
 * User utility functions
 */

/**
 * Get the full URL for a user's avatar from phpBB
 * @param avatar - The avatar filename/ID from phpBB
 * @returns Full avatar URL or null if no avatar
 */
export function getAvatarUrl(avatar: string | undefined): string | null {
  if (!avatar) return null;
  return `https://www.psychobilly-online.de/community/download/file.php?avatar=${encodeURIComponent(avatar)}`;
}
