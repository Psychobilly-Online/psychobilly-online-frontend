import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Breadcrumb from '../Breadcrumb';

describe('Breadcrumb', () => {
  describe('Rendering', () => {
    it('renders breadcrumb navigation', () => {
      render(<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Events' }]} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Breadcrumb');
    });

    it('renders all breadcrumb items', () => {
      render(
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Events', href: '/events' },
            { label: 'Current Event' },
          ]}
        />,
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Current Event')).toBeInTheDocument();
    });

    it('renders separators between items', () => {
      render(
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Events', href: '/events' },
            { label: 'Current' },
          ]}
        />,
      );

      // Should have 2 separators between 3 items
      const separators = screen.getAllByText('/');
      expect(separators).toHaveLength(2);
    });
  });

  describe('Link Items', () => {
    it('renders items with href as links', () => {
      render(
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Events', href: '/events' },
          ]}
        />,
      );

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');

      const eventsLink = screen.getByRole('link', { name: 'Events' });
      expect(eventsLink).toBeInTheDocument();
      expect(eventsLink).toHaveAttribute('href', '/events');
    });

    it('renders current item (no href) as plain text', () => {
      render(<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Current Page' }]} />);

      expect(screen.getByText('Current Page')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Current Page' })).not.toBeInTheDocument();
    });
  });

  describe('Clickable Items', () => {
    it('renders items with onClick as buttons', () => {
      const handleClick = vi.fn();
      render(
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Back', onClick: handleClick },
            { label: 'Current' },
          ]}
        />,
      );

      const backButton = screen.getByRole('button', { name: 'Back' });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveAttribute('type', 'button');
    });

    it('calls onClick handler when button is clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Events', onClick: handleClick },
          ]}
        />,
      );

      const button = screen.getByRole('button', { name: 'Events' });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not render button or link when no href or onClick provided', () => {
      render(<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Current Page' }]} />);

      expect(screen.getByText('Current Page')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Current Page' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Current Page' })).not.toBeInTheDocument();
    });
  });

  describe('Mixed Items', () => {
    it('handles mix of links, buttons, and plain text', () => {
      const handleClick = vi.fn();

      render(
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Events', onClick: handleClick },
            { label: 'Current Event' },
          ]}
        />,
      );

      // Link
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      // Button
      expect(screen.getByRole('button', { name: 'Events' })).toBeInTheDocument();
      // Plain text
      expect(screen.getByText('Current Event')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Current Event' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Current Event' })).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('renders single item without separator', () => {
      render(<Breadcrumb items={[{ label: 'Home', href: '/' }]} />);

      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.queryByText('/')).not.toBeInTheDocument();
    });

    it('handles empty items array', () => {
      render(<Breadcrumb items={[]} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});
