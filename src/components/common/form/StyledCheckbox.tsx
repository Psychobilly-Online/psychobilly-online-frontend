'use client';

import { Checkbox, CheckboxProps } from '@mui/material';

/**
 * Styled wrapper for MUI Checkbox with consistent form styling
 */
export default function StyledCheckbox(props: CheckboxProps) {
  return (
    <Checkbox
      {...props}
      sx={[
        {
          color: 'var(--color-text-secondary)',
          '&.Mui-checked': {
            color: 'var(--color-accent-primary)',
          },
          '&:hover': {
            backgroundColor: 'rgba(177, 50, 42, 0.08)',
          },
        },
        ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []),
      ]}
    />
  );
}
