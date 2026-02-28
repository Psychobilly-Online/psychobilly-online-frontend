'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';
import Link from 'next/link';
import styles from './Dashboard.module.css';

export default function DashboardPage() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuthorization();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
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
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }]} />

      <PageHeader
        title={`Welcome back, ${user.username}!`}
        description="Your personal hub for managing events, profile, and community activities"
      />

      {/* Quick Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>0</div>
          <div className={styles.statLabel}>Events Created</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>0</div>
          <div className={styles.statLabel}>Comments</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {user.group_id === 5 ? 'Admin' : user.group_id === 4 ? 'Moderator' : 'Member'}
          </div>
          <div className={styles.statLabel}>Account Type</div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className={styles.cardGrid}>
        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <>
            <Link href="/admin" className={styles.card}>
              <div className={styles.cardIcon}>⚙️</div>
              <h2 className={styles.cardTitle}>Admin Dashboard</h2>
              <p className={styles.cardDescription}>
                Manage bands, genres, and perform administrative tasks. Access the full admin
                control panel.
              </p>
              <div className={styles.cardAction}>Go to Admin →</div>
            </Link>

            <Link href="/admin/bands/overview" className={styles.card}>
              <div className={styles.cardIcon}>🎸</div>
              <h2 className={styles.cardTitle}>Band Management</h2>
              <p className={styles.cardDescription}>
                Search, edit, merge bands. Manage genres and band data across the platform.
              </p>
              <div className={styles.cardAction}>Manage Bands →</div>
            </Link>
          </>
        )}

        {/* User Section - Visible to all authenticated users */}
        <Link href="/dashboard/profile" className={styles.card}>
          <div className={styles.cardIcon}>👤</div>
          <h2 className={styles.cardTitle}>My Profile</h2>
          <p className={styles.cardDescription}>
            View and edit your profile information, avatar, and bio. Manage your public presence.
          </p>
          <div className={styles.cardAction}>View Profile →</div>
        </Link>

        <Link href="/dashboard/my-events" className={styles.card}>
          <div className={styles.cardIcon}>📅</div>
          <h2 className={styles.cardTitle}>My Events</h2>
          <p className={styles.cardDescription}>
            View events you&apos;ve created, manage drafts, and track your event contributions.
          </p>
          <div className={styles.cardAction}>View My Events →</div>
        </Link>

        <Link href="/dashboard/settings" className={styles.card}>
          <div className={styles.cardIcon}>🔧</div>
          <h2 className={styles.cardTitle}>Account Settings</h2>
          <p className={styles.cardDescription}>
            Update your email preferences, notification settings, and privacy options.
          </p>
          <div className={styles.cardAction}>Manage Settings →</div>
        </Link>

        <Link href="/events" className={styles.card}>
          <div className={styles.cardIcon}>🎉</div>
          <h2 className={styles.cardTitle}>Browse Events</h2>
          <p className={styles.cardDescription}>
            Discover upcoming psychobilly events worldwide. Filter by country, date, and category.
          </p>
          <div className={styles.cardAction}>Browse Events →</div>
        </Link>
      </div>
    </div>
  );
}
