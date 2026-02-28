import { useState, KeyboardEvent } from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  showPageInput?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  showPageInput = true,
}: PaginationProps) {
  const [pageInput, setPageInput] = useState('');

  if (totalPages <= 1) return null;

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Show max 7 page buttons

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setPageInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputSubmit();
    }
  };

  return (
    <>
      <div className={styles.pagination}>
        {/* Left side: First + Previous */}
        <div className={styles.paginationLeft}>
          <button
            onClick={() => onPageChange(1)}
            disabled={!canGoPrevious || disabled}
            className={styles.navButton}
            title="First page"
          >
            ⟨⟨
          </button>

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious || disabled}
            className={styles.navButton}
            title="Previous page"
          >
            ← Prev
          </button>
        </div>

        {/* Center: Page numbers */}
        <div className={styles.pageNumbers}>
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  …
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                disabled={disabled}
                className={`${styles.pageNumberButton} ${
                  page === currentPage ? styles.active : ''
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Right side: Next + Last */}
        <div className={styles.paginationRight}>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext || disabled}
            className={styles.navButton}
            title="Next page"
          >
            Next →
          </button>

          <button
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext || disabled}
            className={styles.navButton}
            title="Last page"
          >
            ⟩⟩
          </button>
        </div>
      </div>

      {/* Direct page input - separate row */}
      {showPageInput && totalPages > 5 && (
        <div className={styles.pageInputWrapper}>
          <span className={styles.pageInputLabel}>Go to page:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className={styles.pageInput}
            placeholder={`1-${totalPages}`}
          />
          <button
            onClick={handlePageInputSubmit}
            disabled={disabled || !pageInput}
            className={styles.goButton}
          >
            Go
          </button>
        </div>
      )}
    </>
  );
}
