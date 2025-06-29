import * as React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

import { createTheme } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DemoProvider } from '@toolpad/core/internal';

import { Box, Tabs, Tab } from '@mui/material';
import BudgetDashboardContent from '../layout/BudgetDashboardContent';
import Transactions from '../pages/Transaction';
import Reports from '../pages/Reports';
import PredictBudget from '../pages/BudgetPrediction';

// Custom dark theme (keep your existing one if needed)

const demoTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-toolpad-color-scheme' },
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: { main: '#0f0c29', contrastText: '#ffffff' },
        secondary: { main: '#ff6b6b' },
        background: { default: '#f5f7fb', paper: '#ffffff' },
        text: { primary: '#1a1a1a', secondary: '#555' },
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: { main: '#08a087', contrastText: '#ffffff' },
        background: { default: '#121212', paper: '#1e1e1e' },
        text: { primary: '#ffffff', secondary: '#c9c9c9' },
      },
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to right, #00ffd5, #08a087, #24243e)',
          color: '#ffffff',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'linear-gradient(to right, #00ffd5, #08a087, #24243e)',
          color: '#0f0c29',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#e0f7fa',
            color: '#0f0c29',
          },
        },
      },
    },
  },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
});
function DashboardLayout(props) {
  const { window } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const subPath = location.pathname.replace('/dashboard', '') || '/';

  const router = React.useMemo(() => ({
    pathname: location.pathname,
    searchParams: new URLSearchParams(location.search),
    navigate: (path) => navigate(path),
  }), [location, navigate]);

  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <DemoProvider window={demoWindow}>
      <AppProvider
        router={router}
        // branding={{
        //   logo: <img src="/freepik__budget.png" alt="logo" height="30" />,
        //   title: 'BudgetAI',
        //   homeUrl: '/dashboard',
        // }}
        theme={demoTheme}
        window={demoWindow}
      >
        <Navbar />
        {/* Clean full layout with no sidebar padding */}
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          {/* Vertical Tabs */}
          <Tabs
            orientation="vertical"
            value={subPath}
            onChange={(e, value) => navigate(`/dashboard${value}`)}
            sx={{
              width: 250,
              pt: 4,
              backgroundColor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Tab label="Dashboard" value="/" icon={<DashboardIcon />} iconPosition="start" />
            <Tab label="Transactions" value="/transactions" icon={<ShoppingCartIcon />} iconPosition="start" />
            <Tab label="Reports" value="/reports" icon={<BarChartIcon />} iconPosition="start" />
            <Tab label="Predict Budget" value="/predict-budget" icon={<AutoGraphIcon />} iconPosition="start" />
          </Tabs>

          {/* Main content area */}
          <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<BudgetDashboardContent />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="reports" element={<Reports />} />
              <Route path="predict-budget" element={<PredictBudget />} />
              <Route path="*" element={<BudgetDashboardContent />} />
            </Routes>
          </Box>
        </Box>
      </AppProvider>
    </DemoProvider>
  );
}

DashboardLayout.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayout;
