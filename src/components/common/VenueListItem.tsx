import { ReactNode } from 'react';
import VenueIdBadge from './VenueIdBadge';
import StatusTag from './StatusTag';
import type { VenueStatus } from '@/types/venue';
import styles from './VenueListItem.module.css';

interface VenueListItemProps {
  id: number;
  venue: string;
  city: string;
  country_name?: string | null;
  status?: VenueStatus;
  event_count?: number;
  mode?: 'clickable' | 'selectable' | 'radio';
  selected?: boolean;
  onClick?: () => void;
  action?: ReactNode;
  showId?: boolean;
  className?: string;
}

export default function VenueListItem({
  id,
  venue,
  city,
  country_name,
  status,
  event_count,
  mode = 'clickable',
  selected = false,
  onClick,
  action,
  showId = true,
  className,
}: VenueListItemProps) {
  const handleClick = () => {
    if (onClick && mode === 'clickable') {
      onClick();
    }
  };

  const Container = mode === 'clickable' ? 'div' : 'label';

  return (
    <Container
      className={`
        ${styles.item} 
        ${mode === 'clickable' ? styles.clickable : ''} 
        ${selected ? styles.selected : ''}
        ${className || ''}
      `}
      onClick={handleClick}
      data-venue-id={id}
    >
      {mode === 'selectable' && (
        <input type="checkbox" checked={selected} onChange={onClick} className={styles.checkbox} />
      )}

      {mode === 'radio' && (
        <input type="radio" checked={selected} onChange={onClick} className={styles.radio} />
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.name}>{venue}</span>
          {showId && <VenueIdBadge id={id} showLabel={true} />}
          {status && <StatusTag status={status} size="small" />}
        </div>

        <div className={styles.metadata}>
          <span className={styles.location}>
            📍 {city}
            {country_name && `, ${country_name}`}
          </span>
          {event_count !== undefined && (
            <span className={styles.eventCount}>
              📅 {event_count} {event_count === 1 ? 'event' : 'events'}
            </span>
          )}
        </div>
      </div>

      {action && <div className={styles.action}>{action}</div>}
    </Container>
  );
}
