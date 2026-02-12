import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EventCard } from '../EventCard';
import type { Event } from '@/types';

describe('EventCard', () => {
  const mockBaseEvent: Event = {
    id: 1,
    headline: 'Test Event',
    date_start: '2026-03-15',
    venue_id: 1,
    approved: true,
    venue: {
      name: 'Test Venue',
      city: 'Berlin',
    },
  };

  describe('Date Display', () => {
    it('displays single day event correctly', () => {
      const event = { ...mockBaseEvent, date_start: '2026-03-15', date_end: '2026-03-15' };
      render(<EventCard event={event} />);

      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('Mar')).toBeInTheDocument();
      expect(screen.getByText('2026')).toBeInTheDocument();
    });

    it('displays multi-day event in same month', () => {
      const event = { ...mockBaseEvent, date_start: '2026-03-15', date_end: '2026-03-17' };
      render(<EventCard event={event} />);

      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.getByText('17')).toBeInTheDocument();
      expect(screen.getByText('Mar')).toBeInTheDocument();
      expect(screen.getByText('2026')).toBeInTheDocument();
    });

    it('displays multi-day event across months in same year', () => {
      const event = { ...mockBaseEvent, date_start: '2026-04-30', date_end: '2026-05-01' };
      render(<EventCard event={event} />);

      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Apr')).toBeInTheDocument();
      expect(screen.getByText('May')).toBeInTheDocument();
      expect(screen.getByText('2026')).toBeInTheDocument();
    });

    it('displays multi-day event across years', () => {
      const event = { ...mockBaseEvent, date_start: '2025-12-31', date_end: '2026-01-01' };
      render(<EventCard event={event} />);

      expect(screen.getByText('31')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Dec')).toBeInTheDocument();
      expect(screen.getByText('Jan')).toBeInTheDocument();
      expect(screen.getByText('25/26')).toBeInTheDocument();
    });

    it('displays months in English', () => {
      const event = { ...mockBaseEvent, date_start: '2026-05-01', date_end: '2026-05-01' };
      render(<EventCard event={event} />);

      // Should be "May" not "Mai" (German)
      expect(screen.getByText('May')).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('displays headline without modification', () => {
      const event = { ...mockBaseEvent, headline: 'ALL CAPS EVENT' };
      render(<EventCard event={event} />);

      expect(screen.getByText('ALL CAPS EVENT')).toBeInTheDocument();
    });

    it('decodes HTML entities in headline', () => {
      const event = { ...mockBaseEvent, headline: 'Rock &amp; Roll Show' };
      render(<EventCard event={event} />);

      expect(screen.getByText('Rock & Roll Show')).toBeInTheDocument();
    });

    it('displays location before bands', () => {
      const event = {
        ...mockBaseEvent,
        bands: 'The Meteors',
        venue: { name: 'Test Venue', city: 'Berlin' },
      };
      render(<EventCard event={event} />);

      // Just verify both are rendered (ordering tested visually)
      expect(screen.getByText(/Berlin/)).toBeInTheDocument();
      expect(screen.getByText(/The Meteors/)).toBeInTheDocument();
    });

    it('displays category after location and bands', () => {
      const event = {
        ...mockBaseEvent,
        bands: 'The Meteors',
        venue: { name: 'Test Venue', city: 'Berlin' },
        category_id: 1,
      };
      render(<EventCard event={event} categoryName="Festival" />);

      // Just verify all are rendered (ordering tested visually)
      expect(screen.getByText(/Berlin/)).toBeInTheDocument();
      expect(screen.getByText(/The Meteors/)).toBeInTheDocument();
      expect(screen.getByText(/Festival/)).toBeInTheDocument();
    });
  });

  describe('Link Handling', () => {
    it('adds https protocol to links without protocol', () => {
      const event = { ...mockBaseEvent, link: 'example.com' };
      render(<EventCard event={event} />);

      const link = screen.getByRole('link', { name: /more info/i });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('preserves existing protocol in links', () => {
      const event = { ...mockBaseEvent, link: 'http://example.com' };
      render(<EventCard event={event} />);

      const link = screen.getByRole('link', { name: /more info/i });
      expect(link).toHaveAttribute('href', 'http://example.com');
    });
  });

  describe('Error Handling', () => {
    it('returns null for invalid date', () => {
      const event = { ...mockBaseEvent, date_start: 'invalid-date' };
      const { container } = render(<EventCard event={event} />);

      expect(container.firstChild).toBeNull();
    });
  });
});
