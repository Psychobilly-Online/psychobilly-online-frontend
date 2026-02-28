import { ReactNode } from 'react';
import styles from './InfoBar.module.css';

interface InfoBarProps {
  children: ReactNode;
  variant?: 'default' | 'highlight';
}

interface CountProps {
  label: string;
  value: number | string;
}

interface StatusProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
}

interface ActionProps {
  children: ReactNode;
}

function InfoBar({ children, variant = 'default' }: InfoBarProps) {
  return <div className={`${styles.infoBar} ${styles[variant]}`}>{children}</div>;
}

function Count({ label, value }: CountProps) {
  return (
    <div className={styles.count}>
      <span className={styles.countLabel}>{label}:</span>
      <strong className={styles.countValue}>{value}</strong>
    </div>
  );
}

function Status({ message, type = 'info', icon }: StatusProps) {
  const defaultIcons = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠️',
    error: '✕',
  };

  return (
    <div className={`${styles.status} ${styles[`status-${type}`]}`}>
      <span className={styles.statusIcon}>{icon || defaultIcons[type]}</span>
      <span className={styles.statusMessage}>{message}</span>
    </div>
  );
}

function Action({ children }: ActionProps) {
  return <div className={styles.action}>{children}</div>;
}

InfoBar.Count = Count;
InfoBar.Status = Status;
InfoBar.Action = Action;

export default InfoBar;
