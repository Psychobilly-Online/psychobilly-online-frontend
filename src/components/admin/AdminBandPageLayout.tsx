'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';
import styles from './AdminBandPageLayout.module.css';

interface AdminBandPageLayoutProps {
  /**
   * The page title to display in the PageHeader
   */
  title: string;

  /**
   * Optional description to display in the PageHeader
   */
  description?: string;

  /**
   * The label for this page in the breadcrumb (e.g., "Edit Bands")
   */
  breadcrumbLabel: string;

  /**
   * The main content to render when authenticated
   */
  children: ReactNode;
}

/**
 * Shared layout component for admin band management pages.
 * Handles authentication, permission checks, breadcrumbs, and page headers.
 */
export default function AdminBandPageLayout({
  title,
  description,
  breadcrumbLabel,
  children,
}: AdminBandPageLayoutProps) {
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
    <div className={styles.page}>
      <Breadcrumb
        items={[{ label: 'Admin Dashboard', href: '/admin' }, { label: breadcrumbLabel }]}
      />

      <PageHeader title={title} description={description} />

      {children}
    </div>
  );
}
