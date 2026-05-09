'use client';

import { Autocomplete, AutocompleteProps, TextField } from '@mui/material';

/**
 * Styled wrapper for MUI Autocomplete with consistent form styling
 * This component applies the same styling as the search filter inputs
 */
export default function StyledAutocomplete<
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
>(props: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) {
  const { renderInput, ...autocompleteProps } = props;

  return (
    <Autocomplete
      {...autocompleteProps}
      renderInput={(params) => {
        // If custom renderInput was provided, use it
        // Note: Custom inputs must apply their own TextField styling
        // The Autocomplete wrapper below provides popup/clear indicator styling
        if (renderInput) {
          return renderInput(params);
        }

        // Default renderInput with our styling
        return (
          <TextField
            {...params}
            variant="outlined"
            sx={{
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
                },
              },
              '& .MuiInputLabel-root': {
                color: 'var(--color-text-secondary)',
                '&.Mui-focused': {
                  color: 'var(--color-accent-primary)',
                },
              },
            }}
          />
        );
      }}
      sx={[
        {
          '& .MuiAutocomplete-popupIndicator': {
            color: 'var(--color-text-primary)',
          },
          '& .MuiAutocomplete-clearIndicator': {
            color: 'var(--color-text-primary)',
          },
        },
        ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []),
      ]}
      componentsProps={{
        popper: {
          sx: {
            '& .MuiPaper-root': {
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
            },
            '& .MuiAutocomplete-listbox': {
              padding: 'var(--spacing-1)',
            },
            '& .MuiAutocomplete-option': {
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)',
              '&:hover, &.Mui-focused': {
                backgroundColor: 'var(--color-bg-hover) !important',
              },
              '&[aria-selected="true"]': {
                backgroundColor: 'var(--color-accent-overlay) !important',
              },
            },
            '& .MuiAutocomplete-noOptions, & .MuiAutocomplete-loading': {
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg-elevated)',
            },
          },
        },
      }}
    />
  );
}
