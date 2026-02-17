'use client';

import { IconButton } from '@/components/common/IconButton';
import { useAuth } from '@/contexts/AuthContext';
import { SearchBar } from './TopBar/SearchBar';
import { UserMenu } from './TopBar/UserMenu';
import styles from './TopBar.module.css';

interface TopBarProps {
  /** Current page context for search (e.g., 'events', 'news') */
  searchContext?: 'events' | 'news' | 'default';
  /** Hide the TopBar (for homepage/startpage) */
  hide?: boolean;
}

export function TopBar({ searchContext = 'default', hide = false }: TopBarProps) {
  const { isAuthenticated } = useAuth();

  if (hide) {
    return null;
  }

  return (
    <div className={styles.topBar}>
      <div className={styles.container}>
        {/* Hamburger Menu */}
        <IconButton
          size="small"
          ariaLabel="Open menu"
          title="Open menu"
          onClick={() => {
            /* TODO: Implement menu */
          }}
          icon={
            <div className={styles.hamburgerIcon}>
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
            </div>
          }
        />

        {/* Search Field */}
        <SearchBar searchContext={searchContext} />

        {/* Spacer */}
        <div className={styles.spacer} />

        {/* Right Icons */}
        <div className={styles.rightIcons}>
          {isAuthenticated && (
            <>
              <IconButton
                size="small"
                ariaLabel="Notifications"
                title="Notifications"
                onClick={() => {
                  /* TODO: Implement notifications popout */
                }}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                }
              />

              <IconButton
                size="small"
                ariaLabel="Messages"
                title="Messages"
                onClick={() => {
                  window.open(
                    'https://www.psychobilly-online.de/community/ucp.php?i=pm&folder=inbox',
                    '_blank',
                  );
                }}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
              />
            </>
          )}

          <UserMenu />
        </div>
      </div>
    </div>
  );
}
