import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function LoadingSpinner({
  message = 'Loading...',
  size = 'medium',
}: LoadingSpinnerProps) {
  return (
    <div className={`${styles.container} ${styles[size]}`}>
      <div className={styles.spinner} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
