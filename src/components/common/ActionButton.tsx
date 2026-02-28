import { ReactNode } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './ActionButton.module.css';

interface ActionButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function ActionButton({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  onClick,
  type = 'button',
  className = '',
}: ActionButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`
        ${styles.button}
        ${styles[variant]}
        ${styles[size]}
        ${fullWidth ? styles.fullWidth : ''}
        ${isDisabled ? styles.disabled : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={isDisabled}
    >
      {loading && (
        <CircularProgress
          size={size === 'small' ? 14 : size === 'large' ? 20 : 16}
          className={styles.spinner}
        />
      )}
      {icon && !loading && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
