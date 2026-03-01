import Link from 'next/link';
import styles from './Breadcrumb.module.css';

// Discriminated union to ensure href and onClick are mutually exclusive
export type BreadcrumbItem =
  | { label: string; onClick: () => void } // Button with custom handler
  | { label: string; href: string } // Link to another page
  | { label: string }; // Plain text (current page)

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={index}>
          {index > 0 && (
            <span className={styles.separator} aria-hidden="true">
              {' '}
              /{' '}
            </span>
          )}
          {'onClick' in item ? (
            <button onClick={item.onClick} className={styles.clickable} type="button">
              {item.label}
            </button>
          ) : 'href' in item ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span className={styles.current} aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
