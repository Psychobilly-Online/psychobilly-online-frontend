'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import styles from './AdminBands.module.css';

export default function AdminBandsOverviewPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.group_id !== 5)) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || user.group_id !== 5) {
    return null;
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <h1>Band Administration</h1>
        <p className={styles.subtitle}>Manage band data, merges, and genre assignments</p>
      </div>
      
      <div className={styles.overviewGrid}>
        {/* Merge Bands Card */}
        <Link href="/admin/bands/merge" className={styles.overviewCard}>
          <div className={styles.cardIcon}>🔀</div>
          <h2 className={styles.cardTitle}>Merge Bands</h2>
          <p className={styles.cardDescription}>
            Search for duplicate band entries and merge them together. 
            All references will be updated to point to the selected target band.
          </p>
          <div className={styles.cardAction}>
            Go to Merge Tool →
          </div>
        </Link>

        {/* Assign Genres Card */}
        <Link href="/admin/bands/genres" className={styles.overviewCard}>
          <div className={styles.cardIcon}>🏷️</div>
          <h2 className={styles.cardTitle}>Assign Genres</h2>
          <p className={styles.cardDescription}>
            Select multiple bands and assign genres in bulk. 
            Useful for categorizing bands with main and additional genres.
          </p>
          <div className={styles.cardAction}>
            Go to Genre Assignment →
          </div>
        </Link>
      </div>
    </div>
  );
}
