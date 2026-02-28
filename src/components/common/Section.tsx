import { ReactNode } from 'react';
import styles from './Section.module.css';

interface SectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Section({ title, children, className = '' }: SectionProps) {
  return (
    <div className={`${styles.section} ${className}`}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {children}
    </div>
  );
}
