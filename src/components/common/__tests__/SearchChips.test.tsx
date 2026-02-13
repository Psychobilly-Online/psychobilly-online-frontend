import { render, screen, waitFor } from '@testing-library/react';
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
      const TestComponent = () => {
        const { addSearchTerm } = useSearchContext();

        useEffect(() => {
          addSearchTerm('Mad Sin');
          addSearchTerm('Berlin');
        }, [addSearchTerm]);

        return <SearchChips />;
      };

      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>,
      );

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

      // Verify chips have delete icons (MUI Chips with onDelete show delete icon)
      const chips = document.querySelectorAll('.MuiChip-deletable');
      expect(chips.length).toBeGreaterThan(0);
    });
  });

  describe('Layout', () => {
    it('uses MUI components', async () => {
      const TestComponent = () => {
        const { addSearchTerm } = useSearchContext();

        useEffect(() => {
          addSearchTerm('Mad Sin');
        }, [addSearchTerm]);

        return <SearchChips />;
      };

      const { container } = render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Mad Sin')).toBeInTheDocument();
      });

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toBeInTheDocument();

      const chip = screen.getByText('Mad Sin').closest('.MuiChip-root');
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveClass('MuiChip-outlined');
    });
  });
});
