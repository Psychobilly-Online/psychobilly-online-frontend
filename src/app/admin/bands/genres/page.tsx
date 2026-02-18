'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GenreAssignment from '@/components/admin/GenreAssignment';
import Link from 'next/link';
import styles from './AssignGenres.module.css';

export default function AssignGenresPage() {
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
        <span>Assign Genres</span>
      </div>

      <div className={styles.header}>
        <h1>Assign Genres to Bands</h1>
        <p className={styles.subtitle}>Select bands and assign genres in bulk</p>
      </div>
      
      <GenreAssignment />
    </div>
  );
}
