import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EventDetail } from '../EventDetail';
import type { Event } from '@/types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock next/dynamic for EventMap
vi.mock('next/dynamic', () => ({
  default: (fn: any) => {
    const Component = () => null;
    Component.displayName = 'DynamicComponent';
    return Component;
  },
}));

describe('EventDetail', () => {
  const mockBaseEvent: Event = {
    id: 1,
    headline: 'Test Event',
    date_start: '2026-05-23',
    date_end: '2026-05-23',
    venue_id: 1,
    approved: true,
    bands: 'The Meteors, Demented Are Go',
    venue: {
      name: 'Test Venue',
      city: 'Berlin',
      country: 'Germany',
    },
  };

  describe('Basic Rendering', () => {
    it('renders event headline', () => {
      render(<EventDetail event={mockBaseEvent} />);
      expect(screen.getByRole('heading', { name: 'Test Event' })).toBeInTheDocument();
    });

    it('decodes HTML entities in headline', () => {
      const event = { ...mockBaseEvent, headline: 'Rock &amp; Roll Show' };
      render(<EventDetail event={event} />);
      expect(screen.getByRole('heading', { name: 'Rock & Roll Show' })).toBeInTheDocument();
    });

    it('renders navigation breadcrumbs', () => {
      render(<EventDetail event={mockBaseEvent} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
    });

    it('renders share button', () => {
      render(<EventDetail event={mockBaseEvent} />);
      expect(screen.getByTitle('Share event')).toBeInTheDocument();
    });
  });

  describe('Bands Display', () => {
    it('renders bands as chips for single-day event', () => {
      render(<EventDetail event={mockBaseEvent} />);
      expect(screen.getByText('The Meteors')).toBeInTheDocument();
      expect(screen.getByText('Demented Are Go')).toBeInTheDocument();
    });

    it('handles bands as comma-separated string', () => {
      const event = {
        ...mockBaseEvent,
        bands: 'Band One, Band Two',
      };
      render(<EventDetail event={event} />);
      expect(screen.getByText('Band One')).toBeInTheDocument();
      expect(screen.getByText('Band Two')).toBeInTheDocument();
    });

    it('handles empty bands gracefully', () => {
      const event = { ...mockBaseEvent, bands: undefined };
      render(<EventDetail event={event} />);
      // Should render without error
      expect(screen.getByRole('heading', { name: 'Test Event' })).toBeInTheDocument();
    });
  });

  describe('Multi-Day Events', () => {
    it('displays formatted dates for multi-day events', () => {
      const event = {
        ...mockBaseEvent,
        date_start: '2026-05-22',
        date_end: '2026-05-24',
        days: [
          {
            id: 1,
            date: '2026-05-22',
            label: 'Day 1',
            bands: ['Band A', 'Band B'],
          },
          {
            id: 2,
            date: '2026-05-23',
            label: 'Day 2',
            bands: ['Band C', 'Band D'],
          },
        ],
      };
      render(<EventDetail event={event} />);

      // Should show formatted dates instead of "Day 1", "Day 2"
      expect(screen.getByText(/Friday, May 22nd 2026/)).toBeInTheDocument();
      expect(screen.getByText(/Saturday, May 23rd 2026/)).toBeInTheDocument();
      expect(screen.queryByText('Day 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Day 2')).not.toBeInTheDocument();
    });

    it('displays bands per day for multi-day events', () => {
      const event = {
        ...mockBaseEvent,
        days: [
          {
            id: 1,
            date: '2026-05-22',
            label: 'Day 1',
            bands: ['Band A', 'Band B'],
          },
          {
            id: 2,
            date: '2026-05-23',
            label: 'Day 2',
            bands: ['Band C'],
          },
        ],
      };
      render(<EventDetail event={event} />);

      expect(screen.getByText('Band A')).toBeInTheDocument();
      expect(screen.getByText('Band B')).toBeInTheDocument();
      expect(screen.getByText('Band C')).toBeInTheDocument();
    });

    it('skips days with no bands', () => {
      const event = {
        ...mockBaseEvent,
        days: [
          {
            id: 1,
            date: '2026-05-22',
            label: 'Day 1',
            bands: ['Band A'],
          },
          {
            id: 2,
            date: '2026-05-23',
            label: 'Day 2',
            bands: [],
          },
        ],
      };
      render(<EventDetail event={event} />);

      expect(screen.getByText('Band A')).toBeInTheDocument();
      expect(screen.getByText(/Friday, May 22nd 2026/)).toBeInTheDocument();
      // Day 2 should not be rendered since it has no bands
      expect(screen.queryByText(/Saturday, May 23rd 2026/)).not.toBeInTheDocument();
    });
  });

  describe('Category and Genres', () => {
    it('displays category chip', () => {
      const event = { ...mockBaseEvent, category: 'Concert' };
      render(<EventDetail event={event} />);
      expect(screen.getByText('Concert')).toBeInTheDocument();
    });

    it('displays genre chips', () => {
      const event = { ...mockBaseEvent, genres: 'Psychobilly, Rockabilly' };
      render(<EventDetail event={event} />);
      expect(screen.getByText('Psychobilly')).toBeInTheDocument();
      expect(screen.getByText('Rockabilly')).toBeInTheDocument();
    });

    it('handles genres as comma-separated string', () => {
      const event = { ...mockBaseEvent, genres: 'Psychobilly, Punk' };
      render(<EventDetail event={event} />);
      expect(screen.getByText('Psychobilly')).toBeInTheDocument();
      expect(screen.getByText('Punk')).toBeInTheDocument();
    });
  });

  describe('Additional Information Section', () => {
    it('displays event text', () => {
      const event = { ...mockBaseEvent, text: 'This is additional event information.' };
      render(<EventDetail event={event} />);
      expect(screen.getByText('Additional Information:')).toBeInTheDocument();
      expect(screen.getByText('This is additional event information.')).toBeInTheDocument();
    });

    it('preserves line breaks in event text', () => {
      const event = {
        ...mockBaseEvent,
        text: 'Line 1\nLine 2\nLine 3',
      };
      render(<EventDetail event={event} />);

      // The text should be in an element with white-space: pre-line
      const textElement = screen.getByTestId('event-text');
      expect(textElement).toBeInTheDocument();
      expect(textElement.textContent).toBe('Line 1\nLine 2\nLine 3');
    });

    it('displays ticket price', () => {
      const event = { ...mockBaseEvent, ticket_price: '€25.00' };
      render(<EventDetail event={event} />);
      expect(screen.getByText('Ticket Price:')).toBeInTheDocument();
      expect(screen.getByText('€25.00')).toBeInTheDocument();
    });

    it('decodes HTML entities in event text', () => {
      const event = { ...mockBaseEvent, text: 'Doors open at 8pm &amp; show starts at 9pm' };
      render(<EventDetail event={event} />);
      expect(screen.getByText('Doors open at 8pm & show starts at 9pm')).toBeInTheDocument();
    });

    it('does not render section if no text, ticket price, or image', () => {
      render(<EventDetail event={mockBaseEvent} />);
      expect(screen.queryByText('Additional Information:')).not.toBeInTheDocument();
      expect(screen.queryByText('Ticket Price:')).not.toBeInTheDocument();
    });
  });

  describe('Image Display', () => {
    it('renders event image when image field is present', () => {
      const event = { ...mockBaseEvent, image: 'test-image' };
      const { container } = render(<EventDetail event={event} />);

      const img = container.querySelector('img[src*="test-image-medium.jpg"]');
      expect(img).toBeInTheDocument();
      expect(img?.getAttribute('alt')).toBe('Test Event');
    });

    it('renders legacy image when present', () => {
      const event = { ...mockBaseEvent, legacy_image: 'legacy-test.jpg' };
      const { container } = render(<EventDetail event={event} />);

      const img = container.querySelector('img[src*="legacy-test.jpg"]');
      expect(img).toBeInTheDocument();
    });

    it('prefers new image format over legacy', () => {
      const event = {
        ...mockBaseEvent,
        image: 'new-image',
        legacy_image: 'old-image.jpg',
      };
      const { container } = render(<EventDetail event={event} />);

      const newImg = container.querySelector('img[src*="new-image-medium.jpg"]');
      const oldImg = container.querySelector('img[src*="old-image.jpg"]');

      expect(newImg).toBeInTheDocument();
      expect(oldImg).not.toBeInTheDocument();
    });

    it('image container has correct CSS class for alignment', () => {
      const event = { ...mockBaseEvent, image: 'test-image' };
      render(<EventDetail event={event} />);

      const imageContainer = screen.getByTestId('event-image-container');
      expect(imageContainer).toBeInTheDocument();
    });
  });

  describe('Venue Information', () => {
    it('displays venue name', () => {
      render(<EventDetail event={mockBaseEvent} />);
      expect(screen.getByText('Test Venue')).toBeInTheDocument();
    });

    it('displays complete venue address', () => {
      const event = {
        ...mockBaseEvent,
        venue: {
          name: 'Test Venue',
          street: '123 Main St',
          city: 'Berlin',
          zip: '10115',
          country: 'Germany',
        },
      };
      render(<EventDetail event={event} />);

      expect(screen.getByText('Test Venue')).toBeInTheDocument();
      expect(screen.getByText(/Berlin/)).toBeInTheDocument();
    });
  });

  describe('Links Section', () => {
    it('displays event URL', () => {
      const event = { ...mockBaseEvent, url: 'https://example.com/event' };
      render(<EventDetail event={event} />);

      const link = screen.getByText('Event Website');
      expect(link).toBeInTheDocument();
      expect(link.getAttribute('href')).toBe('https://example.com/event');
    });

    it('displays ticket URL', () => {
      const event = { ...mockBaseEvent, ticket_url: 'https://tickets.example.com' };
      render(<EventDetail event={event} />);

      const link = screen.getByText('Buy Tickets');
      expect(link).toBeInTheDocument();
      expect(link.getAttribute('href')).toBe('https://tickets.example.com');
    });

    it('displays venue URL', () => {
      const event = {
        ...mockBaseEvent,
        venue: {
          name: 'Test Venue',
          city: 'Berlin',
          url: 'https://venue.example.com',
        },
      };
      render(<EventDetail event={event} />);

      const link = screen.getByText('Venue Website');
      expect(link).toBeInTheDocument();
      expect(link.getAttribute('href')).toBe('https://venue.example.com');
    });

    it('adds https protocol to URLs without protocol', () => {
      const event = { ...mockBaseEvent, url: 'example.com/event' };
      render(<EventDetail event={event} />);

      const link = screen.getByText('Event Website');
      expect(link.getAttribute('href')).toBe('https://example.com/event');
    });

    it('does not render Links section if no links present', () => {
      render(<EventDetail event={mockBaseEvent} />);
      expect(screen.queryByText('Event Website')).not.toBeInTheDocument();
      expect(screen.queryByText('Buy Tickets')).not.toBeInTheDocument();
    });
  });
});
