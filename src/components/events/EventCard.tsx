'use client';

import { Event } from '@/types';
import { apiClient } from '@/lib/api-client';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
}

/**
 * Reusable Event Card Component
 * Displays event information in a card layout
 */
export function EventCard({ event }: EventCardProps) {
  // Validate and parse date
  const parseDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const eventDate = parseDate(event.date_start);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getDay = (date: Date) => date.getDate();
  
  const getMonth = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', { month: 'short' }).format(date);
  };

  // If date is invalid, don't render the card
  if (!eventDate) {
    console.warn(`Invalid date for event ${event.id}:`, event.date_start);
    return null;
  }

  return (
    <div className={styles.eventCard}>
      {/* Date Badge */}
      <div className={styles.dateBadge}>
        <div className={styles.dateDay}>{getDay(eventDate)}</div>
        <div className={styles.dateMonth}>{getMonth(eventDate)}</div>
      </div>
      
      <div className={styles.cardContent}>
        {/* Event Details */}
        <div className={styles.details}>
          <h3 className={styles.headline}>{event.headline}</h3>
          
          <div className={styles.meta}>
            {event.city && (
              <div className={styles.metaItem}>
                📍 {event.city}
              </div>
            )}
            
            {event.bands && (
              <div className={styles.metaItem}>
                🎸 {event.bands}
              </div>
            )}
          </div>

          {event.text && (
            <p className={styles.description}>
              {event.text.length > 150
                ? `${event.text.substring(0, 150)}...`
                : event.text}
            </p>
          )}

          {/* Links */}
          {event.link && (
            <div className={styles.links}>
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                ℹ️ More Info
              </a>
            </div>
          )}
        </div>

        {/* Event Image */}
        {event.image && (
          <div className={styles.image}>
            <img
              src={apiClient.images.getUrl(event.image, 'thumb')}
              alt={event.headline}
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
}
