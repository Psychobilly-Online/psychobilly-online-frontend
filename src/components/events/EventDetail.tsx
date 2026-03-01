'use client';

import { Event } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ensureProtocol } from '@/lib/stringUtils';
import { useState, useEffect } from 'react';
import { formatEventDate, formatLongDate } from '@/lib/date-utils';
import { decodeHtmlEntities } from '@/lib/stringUtils';
import { formatVenueAddress } from '@/lib/address-utils';
import { DateBadge } from '@/components/shared/DateBadge';
import Breadcrumb from '@/components/common/Breadcrumb';
import styles from './EventDetail.module.css';

// Dynamically import EventMap to avoid SSR issues with Leaflet
const EventMap = dynamic(() => import('./EventMap').then((mod) => mod.EventMap), {
  ssr: false,
  loading: () => (
    <div className={styles.mapPlaceholder}>
      <p>Loading map...</p>
    </div>
  ),
});

interface EventDetailProps {
  event: Event;
}

export function EventDetail({ event }: EventDetailProps) {
  const router = useRouter();
  const [shareSuccess, setShareSuccess] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const hasMultipleDays = event.days && event.days.length > 1;

  const handleBackClick = () => {
    router.back();
  };

  const handleEventsClick = () => {
    // Check if we have a referrer from the same origin (indicating internal navigation)
    const referrer = document.referrer;
    const isSameOrigin = referrer && new URL(referrer).origin === window.location.origin;

    if (isSameOrigin) {
      router.back();
    } else {
      router.push('/events');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = decodeHtmlEntities(event.headline);

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShareSuccess(true);
    });
  };

  // Auto-hide share success message after 3 seconds
  useEffect(() => {
    if (shareSuccess) {
      const timeout = setTimeout(() => setShareSuccess(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [shareSuccess]);

  // Construct image URL
  const imageUrl = event.image
    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/${event.image}-medium.jpg`
    : event.legacy_image
      ? `https://www.psychobilly-online.de/uploads/events/${event.legacy_image}`
      : null;

  const largeImageUrl = event.image
    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/${event.image}-large.jpg`
    : event.legacy_image
      ? `https://www.psychobilly-online.de/uploads/events/${event.legacy_image}`
      : null;

  // Format bands - handle both string (comma-separated) and array
  const formatBands = (bandsInput?: string | string[]): string[] => {
    if (!bandsInput) return [];

    // If already an array, return it
    if (Array.isArray(bandsInput)) {
      return bandsInput.map((band) => String(band).trim()).filter((band) => band.length > 0);
    }

    // If string, split by comma
    return bandsInput
      .split(',')
      .map((band) => band.trim())
      .filter((band) => band.length > 0);
  };

  const bandsList = formatBands(event.bands);

  return (
    <div className={styles.eventDetail}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Events', onClick: handleEventsClick },
          { label: decodeHtmlEntities(event.headline) },
        ]}
      />

      {/* Content Card */}
      <div className={styles.contentCard}>
        <div className={styles.mainContent}>
          <div className={styles.leftColumn}>
            <DateBadge dateStart={event.date_start} dateEnd={event.date_end} size="large" />
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.header}>
              <h1 className={styles.headline}>{decodeHtmlEntities(event.headline)}</h1>
              <div className={styles.actionsContainer}>
                <button
                  onClick={handleBackClick}
                  className={styles.backButton}
                  title="Back to events"
                >
                  ← Back
                </button>
                <div className={styles.shareContainer}>
                  <button onClick={handleShare} className={styles.shareButton} title="Share event">
                    🔗 Share
                  </button>
                  {shareSuccess && <span className={styles.shareSuccess}>✓ Copied!</span>}
                </div>
              </div>
            </div>

            {/* Category and Genres */}
            {(event.category || event.genres) && (
              <div className={styles.metaInfo}>
                {event.category && (
                  <span className={styles.categoryChip}>{decodeHtmlEntities(event.category)}</span>
                )}
                {event.genres &&
                  formatBands(event.genres).map((genre, idx) => (
                    <span key={idx} className={styles.genreChip}>
                      {decodeHtmlEntities(genre)}
                    </span>
                  ))}
              </div>
            )}

            {/* Bands */}
            <div className={styles.section}>
              <div className={styles.bandListing}>
                <div className={styles.bandsContainer}>
                  {hasMultipleDays && event.days && event.days.length > 1 ? (
                    <>
                      {event.days.map((day) => {
                        const dayBands = formatBands(day.bands);
                        if (dayBands.length === 0) return null;

                        return (
                          <div key={day.id} className={styles.daySection}>
                            <h3 className={styles.dayTitle}>{formatLongDate(day.date)}</h3>
                            <div className={styles.bandsList}>
                              {dayBands.map((band, idx) => (
                                <span key={idx} className={styles.bandChip}>
                                  {decodeHtmlEntities(band)}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : bandsList.length > 0 ? (
                    <div className={styles.bandsList}>
                      {bandsList.map((band, idx) => (
                        <span key={idx} className={styles.bandChip}>
                          {decodeHtmlEntities(band)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {(event.text || event.ticket_price || imageUrl) && (
              <div className={styles.section}>
                <div className={styles.additionalInfoWrapper}>
                  <div className={styles.additionalInfoContent}>
                    {event.text && (
                      <div className={styles.additionalInfoContainer}>
                        <strong>Additional Information:</strong>
                        <p className={styles.additionalInfo} data-testid="event-text">
                          {decodeHtmlEntities(event.text)}
                        </p>
                      </div>
                    )}

                    {event.ticket_price && (
                      <div className={styles.additionalInfoContainer}>
                        <strong>Ticket Price:</strong>
                        <p className={styles.additionalInfo}>
                          {decodeHtmlEntities(event.ticket_price)}
                        </p>
                      </div>
                    )}
                  </div>

                  {imageUrl && (
                    <div
                      className={styles.imageContainer}
                      onClick={() => setImageModalOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setImageModalOpen(true);
                        }
                      }}
                      data-testid="event-image-container"
                      role="button"
                      tabIndex={0}
                    >
                      <img src={imageUrl} alt={decodeHtmlEntities(event.headline)} />
                      <div className={styles.imageOverlay} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Venue */}
            {event.venue && (
              <div className={styles.section}>
                <div className={styles.venueInfo}>
                  {formatVenueAddress(event.venue).map((line, idx) => (
                    <div
                      key={idx}
                      className={idx === 0 ? styles.venueName : styles.venueAddressLine}
                    >
                      {decodeHtmlEntities(line)}
                    </div>
                  ))}
                  {/* Map */}
                  {event.venue?.latitude && event.venue?.longitude && (
                    <div className={styles.mapSection}>
                      <EventMap
                        latitude={parseFloat(event.venue.latitude)}
                        longitude={parseFloat(event.venue.longitude)}
                        venueName={event.venue.name || 'Event Venue'}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Event Info */}
            {(event.url || event.ticket_price || event.ticket_url || event.venue?.url) && (
              <div className={styles.section}>
                <strong>Links</strong>
                {event.venue?.url && (
                  <div className={styles.eventInfo}>
                    <a
                      href={ensureProtocol(event.venue.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.venueLink}
                    >
                      Venue Website
                    </a>
                  </div>
                )}
                {event.url && (
                  <div className={styles.eventInfo}>
                    <a
                      href={ensureProtocol(event.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.eventLink}
                    >
                      Event Website
                    </a>
                  </div>
                )}
                {event.ticket_url && (
                  <div className={styles.eventInfo}>
                    <a
                      href={ensureProtocol(event.ticket_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.ticketLink}
                    >
                      Buy Tickets
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog
        open={imageModalOpen && !!largeImageUrl}
        onClose={() => setImageModalOpen(false)}
        maxWidth={false}
        slotProps={{
          paper: { className: styles.imageDialogPaper },
        }}
        className={styles.imageDialog}
      >
        <div className={styles.imageModalContent}>
          <IconButton
            onClick={() => setImageModalOpen(false)}
            className={styles.closeModalButton}
            aria-label="Close image"
          >
            <CloseIcon />
          </IconButton>
          {largeImageUrl && <img src={largeImageUrl} alt={decodeHtmlEntities(event.headline)} />}
        </div>
      </Dialog>
    </div>
  );
}
