'use client';

import { TextField, TextFieldProps } from '@mui/material';

/**
 * Styled wrapper for MUI TextField with consistent form styling
 * This component applies the same styling as the search filter inputs
 */
export default function StyledTextField(props: TextFieldProps) {
  return (
    <TextField
      {...props}
      variant="outlined"
      sx={[
        {
          '& .MuiOutlinedInput-root': {
            padding: '0',
            fontSize: '0.9rem',
            backgroundColor: 'var(--color-bg-primary)',
            transition: 'border-color 0.2s',
            '& fieldset': {
              borderWidth: '1px',
              borderColor: 'var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
            },
            '&:hover fieldset': {
              borderColor: 'var(--color-accent-primary)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--color-accent-primary)',
              borderWidth: '1px',
              boxShadow: '0 0 0 2px rgba(177, 50, 42, 0.2)',
            },
            '& input': {
              padding: 'var(--spacing-2) var(--spacing-3)',
              color: 'var(--color-text-primary)',
              colorScheme: 'dark',
            },
            '& textarea': {
              padding: 'var(--spacing-2) var(--spacing-3)',
              color: 'var(--color-text-primary)',
            },
            // For select fields
            '& .MuiSelect-select': {
              padding: 'var(--spacing-2) var(--spacing-3)',
              color: 'var(--color-text-primary)',
            },
            '& .MuiSelect-icon': {
              color: 'var(--color-text-primary)',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'var(--color-text-secondary)',
            '&.Mui-focused': {
              color: 'var(--color-accent-primary)',
            },
          },
          '& .MuiFormHelperText-root': {
            color: 'var(--color-text-secondary)',
            '&.Mui-error': {
              color: 'var(--color-error)',
            },
          },
        },
        ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []),
      ]}
    />
  );
}
