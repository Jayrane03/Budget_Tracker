// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// FIX: Import AuthContext along with AuthProvider, and confirm the path
import { AuthContext, AuthProvider } from './components/AuthContext'; // Corrected import path

import { ThemeProvider, CssBaseline ,CircularProgress } from '@mui/material';
import darkTheme from './theme'; // Make sure this path is correct

import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Dashboard from './components/pages/Dashboard';
import Transactions from './components/pages/Transaction'; // Changed to 'Transactions' (was 'Transaction')
import Reports from './components/pages/Reports';
import PredictBudget from './components/pages/BudgetPrediction';

import '../src/Styles/App.css';

// Your ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  // AuthContext is now correctly imported and available here
  const { isAuthenticated, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress /> {/* Use MUI CircularProgress for consistency */}
        <p style={{ marginTop: '10px', color: 'text.secondary' }}>Loading authentication...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    // Make sure ThemeProvider is the outermost wrapper around your content
    <ThemeProvider theme={darkTheme}> 
      <CssBaseline /> {/* Apply global Material-UI styles */}
      <Router>
        <AuthProvider> {/* AuthProvider should be inside ThemeProvider */}
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/predict-budget" element={<ProtectedRoute><PredictBudget /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;