import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SearchChips } from '../SearchChips';
import { SearchProvider, useSearchContext } from '@/contexts/SearchContext';
import { useEffect } from 'react';

describe('SearchChips', () => {
  describe('Rendering', () => {
    it('renders nothing when no search terms exist', () => {
      const { container } = render(
        <SearchProvider>
          <SearchChips />
        </SearchProvider>,
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders chips for search terms', async () => {
      let addTerm: ((term: string) => void) | null = null;

      const TestComponent = () => {
        const { addSearchTerm } = useSearchContext();
        addTerm = addSearchTerm;
        return <SearchChips />;
      };

      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>,
      );

      // Add terms one at a time using act
      await act(async () => {
        addTerm?.('Mad Sin');
      });

      await act(async () => {
        addTerm?.('Berlin');
      });

      await waitFor(() => {
        expect(screen.getByText('Mad Sin')).toBeInTheDocument();
        expect(screen.getByText('Berlin')).toBeInTheDocument();
      });
    });
  });

  describe('Chip Removal', () => {
    it('has delete functionality on chips', async () => {
      const TestComponent = () => {
        const { addSearchTerm, searchTerms } = useSearchContext();

        useEffect(() => {
          addSearchTerm('Mad Sin');
          addSearchTerm('Berlin');
        }, [addSearchTerm]);

        return (
          <div>
            <SearchChips />
            <div data-testid="chip-count">{searchTerms.length}</div>
          </div>
        );
      };

      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Mad Sin')).toBeInTheDocument();
        expect(screen.getByTestId('chip-count')).toHaveTextContent('2');
      });

      // Verify chips have delete functionality by checking for buttons with aria-label
      const deleteButtons = screen.getAllByRole('button');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Layout', () => {
    it('renders chip with proper structure', async () => {
      const TestComponent = () => {
        const { addSearchTerm } = useSearchContext();

        useEffect(() => {
          addSearchTerm('Mad Sin');
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return <SearchChips />;
      };

      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Mad Sin')).toBeInTheDocument();
      });

      // Verify chip has delete button
      const deleteButton = screen.getByRole('button');
      expect(deleteButton).toBeInTheDocument();
    });
  });
});
