import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import config from '../../services/helper';
import EditTransactionModal from '../model/EditTransactionModal';
import { CSVLink } from 'react-csv';
import { AuthContext } from '../AuthContext';

import ClearAllIcon from '@mui/icons-material/ClearAll';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Box, Typography, Button, Select, MenuItem, FormControl, InputLabel,
  Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions
} from '@mui/material';

import { styled } from '@mui/system';

const AmountTableCell = styled(TableCell)(({ theme, type }) => ({
  color: type === 'expense' ? theme.palette.error.main : theme.palette.success.main,
  fontWeight: 'bold',
}));

const Transactions = () => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filters, setFilters] = useState({ type: 'all', category: 'all' });

  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    content: '',
    onConfirm: () => {},
  });

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchTransactions();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setTransactions([]);
    }
  }, [isAuthenticated, authLoading]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${config.BASE_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${config.BASE_URL}/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(transactions.filter((t) => t._id !== id));
      showAlert('Transaction deleted successfully.', 'success');
    } catch (err) {
      console.error('Error deleting transaction', err);
      showAlert('Failed to delete transaction.', 'error');
    }
  };

  const clearTransactions = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${config.BASE_URL}/api/transactions/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions([]);
      showAlert('All transactions cleared successfully.', 'success');
    } catch (err) {
      console.error('Error clearing transactions:', err);
      showAlert('Failed to clear transactions.', 'error');
    }
  };

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const filteredTransactions = transactions.filter((t) =>
    (filters.type === 'all' || t.type === filters.type) &&
    (filters.category === 'all' || t.category === filters.category)
  );

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
      <Typography variant="h4" gutterBottom align="center" sx={{ color: 'primary.main', mb: 4 }}>
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
          className="csv-btn"
        >
          <Button variant="contained" color="primary" sx={{ height: '100%' }}>
            Export CSV
          </Button>
        </CSVLink>

        <Button
          variant="contained"
          color="warning"
          sx={{ height: '100%', marginTop: '10px' }}
          onClick={() =>
            setConfirmDialog({
              open: true,
              title: 'Clear All Transactions?',
              content: 'This will permanently delete all your transactions.',
              onConfirm: () => {
                clearTransactions();
                setConfirmDialog({ ...confirmDialog, open: false });
              },
            })
          }
        >
          <ClearAllIcon /> Clear Transactions
        </Button>
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
          <Table sx={{ minWidth: 650 }}>
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
                <TableRow key={t._id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{formatDate(t.date)}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <AmountTableCell type={t.type} align="right">
                    {t.type === 'expense' ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
                  </AmountTableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="secondary"
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
                      onClick={() =>
                        setConfirmDialog({
                          open: true,
                          title: 'Delete Transaction?',
                          content: 'Are you sure you want to delete this transaction?',
                          onConfirm: () => {
                            deleteTransaction(t._id);
                            setConfirmDialog({ ...confirmDialog, open: false });
                          },
                        })
                      }
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
          onSave={fetchTransactions}
        />
      )}

      {/* Snackbar Alert */}
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} variant="filled">
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Cancel
          </Button>
          <Button color="error" onClick={confirmDialog.onConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions;
