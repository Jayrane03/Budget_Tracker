// src/theme.js
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark', // This is crucial for dark mode
    primary: {
      main: '#90CAF9', // Light blue for primary elements
      dark: '#424242', // Darker shade for table head background
    },
    secondary: {
      main: '#CE93D8', // Light purple for secondary elements
    },
    error: {
      main: '#EF9A9A', // Light red for errors (expenses)
    },
    success: {
      main: '#A5D6A7', // Light green for success (income)
    },
    background: {
      default: '#121212', // Very dark background for the body
      paper: '#1E1E1E',   // Slightly lighter dark for Paper components (like the table)
    },
    text: {
      primary: '#E0E0E0', // Light grey for primary text
      secondary: '#B0B0B0', // Slightly darker grey for secondary text
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#333',
          color: 'white',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': {
            borderColor: '#555',
          },
          '&:hover fieldset': {
            borderColor: '#90CAF9',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#90CAF9',
          },
        },
      },
    },
  },
});

export default darkTheme; // Ensure this is exported correctly