import cx from 'classnames';
import styles from './IconButton.module.css';

export interface IconButtonProps {
  /** Icon element or SVG */
  icon: React.ReactNode;
  /** Accessibility label */
  ariaLabel: string;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Visual variant */
  variant?: 'default' | 'primary' | 'ghost';
  /** Additional CSS class */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function IconButton({
  icon,
  ariaLabel,
  onClick,
  type = 'button',
  size = 'medium',
  variant = 'default',
  className,
  disabled = false,
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        styles.iconButton,
        styles[size],
        styles[variant],
        disabled && styles.disabled,
        className,
      )}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {icon}
    </button>
  );
}
