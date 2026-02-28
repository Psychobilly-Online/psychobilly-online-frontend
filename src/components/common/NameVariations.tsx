import styles from './NameVariations.module.css';

interface NameVariationsProps {
  variations: string[];
  showLabel?: boolean;
  maxDisplay?: number;
  className?: string;
}

export default function NameVariations({
  variations,
  showLabel = true,
  maxDisplay,
  className,
}: NameVariationsProps) {
  if (!variations || variations.length === 0) {
    return null;
  }

  const displayVariations = maxDisplay ? variations.slice(0, maxDisplay) : variations;

  const remaining =
    maxDisplay && variations.length > maxDisplay ? variations.length - maxDisplay : 0;

  return (
    <div className={`${styles.variations} ${className || ''}`}>
      {showLabel && <span className={styles.label}>Variations:</span>}
      <span className={styles.list}>
        {displayVariations.join(', ')}
        {remaining > 0 && <span className={styles.more}> +{remaining} more</span>}
      </span>
    </div>
  );
}
