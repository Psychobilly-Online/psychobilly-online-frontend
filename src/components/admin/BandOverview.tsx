'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useDebounce } from '@/hooks/useDebounce';
import { useBandList } from '@/hooks/useBandList';
import type { Band } from '@/hooks/useBandList';
import SearchInput from '@/components/common/SearchInput';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import Pagination from '@/components/common/Pagination';
import Section from '@/components/common/Section';
import BandListItem from '@/components/common/BandListItem';
import ActionButton from '@/components/common/ActionButton';
import EditBandDialog from './EditBandDialog';
import BandMerge from './BandMerge';
import BandSplit from './BandSplit';
import GenreSelector from './GenreSelector';
import BandSelectionActionBar from './BandSelectionActionBar';
import styles from './BandOverview.module.css';
import bandMergeStyles from './BandMerge.module.css';
import bandSplitStyles from './BandSplit.module.css';
import genreSelectorStyles from './GenreSelector.module.css';

interface Genre {
  id: number;
  name: string;
}

export default function BandOverview() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'orphaned' | 'no-genres'>('all');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedBands, setSelectedBands] = useState<Band[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [isGenreDialogOpen, setIsGenreDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(50);
  const [clientPage, setClientPage] = useState(1);
  const [scrollToBandId, setScrollToBandId] = useState<number | null>(null);

  // Determine filter values based on quick filter
  const orphanedOnly = quickFilter === 'orphaned';
  const effectiveGenreFilter = quickFilter === 'no-genres' ? '0' : genreFilter;

  const { bands, isLoading, error, total, pages, currentPage, reload, setPage } = useBandList({
    search: debouncedSearch,
    genreId: effectiveGenreFilter,
    orphanedOnly,
    multiSearch: true,
  });

  // Load genres for filter dropdown
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await fetch('/api/genres');
        if (response.ok) {
          const data = await response.json();
          setGenres(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load genres:', err);
      }
    };
    loadGenres();
  }, []);

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
    setClientPage(1);
  }, [debouncedSearch, genreFilter, quickFilter, setPage]);

  // Reset client page when results per page changes
  useEffect(() => {
    setClientPage(1);
  }, [resultsPerPage]);

  // Refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      reload();
    }
  }, [refreshTrigger, reload]);

  // Clear selection when filters change
  useEffect(() => {
    setSelectedBands([]);
  }, [debouncedSearch, genreFilter, quickFilter]);

  // Scroll to band after reload
  useEffect(() => {
    if (scrollToBandId && !isLoading && bands.length > 0) {
      // Find the band in the current results
      const bandIndex = bands.findIndex((b) => b.id === scrollToBandId);

      if (bandIndex !== -1) {
        // Calculate which page the band is on
        if (debouncedSearch) {
          const targetPage = Math.floor(bandIndex / resultsPerPage) + 1;
          if (targetPage !== clientPage) {
            setClientPage(targetPage);
            // Will scroll after page changes
            return;
          }
        }

        // Scroll to the band after a delay to ensure DOM is updated
        const scrollTimeout = setTimeout(() => {
          requestAnimationFrame(() => {
            const element = document.querySelector(`[data-band-id="${scrollToBandId}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight the band briefly
              element.classList.add(styles.highlightBand);
              setTimeout(() => {
                element.classList.remove(styles.highlightBand);
              }, 2000);
            }
            setScrollToBandId(null);
          });
        }, 300);

        return () => clearTimeout(scrollTimeout);
      } else {
        setScrollToBandId(null);
      }
    }
  }, [scrollToBandId, isLoading, bands, debouncedSearch, resultsPerPage, clientPage]);

  // Client-side pagination for search results
  const totalResults = bands.length;
  const totalClientPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (clientPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const displayedBands = debouncedSearch ? bands.slice(startIndex, endIndex) : bands;
  const displayPages = debouncedSearch ? totalClientPages : pages;
  const displayCurrentPage = debouncedSearch ? clientPage : currentPage;

  const handleBandToggle = (band: Band) => {
    setSelectedBands((prev) => {
      const isSelected = prev.some((b) => b.id === band.id);
      if (isSelected) {
        return prev.filter((b) => b.id !== band.id);
      } else {
        return [...prev, band];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedBands([]);
  };

  const handleSelectAll = () => {
    // In search mode, only select the bands displayed on the current page
    // Otherwise, selecting "all" could select hundreds of search results
    setSelectedBands(displayedBands);
  };

  const handleEditBand = () => {
    if (selectedBands.length === 1) {
      setIsEditDialogOpen(true);
    }
  };

  const handleViewEvents = () => {
    if (selectedBands.length === 1) {
      const band = selectedBands[0];
      // Use 'search' parameter and set from_date to 1950 to show all events (including past)
      router.push(`/events?search=${encodeURIComponent(band.name)}&from_date=1950-01-01`);
    }
  };

  const handleSplitBand = () => {
    if (selectedBands.length === 1) {
      setIsSplitDialogOpen(true);
    }
  };

  const handleMergeBands = () => {
    if (selectedBands.length >= 2) {
      setIsMergeDialogOpen(true);
    }
  };

  const handleAssignGenres = () => {
    if (selectedBands.length >= 1) {
      setIsGenreDialogOpen(true);
    }
  };

  const handleRemoveBandFromSelection = (bandId: number) => {
    setSelectedBands((prev) => prev.filter((b) => b.id !== bandId));
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleSaveSuccess = () => {
    if (selectedBands.length === 1) {
      setScrollToBandId(selectedBands[0].id);
    }
    setRefreshTrigger((prev) => prev + 1);
    handleCloseEditDialog();
    handleClearSelection();
  };

  const handleMergeComplete = (targetBandId?: number) => {
    if (targetBandId) {
      setScrollToBandId(targetBandId);
    }
    setRefreshTrigger((prev) => prev + 1);
    setIsMergeDialogOpen(false);
    handleClearSelection();
  };

  const handleSplitComplete = () => {
    // For split, we don't have a specific band to scroll to since multiple new bands are created
    setRefreshTrigger((prev) => prev + 1);
    setIsSplitDialogOpen(false);
    handleClearSelection();
  };

  const handleGenreAssignmentComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
    setIsGenreDialogOpen(false);
    setSelectedGenres([]);
    handleClearSelection();
  };

  const handleCloseGenreDialog = () => {
    setIsGenreDialogOpen(false);
    setSelectedGenres([]);
  };

  const handleQuickFilterChange = (filter: 'all' | 'orphaned' | 'no-genres') => {
    setQuickFilter(filter);
    if (filter !== 'all') {
      setGenreFilter(''); // Reset genre filter when using quick filters
    }
  };

  const handlePageChange = (page: number) => {
    if (debouncedSearch) {
      setClientPage(page);
    } else {
      setPage(page);
    }
  };

  return (
    <div className={styles.container}>
      {/* Search and Filters */}
      <Section title="Search & Filters">
        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search bands..."
              isSearching={isLoading}
              multiTerm={true}
            />
            {!isLoading && !error && debouncedSearch && (
              <ActionButton
                onClick={() => setSearch('')}
                variant="secondary"
                size="medium"
                className={styles.clearButton}
              >
                Clear Search
              </ActionButton>
            )}
          </div>

          {/* Quick Filters */}
          <div className={styles.quickFilters}>
            <button
              className={`${styles.quickFilterButton} ${quickFilter === 'all' ? styles.active : ''}`}
              onClick={() => handleQuickFilterChange('all')}
            >
              All Bands
              {quickFilter === 'all' && total > 0 && (
                <span className={styles.count}>{total.toLocaleString()}</span>
              )}
            </button>
            <button
              className={`${styles.quickFilterButton} ${quickFilter === 'orphaned' ? styles.active : ''}`}
              onClick={() => handleQuickFilterChange('orphaned')}
            >
              Orphaned Only
              {quickFilter === 'orphaned' && total > 0 && (
                <span className={styles.count}>{total.toLocaleString()}</span>
              )}
            </button>
            <button
              className={`${styles.quickFilterButton} ${quickFilter === 'no-genres' ? styles.active : ''}`}
              onClick={() => handleQuickFilterChange('no-genres')}
            >
              No Genres
              {quickFilter === 'no-genres' && total > 0 && (
                <span className={styles.count}>{total.toLocaleString()}</span>
              )}
            </button>
          </div>

          {/* Genre Filter (only show when "All Bands" is selected) */}
          {quickFilter === 'all' && (
            <div className={styles.genreFilter}>
              <label className={styles.filterLabel}>
                Filter by genre:
                <select
                  className={styles.filterSelect}
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                >
                  <option value="">All genres</option>
                  <optgroup label="Specific genres">
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id.toString()}>
                        {genre.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>
            </div>
          )}

          {/* Results Per Page */}
          <div className={styles.genreFilter}>
            <label className={styles.filterLabel}>
              Results per page:
              <select
                className={styles.filterSelect}
                value={resultsPerPage}
                onChange={(e) => setResultsPerPage(Number(e.target.value))}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
              </select>
            </label>
          </div>
        </div>
      </Section>

      {/* Error State */}
      {error && <ErrorMessage error={error} onRetry={reload} />}

      {/* Selection Action Bar */}
      <BandSelectionActionBar
        selectedCount={selectedBands.length}
        totalCount={bands.length}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAll}
        onEditBand={handleEditBand}
        onViewEvents={handleViewEvents}
        onSplitBand={handleSplitBand}
        onMergeBands={handleMergeBands}
        onAssignGenres={handleAssignGenres}
      />

      {/* Band List */}
      <Section title="Bands">
        {isLoading ? (
          <LoadingSpinner message="Loading bands..." size="small" />
        ) : (
          <>
            <div className={styles.bandList}>
              {displayedBands.map((band) => (
                <div key={band.id} data-band-id={band.id}>
                  <BandListItem
                    id={band.id}
                    name={band.name}
                    nameVariations={band.name_variations}
                    genres={band.genres}
                    mode="selectable"
                    selected={selectedBands.some((b) => b.id === band.id)}
                    onClick={() => handleBandToggle(band)}
                    showId={true}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {displayPages > 1 && (
              <Pagination
                currentPage={displayCurrentPage}
                totalPages={displayPages}
                onPageChange={handlePageChange}
                disabled={isLoading}
              />
            )}
          </>
        )}
      </Section>

      {/* Edit Dialog - Single Band */}
      {selectedBands.length === 1 && (
        <EditBandDialog
          open={isEditDialogOpen}
          band={selectedBands[0]}
          onClose={handleCloseEditDialog}
          onSave={handleSaveSuccess}
        />
      )}

      {/* Merge Dialog - Multiple Bands */}
      <Dialog
        open={isMergeDialogOpen}
        onClose={() => setIsMergeDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        classes={{ paper: bandMergeStyles.dialogPaper }}
      >
        <DialogTitle className={bandMergeStyles.dialogTitle}>Merge Bands</DialogTitle>
        <DialogContent className={bandMergeStyles.dialogContent}>
          <BandMerge
            bands={selectedBands}
            onRemoveBand={handleRemoveBandFromSelection}
            onClearSelection={() => setIsMergeDialogOpen(false)}
            onMergeComplete={handleMergeComplete}
          />
        </DialogContent>
      </Dialog>

      {/* Split Dialog - Single Band */}
      {selectedBands.length === 1 && (
        <Dialog
          open={isSplitDialogOpen}
          onClose={() => setIsSplitDialogOpen(false)}
          maxWidth="md"
          fullWidth
          classes={{ paper: bandSplitStyles.dialogPaper }}
        >
          <DialogTitle className={bandSplitStyles.dialogTitle}>Split Band</DialogTitle>
          <DialogContent className={bandSplitStyles.dialogContent}>
            <BandSplit
              band={selectedBands[0]}
              onCancel={() => setIsSplitDialogOpen(false)}
              onSplitComplete={handleSplitComplete}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Genre Assignment Dialog */}
      <Dialog
        open={isGenreDialogOpen}
        onClose={handleCloseGenreDialog}
        maxWidth="lg"
        fullWidth
        classes={{ paper: genreSelectorStyles.dialogPaper }}
      >
        <DialogTitle className={genreSelectorStyles.dialogTitle}>
          Assign Genres to Bands
        </DialogTitle>
        <DialogContent className={genreSelectorStyles.dialogContent}>
          <GenreSelector
            selectedBands={selectedBands}
            selectedGenres={selectedGenres}
            onGenresSelected={setSelectedGenres}
            onClearSelection={handleCloseGenreDialog}
            onAssignmentComplete={handleGenreAssignmentComplete}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
