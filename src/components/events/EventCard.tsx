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

  const eventDate = parseDate(event.date);

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
    console.warn(`Invalid date for event ${event.id}:`, event.date);
    return null;
  }

  return (
    <div className={styles.eventCard}>
      <div className={styles.cardContent}>
        {/* Date Badge */}
        <div className={styles.dateBadge}>
          <div className={styles.dateDay}>{getDay(eventDate)}</div>
          <div className={styles.dateMonth}>{getMonth(eventDate)}</div>
        </div>

        {/* Event Details */}
        <div className={styles.details}>
          <h3 className={styles.headline}>{event.headline}</h3>
          
          <div className={styles.meta}>
            {event.venue_name && (
              <div className={styles.metaItem}>
                📍 {event.venue_name}
              </div>
            )}
            
            {event.city && (
              <div className={styles.metaItem}>
                {event.city}
                {event.country && `, ${event.country}`}
              </div>
            )}
            
            {event.time && (
              <div className={styles.metaItem}>
                🕒 {event.time}
              </div>
            )}
          </div>

          {event.description && (
            <p className={styles.description}>
              {event.description.length > 150
                ? `${event.description.substring(0, 150)}...`
                : event.description}
            </p>
          )}

          {/* Links */}
          {(event.ticket_link || event.event_link) && (
            <div className={styles.links}>
              {event.ticket_link && (
                <a
                  href={event.ticket_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.link} ${styles.linkTickets}`}
                >
                  🎫 Tickets
                </a>
              )}
              {event.event_link && (
                <a
                  href={event.event_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  ℹ️ Info
                </a>
              )}
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
