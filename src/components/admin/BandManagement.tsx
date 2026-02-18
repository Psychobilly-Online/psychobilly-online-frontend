'use client';

import { useState } from 'react';
import BandSearch from './BandSearch';
import BandMerge from './BandMerge';
import styles from './BandManagement.module.css';

export interface Band {
  id: number;
  name: string;
  name_variations: string[] | null;
  relevance_score?: number;
}

export default function BandManagement() {
  const [selectedBands, setSelectedBands] = useState<Band[]>([]);
  const [searchResults, setSearchResults] = useState<Band[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectBand = (band: Band) => {
    if (!selectedBands.find(b => b.id === band.id)) {
      setSelectedBands([...selectedBands, band]);
    }
  };

  const handleRemoveBand = (bandId: number) => {
    setSelectedBands(selectedBands.filter(b => b.id !== bandId));
  };

  const handleClearSelection = () => {
    setSelectedBands([]);
  };

  const handleMergeComplete = () => {
    setSelectedBands([]);
    setSearchResults([]);
    setRefreshTrigger(prev => prev + 1); // Trigger search refresh
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <BandSearch 
          onSelectBand={handleSelectBand}
          selectedBands={selectedBands}
          onSearchResults={setSearchResults}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {selectedBands.length > 0 && (
        <div className={styles.mergeSection}>
          <BandMerge
            bands={selectedBands}
            onRemoveBand={handleRemoveBand}
            onClearSelection={handleClearSelection}
            onMergeComplete={handleMergeComplete}
          />
        </div>
      )}
    </div>
  );
}
