'use client';

import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/events/EventCard';
import { useState } from 'react';

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  const { events, loading, error, pagination } = useEvents({
    page,
    limit,
    approved: true, // Only show approved events
  });

  if (loading && !events.length) {
    return (
      <div className="container">
        <div className="loading">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="events-page">
        <header className="events-header">
          <h1>Upcoming Events</h1>
          <p>Find psychobilly events near you</p>
        </header>

        {events.length === 0 ? (
          <div className="no-events">
            <p>No events found.</p>
          </div>
        ) : (
          <>
            <div className="events-list">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                
                <span className="pagination-info">
                  Page {page} of {pagination.pages} ({pagination.total} events)
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .events-page {
          min-height: 60vh;
        }

        .events-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .events-header h1 {
          font-size: 32px;
          margin-bottom: 8px;
          color: #fff;
        }

        .events-header p {
          font-size: 16px;
          color: #999;
        }

        .events-list {
          display: flex;
          flex-direction: column;
        }

        .loading,
        .error,
        .no-events {
          text-align: center;
          padding: 60px 20px;
          font-size: 18px;
          color: #999;
        }

        .error {
          color: #d32f2f;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 32px;
          padding: 20px 0;
        }

        .pagination-button {
          padding: 8px 16px;
          background: #333;
          border: 1px solid #555;
          border-radius: 4px;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-button:hover:not(:disabled) {
          background: #444;
          border-color: #666;
        }

        .pagination-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pagination-info {
          color: #999;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .container {
            padding: 16px;
          }

          .events-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
