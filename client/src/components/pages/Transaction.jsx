// File: components/Transactions.jsx (No changes needed if ThemeProvider is correct)
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import config from '../../services/helper';
import EditTransactionModal from '../model/EditTransactionModal';
import { CSVLink } from 'react-csv';
import { AuthContext } from '../AuthContext';

// Material-UI Imports
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Box, Typography, Button, Select, MenuItem, FormControl, InputLabel,
  useTheme, // This hook correctly accesses the theme
} from '@mui/material';

import { styled } from '@mui/system'; // Correct import for styled

// Styled TableCell for income/expense colors
// This is the line that caused the error if theme is undefined
const AmountTableCell = styled(TableCell)(({ theme, type }) => ({
  color: type === 'expense' ? theme.palette.error.main : theme.palette.success.main,
  fontWeight: 'bold',
}));

const Transactions = () => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext); // Use AuthContext
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filters, setFilters] = useState({ type: 'all', category: 'all' });
  const theme = useTheme(); // Access the current theme

  // Use a specific useEffect for fetching based on authentication status
  useEffect(() => {
    // Only fetch if authenticated and authLoading is false
    if (!authLoading && isAuthenticated) {
      fetchTransactions();
    } else if (!authLoading && !isAuthenticated) {
      // If not authenticated, stop loading and clear transactions
      setLoading(false);
      setTransactions([]);
    }
  }, [isAuthenticated, authLoading]); // Depend on authentication state

  const fetchTransactions = async () => {
    setLoading(true); // Set loading true when starting fetch
    try {
      const token = localStorage.getItem('token'); // Token is likely already set by AuthContext Axios defaults
      const res = await axios.get(`${config.BASE_URL}/api/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`, // Still good to explicitly pass for this specific fetch, though Axios defaults might cover it.
        },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions', err.response?.data || err.message);
      // Handle unauthorized specifically, e.g., force logout if token expired
      if (err.response && err.response.status === 401) {
        // You might want to trigger logout here if the token is truly invalid
        // logout(); // Uncomment if you want to force logout on API 401
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${config.BASE_URL}/api/transactions/${id}`, { // Use config.BASE_URL
        headers: { Authorization: `Bearer ${token}` }, // Use Authorization header
      });
      // Filter out the deleted transaction
      setTransactions(transactions.filter((t) => t._id !== id));
      // Optionally re-fetch to ensure data consistency
      // fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction', err.response?.data || err.message);
      alert('Failed to delete transaction. Please try again.'); // User feedback
    }
  };

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const filteredTransactions = transactions.filter((t) => {
    return (
      (filters.type === 'all' || t.type === filters.type) &&
      (filters.category === 'all' || t.category === filters.category)
    );
  });

  // Extract unique categories for filter dropdown
  const categories = [...new Set(transactions.map((t) => t.category))].sort();

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Loading user data...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h5" color="error">Please log in to view transactions.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '20px auto', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ color: 'primary.main', mb: 4 }}>
        Transaction History
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <FormControl variant="outlined" sx={{ minWidth: 180 }}>
          <InputLabel>Type</InputLabel>
          <Select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            label="Type"
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" sx={{ minWidth: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            label="Category"
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <CSVLink
          data={filteredTransactions}
          filename="transactions.csv"
          className="csv-btn" // Keep your custom CSS class if you want specific CSV button styling
        >
          <Button variant="contained" color="primary" sx={{ height: '100%' }}>
            Export CSV
          </Button>
        </CSVLink>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Loading transactions...</Typography>
        </Box>
      ) : filteredTransactions.length === 0 ? (
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 4 }}>
          No transactions found for the selected filters.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={5}>
          <Table sx={{ minWidth: 650 }} aria-label="transactions table">
            <TableHead sx={{ bgcolor: 'primary.dark' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((t) => (
                <TableRow
                  key={t._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell component="th" scope="row">{formatDate(t.date)}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <AmountTableCell type={t.type} align="right">
                    {t.type === 'expense' ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
                  </AmountTableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => setSelectedTransaction(t)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => deleteTransaction(t._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedTransaction && (
        <EditTransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onSave={fetchTransactions} // Pass fetchTransactions to refresh data after edit
        />
      )}
    </Box>
  );
};

export default Transactions;