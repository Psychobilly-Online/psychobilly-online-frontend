'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BandManagement from '@/components/admin/BandManagement';
import Link from 'next/link';
import styles from './MergeBands.module.css';

export default function MergeBandsPage() {
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
      <div className={styles.breadcrumb}>
        <Link href="/admin/bands">Band Administration</Link>
        <span> / </span>
        <span>Merge Bands</span>
      </div>

      <div className={styles.header}>
        <h1>Merge Bands</h1>
        <p className={styles.subtitle}>Search for duplicate band entries and merge them together</p>
      </div>
      
      <BandManagement />
    </div>
  );
}
