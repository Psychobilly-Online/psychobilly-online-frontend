import { ReactNode } from 'react';
import styles from './Tag.module.css';

interface TagProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export default function Tag({ children, variant = 'secondary', className }: TagProps) {
  return <span className={`${styles.tag} ${styles[variant]} ${className || ''}`}>{children}</span>;
}
