import { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ message, icon, action, className }: EmptyStateProps) {
  return (
    <div className={`${styles.emptyState} ${className || ''}`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <p className={styles.message}>{message}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
