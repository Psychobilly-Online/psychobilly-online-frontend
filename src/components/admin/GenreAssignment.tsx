'use client';

import { useState } from 'react';
import BandList from './BandList';
import GenreSelector from './GenreSelector';
import styles from './GenreAssignment.module.css';

export interface BandWithGenres {
  id: number;
  name: string;
  name_variations: string[];
  genres: Array<{
    id: number;
    name: string;
    is_primary: boolean;
  }>;
}

export interface Genre {
  id: number;
  name: string;
  sub_genres?: string[];
}

export default function GenreAssignment() {
  const [selectedBands, setSelectedBands] = useState<BandWithGenres[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);

  const handleBandsSelected = (bands: BandWithGenres[]) => {
    setSelectedBands(bands);
  };

  const handleGenresSelected = (genres: Genre[]) => {
    setSelectedGenres(genres);
  };

  const handleClearSelection = () => {
    setSelectedBands([]);
    setSelectedGenres([]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Band Selection Column */}
        <div className={styles.column}>
          <BandList 
            selectedBands={selectedBands}
            onBandsSelected={handleBandsSelected}
          />
        </div>

        {/* Genre Selection Column */}
        <div className={styles.column}>
          <GenreSelector
            selectedBands={selectedBands}
            selectedGenres={selectedGenres}
            onGenresSelected={handleGenresSelected}
            onClearSelection={handleClearSelection}
          />
        </div>
      </div>
    </div>
  );
}
