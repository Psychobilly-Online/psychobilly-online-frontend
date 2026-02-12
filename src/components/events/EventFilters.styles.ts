import { createTheme } from '@mui/material/styles';

export const filterTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7d2923' },
    background: { default: '#1b1b1d', paper: '#202022' },
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: 'inherit' },
});

export const inputSx = {
  '& .MuiInputBase-root': {
    backgroundColor: '#262629',
    color: '#fff',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
  },
  '& .MuiInputLabel-root': {
    color: '#fff',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#fff',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#3a3a3d',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#3a3a3d',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#3a3a3d',
    boxShadow: 'none',
  },
};

export const settingsPopoverSx = {
  backgroundColor: '#202022',
  border: '1px solid #2d2d30',
  color: '#fff',
  boxShadow: '0 12px 28px rgba(0,0,0,0.4)',
  marginTop: '6px',
  minWidth: 260,
  maxWidth: 'min(100vw - 32px, 1200px)',
};

export const countryPopoverSx = {
  backgroundColor: '#202022',
  border: '1px solid #2d2d30',
  color: '#fff',
  boxShadow: '0 12px 28px rgba(0,0,0,0.4)',
  padding: '12px',
  marginTop: '6px',
  minWidth: 320,
  maxWidth: 'min(100vw - 32px, 1200px)',
};

export const datePopoverSx = {
  backgroundColor: '#202022',
  border: '1px solid #2d2d30',
  color: '#fff',
  boxShadow: '0 12px 28px rgba(0,0,0,0.4)',
  padding: '12px',
  marginTop: '6px',
  maxWidth: 'min(100vw - 32px, 1200px)',
};
