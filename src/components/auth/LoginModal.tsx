'use client';

import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/contexts/AuthContext';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(username, password);
      // Close modal on successful login
      onClose();
      // Clear form
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setUsername('');
    setPassword('');
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: { className: styles.dialogPaper },
      }}
    >
      <DialogTitle className={styles.dialogTitle}>
        Login
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="Close"
          className={styles.closeButton}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          )}

          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="Enter your username or email"
              required
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !username || !password}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <div className={styles.footer}>
            <a
              href="https://www.psychobilly-online.de/community/ucp.php?mode=sendpassword"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Forgot password?
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
