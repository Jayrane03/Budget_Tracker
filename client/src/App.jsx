// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './components/AuthContext';
import { ThemeProvider, CssBaseline, CircularProgress, Box, Typography } from '@mui/material';
import darkTheme from './theme';
import './index.css'; // Ensure this is imported to apply global styles
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import DashboardLayoutBasic from '../src/components/pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
     <>
     
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: theme => theme.zIndex.tooltip,
        }}
      >
           <span className="loader"></span>
        <Typography variant="h6" sx={{ mt: 2, color: 'primary.contrastText' }}>
          Authenticating…
        </Typography>
      </Box>
     </>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard/*" element={<ProtectedRoute><DashboardLayoutBasic /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
