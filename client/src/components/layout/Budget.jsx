import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem, Grid, Paper,
  IconButton, Divider, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import config from "../../services/helper";
import { AuthContext } from '../AuthContext';

const categoryOptions = [
  'Food', 'Rent', 'Transportation', 'Utilities', 'Entertainment',
  'Savings', 'Healthcare', 'Shopping', 'Loans', 'Insurance', 'Education', 'Miscellaneous'
];

const Budget = () => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [month, setMonth] = useState(dayjs());
  const [totalBudget, setTotalBudget] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Rent');
  const [categoryLimit, setCategoryLimit] = useState('');
  const [existingBudgetId, setExistingBudgetId] = useState(null);
  const [categoryLimits, setCategoryLimits] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) fetchBudget();
  }, [isAuthenticated, month, authLoading]);

  const fetchBudget = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.BASE_URL}/api/budget?month=${month.format('YYYY-MM')}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTotalBudget(data.totalBudget?.toString() || '');
        setCategoryLimits(data.categoryLimits || []);
        setExistingBudgetId(data._id || null);
      }
    } catch (err) {
      console.error('❌ Error fetching budget:', err);
    }
  };

  const handleAddCategory = () => {
    if (selectedCategory && categoryLimit) {
      setCategoryLimits(prev =>
        [...prev.filter(item => item.category !== selectedCategory),
         { category: selectedCategory, amount: parseFloat(categoryLimit) }]
      );
      setCategoryLimit('');
      setSelectedCategory('');
    }
  };

  const handleDeleteCategory = (categoryToRemove) => {
    setCategoryLimits(prev => prev.filter(item => item.category !== categoryToRemove));
  };

  const handleSaveBudget = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        month: month.format('YYYY-MM'),
        totalBudget: parseFloat(totalBudget),
        categoryLimits,
      };
      const method = existingBudgetId ? 'PUT' : 'POST';
      const url = existingBudgetId
        ? `${config.BASE_URL}/api/budget/${existingBudgetId}`
        : `${config.BASE_URL}/api/budget`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log(`✅ Budget ${existingBudgetId ? 'updated' : 'saved'}:`, data);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (err) {
      console.error('❌ Error saving budget:', err);
    }
  };

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1000px',
      margin: 'auto',
      fontFamily: 'Segoe UI, sans-serif',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: '1.5rem',
      textAlign: 'center',
      color: '#00ffd5',
      textShadow: '0 0 6px rgba(56,189,248,0.5)',
    },
    paper: {
      padding: '1.5rem',
      borderRadius: '12px',
      marginBottom: '2rem',
      color: '#f1f5f9',
      boxShadow: '0 0 10px #00ffd5',
    },
    sectionTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#00ffd5',
      marginBottom: '1rem',
    },
    addButton: {
      backgroundColor: '#00ffd5',
      color: '#000',
      fontWeight: 'bold',
      borderRadius: '8px',
      padding: '0.6rem',
    },
    saveButton: {
      backgroundColor: '#00ffd5',
      color: 'black',
      fontWeight: 'bold',
      padding: '0.8rem 1.5rem',
      fontSize: '1rem',
      borderRadius: '8px',
      display: 'block',
      margin: '50px auto',
    },
    table_cell: {
      fontSize: '16px',
    },
  };

  return (
    <Box sx={styles.container}>
      {showAlert && (
        <Alert severity="success" variant="filled" sx={{ width: '80%', margin: 'auto', mb: 2 }}>
          ✅ Budget {existingBudgetId ? 'updated' : 'saved'} successfully!
        </Alert>
      )}

      <Typography style={styles.title}>📅 Set Monthly Budget</Typography>

      <Paper sx={styles.paper}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Select Month"
              views={['year', 'month']}
              value={month}
              onChange={(newValue) => setMonth(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Total Monthly Budget (₹)"
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              fullWidth
              placeholder="Enter total budget"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={styles.paper}>
        <Typography style={styles.sectionTitle}>➕ Add Category Limits</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              fullWidth
            >
              {categoryOptions.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Amount (₹)"
              type="number"
              value={categoryLimit}
              onChange={(e) => setCategoryLimit(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth sx={styles.addButton} onClick={handleAddCategory}>
              Add Category
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {categoryLimits.length > 0 && (
        <Paper sx={styles.paper}>
          <Typography style={styles.sectionTitle}>📊 Category Limits</Typography>
          <Divider sx={{ mb: 1 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#f1f5f9', fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ color: '#f1f5f9', fontWeight: 'bold' }}>Amount (₹)</TableCell>
                  <TableCell sx={{ color: '#f1f5f9', fontWeight: 'bold' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoryLimits.map((item) => (
                  <TableRow key={item.category}>
                    <TableCell sx={styles.table_cell}>{item.category}</TableCell>
                    <TableCell sx={styles.table_cell}>₹{item.amount.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => handleDeleteCategory(item.category)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Button
        variant="contained"
        sx={styles.saveButton}
        onClick={handleSaveBudget}
        disabled={!totalBudget}
      >
        💾 Save Budget
      </Button>
    </Box>
  );
};

export default Budget;
