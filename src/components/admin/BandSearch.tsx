'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Band } from './BandManagement';
import styles from './BandSearch.module.css';

interface BandSearchProps {
  onSelectBand: (band: Band) => void;
  selectedBands: Band[];
  onSearchResults: (results: Band[]) => void;
  refreshTrigger?: number;
}

export default function BandSearch({ onSelectBand, selectedBands, onSearchResults, refreshTrigger }: BandSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Band[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchBands();
      } else {
        setResults([]);
        onSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, refreshTrigger]);

  const searchBands = async () => {
    if (!token) return;

    setIsSearching(true);
    setError(null);

    try {
      // Split search query by semicolon for multi-search
      const searchTerms = searchQuery
        .split(';')
        .map(term => term.trim())
        .filter(term => term.length >= 2);

      if (searchTerms.length === 0) {
        setResults([]);
        onSearchResults([]);
        setIsSearching(false);
        return;
      }

      // Search for each term and combine results
      const allResults: Band[] = [];
      const seenIds = new Set<number>();

      for (const term of searchTerms) {
        const response = await fetch(
          `/api/bands/search?q=${encodeURIComponent(term)}&limit=50`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        const termResults = data.results || [];

        // Add results, avoiding duplicates
        termResults.forEach((band: Band) => {
          if (!seenIds.has(band.id)) {
            seenIds.add(band.id);
            allResults.push(band);
          }
        });
      }

      // Sort by name
      allResults.sort((a, b) => a.name.localeCompare(b.name));

      setResults(allResults);
      onSearchResults(allResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const isBandSelected = (bandId: number) => {
    return selectedBands.some(b => b.id === bandId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchHeader}>
        <h2>Search Bands</h2>
        <p>Search for band names to find duplicates and variations. Use <strong>semicolons</strong> to search multiple terms (e.g., "band 1; band 2; band 3")</p>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Enter band name(s) - use ; to separate multiple searches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isSearching && <span className={styles.searching}>Searching...</span>}
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <span>Found {results.length} band(s)</span>
          </div>
          
          <div className={styles.resultsList}>
            {results.map((band) => (
              <div 
                key={band.id} 
                className={`${styles.resultItem} ${isBandSelected(band.id) ? styles.selected : ''}`}
              >
                <div className={styles.bandInfo}>
                  <div className={styles.bandName}>
                    {band.name}
                    <span className={styles.bandId}>ID: {band.id}</span>
                  </div>
                  
                  {band.name_variations && band.name_variations.length > 0 && (
                    <div className={styles.variations}>
                      <span className={styles.variationsLabel}>Variations:</span>
                      {band.name_variations.join(', ')}
                    </div>
                  )}
                </div>

                <button
                  className={styles.selectButton}
                  onClick={() => onSelectBand(band)}
                  disabled={isBandSelected(band.id)}
                >
                  {isBandSelected(band.id) ? 'Selected' : 'Select'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchQuery.length >= 2 && !isSearching && results.length === 0 && (
        <div className={styles.noResults}>
          No bands found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}
