import { Metadata } from 'next';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';
import VenueOverview from '@/components/admin/VenueOverview';
import styles from './VenueOverview.module.css';

export const metadata: Metadata = {
  title: 'Venue Overview - Admin',
  description: 'Search and manage all venues',
};

export default function VenueOverviewPage() {
  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Admin Dashboard', href: '/admin' },
          { label: 'Venue Overview' },
        ]}
      />

      <PageHeader
        title="Venue Overview"
        description="Search, filter, and manage all venues. Use semicolons to search multiple terms (e.g., 'SO36; Wild at Heart; Cassiopeia')"
      />

      <VenueOverview />
    </div>
  );
}
