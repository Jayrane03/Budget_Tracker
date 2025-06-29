import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Ensure this path is correct

// Material-UI Imports
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box, // For flexible layout
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material'; // Example icon for user menu

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for the user menu (anchor element)
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    handleMenuClose(); // Close the menu
    navigate('/login'); // Redirect to login page after logout
  };

  // Get first letter of user's name or email for avatar
  const getAvatarInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '';
  };

  return (
   <AppBar
      position="static"
      
      sx={{
        background: 'linear-gradient(to right,#08a087, #00ffd5, #24243e)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
     
      <Toolbar>
        {/* Logo/Brand Name */}
         <img src="/freepik__budget.png" alt="" height="45px" width="45px"/>
        <Typography
          variant="h6"
          noWrap
          component={Link} // Use Link for navigation
          to="/"
          sx={{
            flexGrow: 1, // Takes up available space
            textDecoration: 'none',
            color: 'ThreeDDarkShadow', // Inherit color from AppBar
            fontWeight: 'bold',
            letterSpacing: 0.5,
            ml:1,
            mr: 2, // Margin right
          }}
        >
          BudgetAI
        </Typography>

        {/* Navigation Links (always visible for now) */}
     

        {/* Spacer to push auth buttons to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Conditional rendering for Auth/User */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Welcome message */}
            <Typography variant="body1" sx={{ color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
              Hi, {user?.name || user?.email}
            </Typography>
            {/* User Avatar with Menu */}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                {getAvatarInitials()}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={isMenuOpen}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" style={{letterSpacing:'1px'}} component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" style={{letterSpacing:'1px'}} component={Link} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;