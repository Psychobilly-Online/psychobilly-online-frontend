'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMetadata } from '@/contexts/MetadataContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useVenueList } from '@/hooks/useVenueList';
import type { Venue } from '@/types/venue';
import SearchInput from '@/components/common/SearchInput';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import Pagination from '@/components/common/Pagination';
import Section from '@/components/common/Section';
import VenueListItem from '@/components/common/VenueListItem';
import ActionButton from '@/components/common/ActionButton';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import VenueSelectionActionBar from './VenueSelectionActionBar';
import EditVenueDialog from './EditVenueDialog';
import MergeVenuesDialog from './MergeVenuesDialog';
import styles from './VenueOverview.module.css';

export default function VenueOverview() {
  const router = useRouter();
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'orphaned'>('all');
  const [selectedVenues, setSelectedVenues] = useState<Venue[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(50);
  const [clientPage, setClientPage] = useState(1);
  const [scrollToVenueId, setScrollToVenueId] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load countries for filter
  const { countries } = useMetadata();

  // Determine filter values based on quick filter
  const orphanedOnly = quickFilter === 'orphaned';

  const { venues, isLoading, error, total, pages, currentPage, reload, setPage } = useVenueList({
    search: debouncedSearch,
    status: statusFilter,
    country: countryFilter,
    city: cityFilter,
    orphanedOnly,
    multiSearch: true,
  });

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
    setClientPage(1);
  }, [debouncedSearch, statusFilter, countryFilter, cityFilter, quickFilter, setPage]);

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
    setSelectedVenues([]);
  }, [debouncedSearch, statusFilter, countryFilter, cityFilter, quickFilter]);

  // Scroll to venue after reload
  useEffect(() => {
    if (scrollToVenueId && !isLoading && venues.length > 0) {
      const venueIndex = venues.findIndex((v) => v.id === scrollToVenueId);

      if (venueIndex !== -1) {
        // Calculate which page the venue is on
        if (debouncedSearch) {
          const targetPage = Math.floor(venueIndex / resultsPerPage) + 1;
          if (targetPage !== clientPage) {
            setClientPage(targetPage);
            return;
          }
        }

        // Scroll to the venue after a delay
        const scrollTimeout = setTimeout(() => {
          requestAnimationFrame(() => {
            const element = document.querySelector(`[data-venue-id="${scrollToVenueId}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add(styles.highlightVenue);
              setTimeout(() => {
                element.classList.remove(styles.highlightVenue);
              }, 2000);
            }
            setScrollToVenueId(null);
          });
        }, 300);

        return () => clearTimeout(scrollTimeout);
      } else {
        setScrollToVenueId(null);
      }
    }
  }, [scrollToVenueId, isLoading, venues, debouncedSearch, resultsPerPage, clientPage]);

  // Client-side pagination for search results
  const totalResults = venues.length;
  const totalClientPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (clientPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const displayedVenues = debouncedSearch ? venues.slice(startIndex, endIndex) : venues;
  const displayPages = debouncedSearch ? totalClientPages : pages;
  const displayCurrentPage = debouncedSearch ? clientPage : currentPage;

  const handleVenueToggle = (venue: Venue) => {
    setSelectedVenues((prev) => {
      const isSelected = prev.some((v) => v.id === venue.id);
      if (isSelected) {
        return prev.filter((v) => v.id !== venue.id);
      } else {
        return [...prev, venue];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedVenues([]);
  };

  const handleSelectAll = () => {
    setSelectedVenues(displayedVenues);
  };

  const handleEditVenue = () => {
    if (selectedVenues.length === 1) {
      setEditDialogOpen(true);
    }
  };

  const handleViewEvents = () => {
    if (selectedVenues.length === 1) {
      const venue = selectedVenues[0];
      router.push(`/events?search=${encodeURIComponent(venue.venue)}&from_date=1950-01-01`);
    }
  };

  const handleMergeVenues = () => {
    if (selectedVenues.length >= 2) {
      setMergeDialogOpen(true);
    }
  };

  const handleDeleteVenue = () => {
    if (selectedVenues.length !== 1) return;
    setDeleteError(null);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedVenues.length !== 1) return;

    const venue = selectedVenues[0];
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/admin/venues/${venue.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete venue');
      }

      // Success - close dialog and refresh
      setDeleteConfirmOpen(false);
      setRefreshTrigger((prev) => prev + 1);
      handleClearSelection();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete venue');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickFilterChange = (filter: 'all' | 'orphaned') => {
    setQuickFilter(filter);
  };

  const handleVenueSaved = (updatedVenue: Venue) => {
    // Refresh the list and scroll to the updated venue
    setScrollToVenueId(updatedVenue.id);
    setRefreshTrigger((prev) => prev + 1);
    // Deselect after save
    handleClearSelection();
  };

  const handleVenuesMerged = () => {
    // Refresh the list after merge
    setRefreshTrigger((prev) => prev + 1);
    handleClearSelection();
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
              placeholder="Search venues..."
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
              All Venues
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
          </div>

          {/* Advanced Filters */}
          <div className={styles.advancedFilters}>
            <label className={styles.filterLabel}>
              Status:
              <select
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="temporarily_closed">Temporarily Closed</option>
                <option value="permanently_closed">Permanently Closed</option>
              </select>
            </label>

            <label className={styles.filterLabel}>
              Country:
              <select
                className={styles.filterSelect}
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
              >
                <option value="">All countries</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterLabel}>
              City:
              <input
                type="text"
                className={styles.filterInput}
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="e.g., Berlin"
              />
            </label>

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
              </select>
            </label>
          </div>
        </div>
      </Section>

      {/* Error State */}
      {error && <ErrorMessage error={error} onRetry={reload} />}

      {/* Selection Action Bar */}
      <VenueSelectionActionBar
        selectedCount={selectedVenues.length}
        totalCount={displayedVenues.length}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAll}
        onEditVenue={handleEditVenue}
        onViewEvents={handleViewEvents}
        onMergeVenues={handleMergeVenues}
        onDeleteVenue={handleDeleteVenue}
      />

      {/* Venue List */}
      <Section title="Venues">
        {isLoading ? (
          <LoadingSpinner message="Loading venues..." size="small" />
        ) : (
          <>
            <div className={styles.venueList}>
              {displayedVenues.map((venue) => (
                <div key={venue.id}>
                  <VenueListItem
                    id={venue.id}
                    venue={venue.venue}
                    city={venue.city}
                    country_name={venue.country_name}
                    status={venue.status}
                    event_count={venue.event_count}
                    mode="selectable"
                    selected={selectedVenues.some((v) => v.id === venue.id)}
                    onClick={() => handleVenueToggle(venue)}
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

      {/* Edit Venue Dialog */}
      {selectedVenues.length === 1 && (
        <EditVenueDialog
          open={editDialogOpen}
          venue={selectedVenues[0]}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleVenueSaved}
        />
      )}

      {/* Merge Venues Dialog */}
      {selectedVenues.length >= 2 && (
        <MergeVenuesDialog
          open={mergeDialogOpen}
          venues={selectedVenues}
          onClose={() => setMergeDialogOpen(false)}
          onMerge={handleVenuesMerged}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {selectedVenues.length === 1 && (
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setDeleteError(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Venue"
          message={
            <div>
              <p>Are you sure you want to delete &quot;{selectedVenues[0].venue}&quot;?</p>
              <p style={{ marginTop: '8px', fontWeight: 'bold' }}>This action cannot be undone.</p>
              {deleteError && (
                <p style={{ marginTop: '12px', color: 'var(--color-error)', fontSize: '14px' }}>
                  Error: {deleteError}
                </p>
              )}
            </div>
          }
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="error"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
