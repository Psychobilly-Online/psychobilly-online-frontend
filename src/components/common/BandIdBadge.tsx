import styles from './BandIdBadge.module.css';

interface BandIdBadgeProps {
  id: number;
  showLabel?: boolean;
  className?: string;
}

export default function BandIdBadge({ id, showLabel = true, className }: BandIdBadgeProps) {
  return (
    <span className={`${styles.badge} ${className || ''}`}>
      {showLabel && 'ID: '}
      {id}
    </span>
  );
}
