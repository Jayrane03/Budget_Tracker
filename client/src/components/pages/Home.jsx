import { Link, useNavigate } from 'react-router-dom';
import RobotScene from '../../threejs/Robot';
import '../../Styles/landing.css';
import Navbar from '../layout/Navbar';
import { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { Alert, Snackbar } from '@mui/material';
import { ThemeProvider, CssBaseline, Box, Typography } from '@mui/material';
const Home = () => {
  const { isAuthenticated , loading } = useContext(AuthContext);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();
 if (loading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: '#111213',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: theme => theme.zIndex.tooltip,
        }}
      >
        <span className="loader"></span>
        <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
          Authenticating…
        </Typography>
      </Box>
    );
  }

  const handleProtectedClick = () => {
    if (!isAuthenticated) {
      setShowAlert(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
  };

  return (
    <div className="home">
      <Navbar />
      <div className="landing-cont">
        <div className="landing-content">
          <div className="landing-text fade-in-left">
            <h1 className="landing-title">
              Welcome to <span>BudgetAI</span>
            </h1>
            <p className="landing-subtitle">
              Track your expenses and gain AI-powered insights to manage your money smarter.
            </p>

            {isAuthenticated ? (
              <div className='landing-button'>
                <p className="landing-subtitle">Start managing your budget now!</p>
              <button className="btn" onClick={() => navigate('/dashboard')}>
                 Dashboard
                </button>
                </div>
            ) : (
              <div className="landing-button">
                <button className="btn" onClick={handleProtectedClick}>
                  Set Your Budget
                </button>
              </div>
            )}
          </div>

          <div className="landing-robot fade-in-right">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                fill="#00FFD5"
                d="M37.5,-60.1C50.8,-49.9,65,-43.1,73.2,-31.6C81.3,-20,83.3,-3.9,73.4,5C63.4,13.9,41.5,15.4,29.2,19.8C16.9,24.3,14.1,31.5,7.6,39.7C1.1,47.9,-9.2,57.1,-14.7,53.7C-20.2,50.4,-20.9,34.6,-32.5,25.7C-44.1,16.8,-66.5,14.8,-74.4,6.4C-82.2,-2,-75.6,-16.7,-65.4,-26C-55.2,-35.4,-41.5,-39.2,-30,-50.2C-18.5,-61.2,-9.2,-79.3,1.5,-81.6C12.2,-83.9,24.3,-70.3,37.5,-60.1Z"
                transform="translate(100 95)"
                filter="url(#glow)"
              />
            </svg>

            <RobotScene />
          </div>
        </div>
      </div>

      {/* MUI Alert Snackbar */}
      <Snackbar open={showAlert} autoHideDuration={1000} onClose={() => setShowAlert(false)}>
        <Alert severity="warning" variant="filled" sx={{ width: '100%' }}>
          Please login first to access the budget dashboard.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Home;
