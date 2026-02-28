import { ReactNode } from 'react';
import BandIdBadge from './BandIdBadge';
import NameVariations from './NameVariations';
import GenreTag from './GenreTag';
import styles from './BandListItem.module.css';

export interface BandGenre {
  id: number;
  name: string;
  is_primary: boolean;
}

interface BandListItemProps {
  id: number;
  name: string;
  nameVariations?: string[];
  genres?: BandGenre[];
  mode?: 'clickable' | 'selectable' | 'radio';
  selected?: boolean;
  onClick?: () => void;
  action?: ReactNode;
  showId?: boolean;
  className?: string;
}

export default function BandListItem({
  id,
  name,
  nameVariations,
  genres,
  mode = 'clickable',
  selected = false,
  onClick,
  action,
  showId = true,
  className,
}: BandListItemProps) {
  const handleClick = () => {
    if (onClick && mode === 'clickable') {
      onClick();
    }
  };

  const Container = mode === 'clickable' ? 'div' : 'label';

  return (
    <Container
      className={`
        ${styles.item} 
        ${mode === 'clickable' ? styles.clickable : ''} 
        ${selected ? styles.selected : ''}
        ${className || ''}
      `}
      onClick={handleClick}
    >
      {mode === 'selectable' && (
        <input type="checkbox" checked={selected} onChange={onClick} className={styles.checkbox} />
      )}

      {mode === 'radio' && (
        <input type="radio" checked={selected} onChange={onClick} className={styles.radio} />
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.name}>{name}</span>
          {showId && <BandIdBadge id={id} showLabel={true} />}
        </div>

        {nameVariations && nameVariations.length > 0 && (
          <NameVariations variations={nameVariations} showLabel={true} />
        )}

        {genres && genres.length > 0 && (
          <div className={styles.genres}>
            {genres.map((genre) => (
              <GenreTag key={genre.id} name={genre.name} isPrimary={genre.is_primary} />
            ))}
          </div>
        )}
      </div>

      {action && <div className={styles.action}>{action}</div>}
    </Container>
  );
}
