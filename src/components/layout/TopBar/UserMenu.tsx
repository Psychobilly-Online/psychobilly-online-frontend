'use client';

import { useState } from 'react';
import { Menu, MenuItem, Divider, Box, Typography } from '@mui/material';
import { IconButton } from '@/components/common/IconButton';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { getAvatarUrl } from '@/lib/user-utils';
import { decodeHtmlEntities } from '@/lib/stringUtils';
import styles from './UserMenu.module.css';

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [avatarError, setAvatarError] = useState(false);
  const open = Boolean(anchorEl);

  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isAuthenticated) {
      setAnchorEl(event.currentTarget);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const showAvatar = user?.avatar && !avatarError;

  return (
    <>
      <IconButton
        size="small"
        ariaLabel={isAuthenticated ? `Account: ${user?.username}` : 'Login'}
        title={isAuthenticated ? user?.username : 'Login'}
        onClick={handleAccountClick}
        className={showAvatar ? styles.hasAvatar : ''}
        aria-haspopup="true"
        aria-expanded={open}
        icon={
          showAvatar ? (
            <img
              src={getAvatarUrl(user.avatar) || ''}
              alt={user.username}
              className={styles.avatar}
              onError={() => setAvatarError(true)}
              loading="lazy"
            />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )
        }
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            className: styles.menuPaper,
          },
        }}
        className={styles.menu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box className={styles.menuHeader}>
          <Typography className={styles.username}>
            {user?.username && decodeHtmlEntities(user.username)}
          </Typography>
          <Typography className={styles.email}>
            {user?.email && decodeHtmlEntities(user.email)}
          </Typography>
        </Box>

        <MenuItem onClick={handleClose} className={styles.menuItem}>
          Profile
        </MenuItem>
        <MenuItem onClick={handleClose} className={styles.menuItem}>
          Dashboard
        </MenuItem>

        <Divider className={styles.divider} />

        <MenuItem onClick={handleLogout} className={styles.menuItem}>
          Logout
        </MenuItem>
      </Menu>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
