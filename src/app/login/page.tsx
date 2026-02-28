'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';
import PageHeader from '@/components/common/PageHeader';
import Section from '@/components/common/Section';
import ActionButton from '@/components/common/ActionButton';
import InfoBar from '@/components/common/InfoBar';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuthorization();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get redirect URL and logout message from query params
  const redirectUrl = searchParams.get('redirect');
  const logoutMessage = searchParams.get('logout');

  // Redirect authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // If user is already logged in, redirect them
      const destination = redirectUrl || '/dashboard';
      router.push(destination);
    }
  }, [isAuthenticated, isLoading, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(username, password);

      // After successful login, redirect to intended page or dashboard
      const destination = redirectUrl || '/dashboard';
      router.push(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  // Don't show form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Sign In"
        description="Welcome to Psychobilly Online. Sign in to access your account and manage content."
      />

      {logoutMessage && (
        <InfoBar variant="default">
          <InfoBar.Status type="info" message="You have been successfully logged out." />
        </InfoBar>
      )}

      {redirectUrl && (
        <InfoBar variant="default">
          <InfoBar.Status type="warning" message="You need to sign in to access this page." />
        </InfoBar>
      )}

      {error && (
        <InfoBar variant="default">
          <InfoBar.Status type="error" message={error} />
        </InfoBar>
      )}

      <div className={styles.content}>
        <Section title="Login">
          <form onSubmit={handleSubmit} className={styles.form}>
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
                disabled={isSubmitting}
                autoFocus
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
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.actions}>
              <a
                href="https://www.psychobilly-online.de/community/app.php/user/forgot_password"
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Forgot your password?
              </a>

              <ActionButton type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </ActionButton>
            </div>
          </form>

          <div className={styles.register}>
            <p className={styles.registerText}>New user registrations are currently disabled.</p>
          </div>
        </Section>
      </div>
    </div>
  );
}
