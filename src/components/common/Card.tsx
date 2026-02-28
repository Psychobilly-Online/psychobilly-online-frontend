import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'highlight' | 'disabled';
  onClick?: () => void;
  className?: string;
}

interface HeaderProps {
  children: ReactNode;
}

interface TitleProps {
  children: ReactNode;
}

interface MetaProps {
  children: ReactNode;
}

interface ContentProps {
  children: ReactNode;
}

interface ActionsProps {
  children: ReactNode;
}

function Card({ children, variant = 'default', onClick, className = '' }: CardProps) {
  const handleClick = onClick ? () => onClick() : undefined;
  const handleKeyDown = onClick
    ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }
    : undefined;

  return (
    <div
      className={`${styles.card} ${styles[variant]} ${className} ${onClick ? styles.clickable : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

function Header({ children }: HeaderProps) {
  return <div className={styles.header}>{children}</div>;
}

function Title({ children }: TitleProps) {
  return <h3 className={styles.title}>{children}</h3>;
}

function Meta({ children }: MetaProps) {
  return <span className={styles.meta}>{children}</span>;
}

function Content({ children }: ContentProps) {
  return <div className={styles.content}>{children}</div>;
}

function Actions({ children }: ActionsProps) {
  return <div className={styles.actions}>{children}</div>;
}

// Define the component type with static properties
interface CardComponent {
  (props: CardProps): React.JSX.Element;
  Header: typeof Header;
  Title: typeof Title;
  Meta: typeof Meta;
  Content: typeof Content;
  Actions: typeof Actions;
}

// Cast to the proper type and assign static properties
const CardWithSubComponents = Card as CardComponent;
CardWithSubComponents.Header = Header;
CardWithSubComponents.Title = Title;
CardWithSubComponents.Meta = Meta;
CardWithSubComponents.Content = Content;
CardWithSubComponents.Actions = Actions;

export default CardWithSubComponents;
