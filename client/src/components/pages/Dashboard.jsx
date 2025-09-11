import * as React from 'react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Alert } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SavingsIcon from '@mui/icons-material/Savings';
import { createTheme, useTheme } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DemoProvider } from '@toolpad/core/internal';
import LogoutIcon from '@mui/icons-material/Logout';
import Budget from '../layout/Budget';
import Reports from '../pages/Reports';
import Chatbot from '../layout/chatBot';
import PredictBudget from '../pages/BudgetPrediction';
import Transactions from '../pages/Transaction';
import { AuthContext } from '../AuthContext';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon
import { keyframes } from '@mui/system'; // Import keyframes for animations
import BudgetDashboardContent from '../layout/BudgetDashboardContent';
import BotChat from '../layout/chatBot';
// Define the glow animation outside the component
const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 8px rgba(0, 255, 213, 0.6), 0 0 12px rgba(8, 160, 135, 0.4);
  }
  50% {
    box-shadow: 0 0 15px rgba(0, 255, 213, 0.9), 0 0 25px rgba(8, 160, 135, 0.6);
  }
  100% {
    box-shadow: 0 0 8px rgba(0, 255, 213, 0.6), 0 0 12px rgba(8, 160, 135, 0.4);
  }
`;

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
    // The MuiDrawer styleOverrides in the theme define the default look.
    // We will override this specifically for the temporary drawer using sx prop.
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

const drawerWidth = 240; // Define your desired drawer width

function DashboardLayout(props) {
  const { window } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const [alert, setAlert] = useState(null);
  const { logout } = React.useContext(AuthContext);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const subPath = location.pathname.replace('/dashboard', '') || '/';

  const router = React.useMemo(() => ({
    pathname: location.pathname,
    searchParams: new URLSearchParams(location.search),
    navigate: (path) => navigate(path),
  }), [location, navigate]);

  const demoWindow = window !== undefined ? window() : undefined;

  const handleLogout = () => {
    logout();
    setAlert(
      <Alert
        icon={<CheckIcon fontSize="inherit" />}
        severity="success"
        variant="filled"
        sx={{ width: '100%' }}
      >
        You’ve successfully logged out!
      </Alert>
    );
    setTimeout(() => setAlert(null), 3000);
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Dashboard', value: '/', icon: <DashboardIcon /> },
    { label: 'Budget', value: '/budget', icon: <SavingsIcon /> },
    { label: 'Transactions', value: '/transactions', icon: <ShoppingCartIcon /> },
    { label: 'Reports', value: '/reports', icon: <BarChartIcon /> },
    { label: 'Chat Bot', value: '/chat-bot', icon: <AutoGraphIcon /> },
    { label: 'Predict Budget', value: '/predict-budget', icon: <AutoGraphIcon /> },
  ];

  // Drawer content for mobile
  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      // Set the background color for the drawer content
      sx={{
        textAlign: 'center',
        backgroundColor: theme.palette.background.default, // Normal dark background
        color: theme.palette.text.primary, // Ensure text is white for dark background
        height: '100%',


      }}
    >
      <Box sx={{ my: 2 , display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <img src="/freepik__budget.png" alt="logo" height="35" style={{mr:4 , mb:4}} />
        <Typography variant="h6" sx={{ color: theme.palette.text.primary, mt: 0.6 , mr:-4 , ml:1 }}>BudgetAI</Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)'  , mt:-1}} />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.value} disablePadding>
            <ListItemButton
              selected={subPath === item.value}
              onClick={() => {
                navigate(`/dashboard${item.value}`);
                handleDrawerToggle(); // Close drawer on navigation
              }}
              sx={{
                color: theme.palette.text.primary, // White text
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255,255,255,0.2)', // Light highlight for selected
                },
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.primary }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {/* Logout button in drawer */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ color: theme.palette.text.primary }}>
            <ListItemIcon sx={{ color: theme.palette.text.primary }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <DemoProvider window={demoWindow}>
      <AppProvider
        router={router}
        theme={demoTheme}
        window={demoWindow}
      >
        <Navbar />
        {alert && (
          <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
            {alert}
          </Box>
        )}

        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          {/* Mobile Menu Icon / Close Icon */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label={mobileOpen ? "close drawer" : "open drawer"}
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
               top:8,
               left:20,
                position: 'absolute',
                zIndex: theme.zIndex.drawer + 1,
                background:'#000',
                // Apply the green gradient background
                // background: 'linear-gradient(to right, #24243e, #08a087, #24243e)',
                color: '#ffffff', // Ensure icon color is white for contrast
                borderRadius: '50%',
                p: 1,
                // Apply the pulsating glow animation
                animation: `${glowAnimation} 2s infinite alternate`,
                '&:hover': {
                  // Slightly darker gradient on hover
                  background: 'linear-gradient(to right, #13131c, #13131c, #13131c)',
                  // Stronger glow on hover
                  boxShadow: '0 0 20px #13131c), 0 0 30px #24243e',
                }
              }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />} {/* Conditional Icon */}
            </IconButton>
          )}

          {/* Desktop Sidebar (Tabs) */}
          {!isMobile && (
            <Tabs
              orientation="vertical"
              value={subPath}
              onChange={(e, value) => navigate(`/dashboard${value}`)}
              sx={{
                width: drawerWidth,
                pt: 4,
                backgroundColor: theme.palette.background.paper, // Use paper background for desktop tabs
                borderRight: 1,
                borderColor: 'divider',
                height: '100%',
                flexShrink: 0,
              }}
            >
              {navItems.map((item) => (
                <Tab
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                  iconPosition="start"
                />
              ))}
              <Tab
                label="Logout"
                value="/logout"
                icon={<LogoutIcon />}
                iconPosition="start"
                onClick={handleLogout}
              />
            </Tabs>
          )}

          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                // Override theme's MuiDrawer paper styles to use normal dark background
                backgroundColor: theme.palette.background.default,
                
                color: theme.palette.text.primary, // Ensure text color is white for dark background
                // Remove backgroundImage here, it's inherited from the theme if not overridden
                // backgroundImage: 'none', // or simply not specify it
              },
            }}
          >
            {drawer}
          </Drawer>

          {/* Main content area */}
          <Box
            sx={{
              flexGrow: 1,
              p: 3,
              overflowY: 'auto',
              ml: isMobile ? 6 : 0,
              mt: isMobile ? 6 : 0,
            }}
          >
            <Routes>
              <Route path="/" element={<BudgetDashboardContent />} />
              <Route path="budget" element={<Budget />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="reports" element={<Reports />} />
              <Route path="predict-budget" element={<PredictBudget />} />
              <Route path="/chat-bot" element={<Chatbot />} />
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