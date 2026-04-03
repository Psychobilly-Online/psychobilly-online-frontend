import styles from './VenueIdBadge.module.css';

interface VenueIdBadgeProps {
  id: number;
  showLabel?: boolean;
  className?: string;
}

export default function VenueIdBadge({ id, showLabel = true, className }: VenueIdBadgeProps) {
  return (
    <span className={`${styles.badge} ${className || ''}`}>
      {showLabel && 'ID: '}
      {id}
    </span>
  );
}
