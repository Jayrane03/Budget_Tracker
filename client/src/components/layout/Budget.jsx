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
import "../../Styles/Budget.css";

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

  return (
    <Box className="budget-container">
      {showAlert && (
        <Alert severity="success" variant="filled" sx={{ width: '80%', margin: 'auto', mb: 2 }}>
          ✅ Budget {existingBudgetId ? 'updated' : 'saved'} successfully!
        </Alert>
      )}

      <Typography className="budget-title">📅 Set Monthly Budget</Typography>

      <Paper className="budget-paper">
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

      <Paper className="budget-paper">
        <Typography className="budget-section-title">➕ Add Category Limits</Typography>
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
            <Button fullWidth className="budget-add-button" onClick={handleAddCategory}>
              Add Category
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {categoryLimits.length > 0 && (
        <Paper className="budget-paper">
          <Typography className="budget-section-title">📊 Category Limits</Typography>
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
                    <TableCell className="budget-table-cell">{item.category}</TableCell>
                    <TableCell className="budget-table-cell">₹{item.amount.toFixed(2)}</TableCell>
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
        className="budget-save-button"
        onClick={handleSaveBudget}
        disabled={!totalBudget}
      >
        💾 Save Budget
      </Button>
    </Box>
  );
};

export default Budget;
