import { Metadata } from 'next';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';
import BandOverview from '@/components/admin/BandOverview';
import styles from './BandOverview.module.css';

export const metadata: Metadata = {
  title: 'Band Overview - Admin',
  description: 'Search and manage all bands',
};

export default function BandOverviewPage() {
  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: 'Admin Dashboard', href: '/admin' },
          { label: 'Band Overview' },
        ]}
      />

      <PageHeader
        title="Band Overview"
        description="Search, filter, and manage all bands. Use semicolons to search multiple terms (e.g., 'Demented; Meteors; Quakes')"
      />

      <BandOverview />
    </div>
  );
}
