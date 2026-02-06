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
    // Temporarily showing all events during development (including past ones)
    // status: 'approved',
  });

  // Debug logging
  console.log('Events Page Debug:', { events, loading, error, pagination });

  return (
    <div id="container" className="container">
      <div id="header" />
      
      <div id="content" className="row">
        <div className="col1 col-lg-8 col-md-8 col-xs-12" id="col1">
          <div className="bigBox" style={{ marginBottom: '20px' }}>
            <div className="bigBoxContent">
              <h1>Psychobilly Events</h1>
              
              {loading && <div style={{ textAlign: 'center', padding: '40px 0' }}>Loading events...</div>}
              
              {error && <div style={{ color: '#d32f2f', textAlign: 'center', padding: '40px 0' }}>Error: {error}</div>}
              
              {!loading && !error && events.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  No events found.
                </div>
              )}
              
              {!loading && !error && events.length > 0 && (
                <>
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                  
                  {pagination && pagination.pages > 1 && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: '16px',
                      marginTop: '32px',
                      padding: '20px 0'
                    }}>
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                          padding: '8px 16px',
                          background: '#333',
                          border: '1px solid #555',
                          borderRadius: '4px',
                          color: '#fff',
                          cursor: page === 1 ? 'not-allowed' : 'pointer',
                          opacity: page === 1 ? 0.4 : 1
                        }}
                      >
                        Previous
                      </button>
                      
                      <span style={{ color: '#999', fontSize: '14px' }}>
                        Page {page} of {pagination.pages} ({pagination.total} events)
                      </span>
                      
                      <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        style={{
                          padding: '8px 16px',
                          background: '#333',
                          border: '1px solid #555',
                          borderRadius: '4px',
                          color: '#fff',
                          cursor: page === pagination.pages ? 'not-allowed' : 'pointer',
                          opacity: page === pagination.pages ? 0.4 : 1
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="col2 col-lg-4 col-md-4 col-xs-12" id="col2">
          
        </div>
      </div>
      
      <div id="pageBottom">        
        &copy; Psychobilly Online 2008 / 2026
      </div>
    </div>
  );
}
