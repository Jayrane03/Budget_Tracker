import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../services/helper'; // Your config file

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To indicate auth check is in progress

  // Function to load user from token
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set the token in Axios default headers for all subsequent requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        // Try to fetch user data from the backend to validate the token
        const res = await axios.get(`${config.BASE_URL}/api/auth/user`);
        setIsAuthenticated(true);
        // The backend `getUser` route should return the user object (e.g., { user: { id, name, email } })
        setUser(res.data.user); // Make sure your backend returns user as { user: {...} }
        console.log("User reloaded from token:", res.data.user);
      } catch (err) {
        console.error("Error loading user from token:", err.response?.data || err.message);
        // Token is invalid or expired, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    }
    setLoading(false); // Auth check is complete
  }, []);

  // Run on initial component mount to check for token
  useEffect(() => {
    loadUser();
  }, [loadUser]); // Dependency array includes loadUser to satisfy useCallback

  // Login function
  const login = async (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};