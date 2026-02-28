import styles from './GenreTag.module.css';

interface GenreTagProps {
  name: string;
  isPrimary?: boolean;
  className?: string;
}

export default function GenreTag({ name, isPrimary = false, className }: GenreTagProps) {
  return (
    <span className={`${styles.genreTag} ${isPrimary ? styles.primary : ''} ${className || ''}`}>
      {name}
      {isPrimary && <span className={styles.primaryIndicator}>★</span>}
    </span>
  );
}
