'use client';

import { Event } from '@/types';
import { apiClient } from '@/lib/api-client';

interface EventCardProps {
  event: Event;
}

/**
 * Reusable Event Card Component
 * Displays event information in a card layout
 */
export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="event-card">
      <div className="event-card-content">
        {/* Date Badge */}
        <div className="event-date-badge">
          <div className="event-date-day">
            {new Date(event.date).getDate()}
          </div>
          <div className="event-date-month">
            {new Intl.DateTimeFormat('de-DE', { month: 'short' }).format(
              new Date(event.date)
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="event-details">
          <h3 className="event-headline">{event.headline}</h3>
          
          <div className="event-meta">
            {event.venue_name && (
              <div className="event-venue">
                📍 {event.venue_name}
              </div>
            )}
            
            {event.city && (
              <div className="event-location">
                {event.city}
                {event.country && `, ${event.country}`}
              </div>
            )}
            
            {event.time && (
              <div className="event-time">
                🕒 {event.time}
              </div>
            )}
          </div>

          {event.description && (
            <p className="event-description">
              {event.description.length > 150
                ? `${event.description.substring(0, 150)}...`
                : event.description}
            </p>
          )}

          {/* Links */}
          <div className="event-links">
            {event.ticket_link && (
              <a
                href={event.ticket_link}
                target="_blank"
                rel="noopener noreferrer"
                className="event-link event-link-tickets"
              >
                🎫 Tickets
              </a>
            )}
            {event.event_link && (
              <a
                href={event.event_link}
                target="_blank"
                rel="noopener noreferrer"
                className="event-link event-link-info"
              >
                ℹ️ Info
              </a>
            )}
          </div>
        </div>

        {/* Event Image */}
        {event.image && (
          <div className="event-image">
            <img
              src={apiClient.images.getUrl(event.image, 'thumb')}
              alt={event.headline}
              loading="lazy"
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .event-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s ease;
          margin-bottom: 16px;
        }

        .event-card:hover {
          border-color: #666;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .event-card-content {
          display: flex;
          gap: 16px;
          padding: 16px;
        }

        .event-date-badge {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          background: #d32f2f;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }

        .event-date-day {
          font-size: 24px;
          line-height: 1;
        }

        .event-date-month {
          font-size: 12px;
          text-transform: uppercase;
        }

        .event-details {
          flex: 1;
          min-width: 0;
        }

        .event-headline {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #fff;
        }

        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #999;
        }

        .event-venue,
        .event-location,
        .event-time {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .event-description {
          margin: 8px 0;
          font-size: 14px;
          color: #ccc;
          line-height: 1.4;
        }

        .event-links {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .event-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: #333;
          border-radius: 4px;
          font-size: 13px;
          text-decoration: none;
          color: #fff;
          transition: background 0.2s;
        }

        .event-link:hover {
          background: #444;
        }

        .event-link-tickets {
          background: #d32f2f;
        }

        .event-link-tickets:hover {
          background: #b71c1c;
        }

        .event-image {
          flex-shrink: 0;
          width: 120px;
          height: 120px;
          border-radius: 8px;
          overflow: hidden;
        }

        .event-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 768px) {
          .event-card-content {
            flex-direction: column;
          }

          .event-image {
            width: 100%;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}
