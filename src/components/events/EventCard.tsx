'use client';

import { Event } from '@/types';
import { apiClient } from '@/lib/api-client';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
  categoryName?: string;
}

/**
 * Reusable Event Card Component
 * Displays event information in a card layout
 */
export function EventCard({ event, categoryName }: EventCardProps) {
  // Helper to decode HTML entities
  const decodeHtml = (html: string | null | undefined): string => {
    if (!html) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Helper to ensure link has protocol
  const ensureProtocol = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

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

  const getYear = (date: Date) => date.getFullYear();

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
        <div className={styles.dateYear}>{getYear(eventDate)}</div>
      </div>

      <div className={styles.cardContent}>
        {/* Event Details */}
        <div className={styles.details}>
          <h3 className={styles.headline}>{decodeHtml(event.headline)}</h3>

          <div className={styles.meta}>
            {(categoryName || event.category_id) && (
              <div className={styles.metaItem}>
                🏷️ {categoryName || `Category ${event.category_id}`}
              </div>
            )}

            {event.venue && (event.venue.city || event.venue.name) && (
              <div className={styles.metaItem}>
                📍 {[event.venue.city, event.venue.name].filter(Boolean).join(', ')}
              </div>
            )}

            {event.bands && <div className={styles.metaItem}>🎸 {decodeHtml(event.bands)}</div>}
          </div>

          {event.text && (
            <p className={styles.description}>
              {(() => {
                const decoded = decodeHtml(event.text);
                return decoded.length > 150 ? `${decoded.substring(0, 150)}...` : decoded;
              })()}
            </p>
          )}

          {/* Links */}
          {ensureProtocol(event.link) && (
            <div className={styles.links}>
              <a
                href={ensureProtocol(event.link)!}
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
