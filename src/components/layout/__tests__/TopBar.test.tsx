import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TopBar } from '../TopBar';
import { SearchProvider } from '@/contexts/SearchContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/events'),
}));

// Wrapper component to provide SearchContext and AuthContext
const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <AuthProvider>
      <SearchProvider>{ui}</SearchProvider>
    </AuthProvider>,
  );
};

describe('TopBar', () => {
  describe('Visibility', () => {
    it('renders the top bar by default', () => {
      renderWithProvider(<TopBar />);
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('hides the top bar when hide prop is true', () => {
      renderWithProvider(<TopBar hide={true} />);
      expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('renders search input', () => {
      renderWithProvider(<TopBar />);
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('adds search term when form is submitted', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TopBar />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Mad Sin');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Input should be cleared after submission
      expect(searchInput).toHaveValue('');
    });

    it('does not add empty search terms', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TopBar />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // No error should occur
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('trims whitespace from search terms', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TopBar />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, '  Mad Sin  ');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      expect(searchInput).toHaveValue('');
    });

    it('updates search input value as user types', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TopBar />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Berlin');

      expect(searchInput).toHaveValue('Berlin');
    });
  });

  describe('Search Context', () => {
    it('displays events context placeholder', () => {
      renderWithProvider(<TopBar searchContext="events" />);
      expect(screen.getByPlaceholderText(/search for bands, venue, city/i)).toBeInTheDocument();
    });

    it('displays news context placeholder', () => {
      renderWithProvider(<TopBar searchContext="news" />);
      expect(screen.getByPlaceholderText(/search news/i)).toBeInTheDocument();
    });

    it('displays default context placeholder', () => {
      renderWithProvider(<TopBar searchContext="default" />);
      expect(screen.getByPlaceholderText(/^search\.\.\./i)).toBeInTheDocument();
    });
  });

  describe('Navigation Icons', () => {
    it('renders hamburger menu button', () => {
      renderWithProvider(<TopBar />);
      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    });

    it('does not render notification button when logged out', () => {
      renderWithProvider(<TopBar />);
      expect(screen.queryByRole('button', { name: /notification/i })).not.toBeInTheDocument();
    });

    it('renders user profile button', () => {
      renderWithProvider(<TopBar />);
      // When not logged in, button shows "Login"
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
  });

  describe('Keyboard Interactions', () => {
    it('submits search on Enter key', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TopBar />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Test{Enter}');

      expect(searchInput).toHaveValue('');
    });

    it('does not submit when pressing other keys', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TopBar />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Test');

      expect(searchInput).toHaveValue('Test');
    });
  });
});
