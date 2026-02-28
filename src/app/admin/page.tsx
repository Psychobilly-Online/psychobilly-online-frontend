'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';
import Link from 'next/link';
import styles from './AdminDashboard.module.css';

export default function AdminDashboardPage() {
  const { isAdmin, isLoading } = useAuthorization();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className={styles.adminPage}>
      <Breadcrumb items={[{ label: 'Admin Dashboard', href: '/admin' }]} />

      <PageHeader
        title="Psychobilly Online Admin Dashboard"
        description="Manage bands, genres, and perform administrative tasks"
      />

      <div className={styles.overviewGrid}>
        {/* Band Overview Card - Main Entry Point */}
        <Link href="/admin/bands/overview" className={styles.overviewCard}>
          <div className={styles.cardIcon}>🎸</div>
          <h2 className={styles.cardTitle}>Band Overview</h2>
          <p className={styles.cardDescription}>
            Unified interface for all band management tasks. Search, filter, select bands to edit,
            merge, assign genres, view orphaned bands, and more. Your primary workspace for band
            data.
          </p>
          <div className={styles.cardAction}>Go to Band Overview →</div>
        </Link>

        {/* Manage Genres Card */}
        <Link href="/admin/bands/manage-genres" className={styles.overviewCard}>
          <div className={styles.cardIcon}>📚</div>
          <h2 className={styles.cardTitle}>Manage Genres</h2>
          <p className={styles.cardDescription}>
            Create, edit, and organize music genres and subgenres. Define the genre taxonomy used
            throughout the application for band categorization.
          </p>
          <div className={styles.cardAction}>Go to Genre Manager →</div>
        </Link>
      </div>
    </div>
  );
}
