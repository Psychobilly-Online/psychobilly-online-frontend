'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';
import styles from '../Dashboard.module.css';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuthorization();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/settings');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={styles.dashboardPage}>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/dashboard/settings' },
        ]}
      />

      <PageHeader
        title="Account Settings"
        description="Manage your account preferences and privacy settings"
      />

      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
          🚧 Settings page coming soon!
        </p>
        <p style={{ marginTop: '1rem', color: 'var(--color-text-tertiary)' }}>
          This page will allow you to manage email preferences, notifications, and privacy settings.
        </p>
      </div>
    </div>
  );
}
