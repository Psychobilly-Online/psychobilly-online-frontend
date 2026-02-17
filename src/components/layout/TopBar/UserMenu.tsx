'use client';

import { useEffect, useRef, useState } from 'react';
import { IconButton } from '@/components/common/IconButton';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { getAvatarUrl } from '@/lib/user-utils';
import styles from './UserMenu.module.css';

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleAccountClick = () => {
    if (isAuthenticated) {
      setShowUserMenu(!showUserMenu);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <>
      <div className={styles.userMenuContainer} ref={userMenuRef}>
        <IconButton
          size="small"
          ariaLabel={isAuthenticated ? `Account: ${user?.username}` : 'Login'}
          title={isAuthenticated ? user?.username : 'Login'}
          onClick={handleAccountClick}
          className={user?.avatar ? styles.hasAvatar : ''}
          icon={
            user?.avatar ? (
              <img
                src={getAvatarUrl(user.avatar) || ''}
                alt={user.username}
                className={styles.avatar}
              />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )
          }
        />

        {isAuthenticated && showUserMenu && (
          <div className={styles.userMenu}>
            <div className={styles.userMenuHeader}>
              <div className={styles.username}>{user?.username}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
            <div className={styles.userMenuDivider} />
            <button className={styles.userMenuItem} onClick={() => setShowUserMenu(false)}>
              Profile
            </button>
            <button className={styles.userMenuItem} onClick={() => setShowUserMenu(false)}>
              Dashboard
            </button>
            <div className={styles.userMenuDivider} />
            <button className={styles.userMenuItem} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
