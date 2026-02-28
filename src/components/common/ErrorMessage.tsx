import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
  title?: string;
}

export default function ErrorMessage({ error, onRetry, title = 'Error' }: ErrorMessageProps) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>⚠️</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{error}</p>
      {onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          Retry
        </button>
      )}
    </div>
  );
}
