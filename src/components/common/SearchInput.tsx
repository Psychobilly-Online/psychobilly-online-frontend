import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearching?: boolean;
  multiTerm?: boolean;
  minLength?: number;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  isSearching = false,
  multiTerm = false,
  minLength = 2,
}: SearchInputProps) {
  const finalPlaceholder = multiTerm
    ? `${placeholder} (use ; to separate multiple searches)`
    : placeholder;

  return (
    <div className={styles.container}>
      <input
        type="text"
        className={styles.input}
        placeholder={finalPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {isSearching && <span className={styles.indicator}>Searching...</span>}
      {multiTerm && value && !isSearching && (
        <span className={styles.hint}>
          {value.split(';').filter((t) => t.trim().length >= minLength).length} term(s)
        </span>
      )}
    </div>
  );
}
