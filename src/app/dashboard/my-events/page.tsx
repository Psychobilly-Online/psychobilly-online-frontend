'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';
import styles from '../Dashboard.module.css';

export default function MyEventsPage() {
  const { user, isAuthenticated, isLoading } = useAuthorization();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/my-events');
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
          { label: 'Home', href: '/' },
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Events', href: '/dashboard/my-events' },
        ]}
      />

      <PageHeader title="My Events" description="Events you've created and manage" />

      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
          🚧 My Events page coming soon!
        </p>
        <p style={{ marginTop: '1rem', color: 'var(--color-text-tertiary)' }}>
          This page will show events you've created, with options to edit, delete, or manage them.
        </p>
      </div>
    </div>
  );
}
