import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import config from '../../services/helper'; // Adjust as needed

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [username, setUsername] = useState('');

  // ✅ Fetch user on mount if authenticated
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.get(`${config.BASE_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsername(res.data.name || res.data.username || 'User');
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleOpenNavMenu = (e) => setAnchorElNav(e.currentTarget);
  const handleOpenUserMenu = (e) => setAnchorElUser(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const authLinks = [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Transactions', path: '/transactions' },
    { text: 'Reports', path: '/reports' },
    { text: 'Budget Prediction', path: '/predict-budget' },
  ];

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/freepik__budget.png"
              alt="Logo"
              style={{
                width: 50,
                height: 50,
                padding: '5px',
                backgroundColor: 'black',
                borderRadius: '10px',
                marginRight: '8px',
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                backgroundColor: 'black',
                padding: '5px',
                borderRadius: '10px',
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              BudgetAI
            </Typography>
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" color="inherit" onClick={handleOpenNavMenu}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              {isAuthenticated &&
                authLinks.map((link) => (
                  <MenuItem key={link.text} onClick={handleCloseNavMenu}>
                    <Typography
                      textAlign="center"
                      component={Link}
                      to={link.path}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {link.text}
                    </Typography>
                  </MenuItem>
                ))}
              {!isAuthenticated && (
                <>
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Link to="/login">Login</Link>
                  </MenuItem>
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Link to="/register">Register</Link>
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>

          {/* Desktop Links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {isAuthenticated &&
              authLinks.map((link) => (
                <Button
                  key={link.text}
                  component={Link}
                  to={link.path}
                  sx={{ my: 2, color: 'white' }}
                >
                  {link.text}
                </Button>
              ))}
            {!isAuthenticated && (
              <>
                <Button component={Link} to="/login" sx={{ color: 'white' }}>
                  Login
                </Button>
                <Button component={Link} to="/register" sx={{ color: 'white' }}>
                  Register
                </Button>
              </>
            )}
          </Box>

          {/* Avatar + User Menu */}
          {isAuthenticated && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
