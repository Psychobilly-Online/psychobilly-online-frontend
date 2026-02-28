import Link from 'next/link';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string; // Optional - if not provided, renders as plain text
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={index}>
          {index > 0 && <span className={styles.separator}> / </span>}
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span className={styles.current}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
