import React, { ReactNode } from 'react';
import styles from './InfoBar.module.css';

interface InfoBarProps {
  children: ReactNode;
  variant?: 'default' | 'highlight';
  type?: 'info' | 'success' | 'warning' | 'error';
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

function InfoBarRoot({ children, variant = 'default', type }: InfoBarProps) {
  // Build class names, avoiding 'undefined' by only adding non-default variant
  const classNames = [styles.infoBar];
  if (variant !== 'default') {
    classNames.push(styles[variant]);
  }
  if (type) {
    classNames.push(styles[`type-${type}`]);
  }
  return <div className={classNames.join(' ')}>{children}</div>;
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
    <div className={styles.status}>
      <span className={styles.statusIcon}>{icon || defaultIcons[type]}</span>
      <span className={styles.statusMessage}>{message}</span>
    </div>
  );
}

function Action({ children }: ActionProps) {
  return <div className={styles.action}>{children}</div>;
}

// Define the component type with static properties
interface InfoBarComponent {
  (props: InfoBarProps): React.ReactElement;
  Count: typeof Count;
  Status: typeof Status;
  Action: typeof Action;
}

// Cast to the proper type and assign static properties
const InfoBar = InfoBarRoot as InfoBarComponent;
InfoBar.Count = Count;
InfoBar.Status = Status;
InfoBar.Action = Action;

export default InfoBar;
