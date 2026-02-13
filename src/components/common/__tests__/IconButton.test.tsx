import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from '../IconButton';

describe('IconButton', () => {
  describe('Rendering', () => {
    it('renders button with icon', () => {
      render(<IconButton icon={<span>Test Icon</span>} ariaLabel="Test button" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Test Icon')).toBeInTheDocument();
    });

    it('renders with aria-label', () => {
      render(<IconButton icon={<span>Icon</span>} ariaLabel="Test button" />);

      expect(screen.getByRole('button', { name: 'Test button' })).toBeInTheDocument();
    });

    it('requires aria-label', () => {
      render(<IconButton icon={<span>Icon</span>} ariaLabel="Required label" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });
  });

  describe('Variants', () => {
    it('applies default variant class', () => {
      render(<IconButton icon={<span>Icon</span>} variant="default" ariaLabel="Button" />);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/default/);
    });

    it('applies primary variant class', () => {
      render(<IconButton icon={<span>Icon</span>} variant="primary" ariaLabel="Button" />);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/primary/);
    });

    it('applies ghost variant class', () => {
      render(<IconButton icon={<span>Icon</span>} variant="ghost" ariaLabel="Button" />);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/ghost/);
    });

    it('defaults to default variant when not specified', () => {
      render(<IconButton icon={<span>Icon</span>} ariaLabel="Button" />);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/default/);
    });
  });

  describe('Sizes', () => {
    it('applies small size class', () => {
      render(<IconButton icon={<span>Icon</span>} size="small" ariaLabel="Button" />);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/small/);
    });

    it('applies medium size class', () => {
      render(<IconButton icon={<span>Icon</span>} size="medium" ariaLabel="Button" />);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/medium/);
    });

    it('applies large size class', () => {
      render(<IconButton icon={<span>Icon</span>} size="large" ariaLabel="Button" />);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/large/);
    });

    it('defaults to medium size when not specified', () => {
      render(<IconButton icon={<span>Icon</span>} ariaLabel="Button" />);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/medium/);
    });
  });

  describe('Disabled State', () => {
    it('renders as disabled when disabled prop is true', () => {
      render(<IconButton icon={<span>Icon</span>} disabled ariaLabel="Button" />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.className).toMatch(/disabled/);
    });

    it('is not disabled by default', () => {
      render(<IconButton icon={<span>Icon</span>} ariaLabel="Button" />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <IconButton icon={<span>Icon</span>} onClick={handleClick} disabled ariaLabel="Button" />,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Click Handler', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<IconButton icon={<span>Icon</span>} onClick={handleClick} ariaLabel="Button" />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('works without onClick handler', async () => {
      const user = userEvent.setup();

      render(<IconButton icon={<span>Icon</span>} ariaLabel="Button" />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Should not throw error
      expect(button).toBeInTheDocument();
    });

    it('receives event object in onClick', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<IconButton icon={<span>Icon</span>} onClick={handleClick} ariaLabel="Button" />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('Button Type', () => {
    it('has button type by default', () => {
      render(<IconButton icon={<span>Icon</span>} ariaLabel="Button" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('CSS Classes', () => {
    it('combines variant and size classes', () => {
      render(
        <IconButton icon={<span>Icon</span>} variant="primary" size="large" ariaLabel="Button" />,
      );

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/primary/);
      expect(button.className).toMatch(/large/);
    });

    it('applies base iconButton class', () => {
      render(<IconButton icon={<span>Icon</span>} ariaLabel="Button" />);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/iconButton/);
    });

    it('combines all classes when disabled', () => {
      render(
        <IconButton
          icon={<span>Icon</span>}
          variant="primary"
          size="large"
          disabled
          ariaLabel="Button"
        />,
      );

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/iconButton/);
      expect(button.className).toMatch(/primary/);
      expect(button.className).toMatch(/large/);
      expect(button.className).toMatch(/disabled/);
    });
  });

  describe('Accessibility', () => {
    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<IconButton icon={<span>Icon</span>} onClick={handleClick} ariaLabel="Test button" />);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });

    it('has proper role', () => {
      render(<IconButton icon={<span>Icon</span>} ariaLabel="Button" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
