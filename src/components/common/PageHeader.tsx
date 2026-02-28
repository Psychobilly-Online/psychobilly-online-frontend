import { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function PageHeader({ title, description, icon, action }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <div>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
