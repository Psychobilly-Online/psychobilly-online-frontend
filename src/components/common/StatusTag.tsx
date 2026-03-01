import type { VenueStatus } from '@/types/venue';
import styles from './StatusTag.module.css';

interface StatusTagProps {
  status: VenueStatus;
  size?: 'small' | 'medium';
}

const statusLabels: Record<VenueStatus, string> = {
  active: 'Active',
  temporarily_closed: 'Temp. Closed',
  permanently_closed: 'Closed',
};

export default function StatusTag({ status, size = 'medium' }: StatusTagProps) {
  return (
    <span
      className={`${styles.statusTag} ${styles[status]} ${styles[size]}`}
      title={statusLabels[status]}
    >
      {statusLabels[status]}
    </span>
  );
}
