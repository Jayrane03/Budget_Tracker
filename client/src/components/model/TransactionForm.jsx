import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress
} from '@mui/material';
import config from '../../services/helper';

const categoryOptions = [
  'Food', 'Rent', 'Transportation', 'Utilities', 'Entertainment',
  'Savings', 'Healthcare', 'Shopping', 'Loans', 'Insurance', 'Education', 'Miscellaneous'
];

const TransactionForm = ({ addTransaction, handleClose }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { description, amount, category, type, date } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategorize = async () => {
    if (!description) {
      alert('Please enter a description to auto-categorize.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${config.BASE_URL}/api/categorize`, { description });
      setFormData({ ...formData, category: res.data.category });
    } catch (err) {
      console.error('Error categorizing transaction', err);
      alert('Failed to auto-categorize. Please enter manually.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!description || !amount || !category) {
      setSubmitError('Please fill all required fields.');
      return;
    }

    const newTransaction = {
      description,
      amount: type === 'expense' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)),
      category,
      type,
      date
    };

    addTransaction(newTransaction);

    setFormData({
      description: '',
      amount: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2
      }}
    >
      <TextField
        label="Description"
        name="description"
        value={description}
        onChange={onChange}
        placeholder="e.g., Coffee, Salary, Groceries"
        fullWidth
        required
        variant="outlined"
      />

      <Button
        variant="outlined"
        onClick={handleCategorize}
        disabled={loading || !description}
        startIcon={loading ? <CircularProgress size={20} /> : null}
        sx={{ mb: 1 }}
      >
        {loading ? 'Categorizing...' : 'Auto-categorize'}
      </Button>

      <TextField
        label="Amount"
        name="amount"
        type="number"
        value={amount}
        onChange={onChange}
        placeholder="e.g., 50.00"
        fullWidth
        required
        step="0.01"
        variant="outlined"
      />

      {/* Type (Expense/Income) */}
      <FormControl fullWidth required variant="outlined">
        <InputLabel id="type-select-label">Type</InputLabel>
        <Select
          labelId="type-select-label"
          name="type"
          value={type}
          onChange={onChange}
          label="Type"
        >
          <MenuItem value="expense">Expense</MenuItem>
          <MenuItem value="income">Income</MenuItem>
        </Select>
      </FormControl>

      {/* Category dropdown */}
      <FormControl fullWidth required variant="outlined">
        <InputLabel id="category-select-label">Category</InputLabel>
        <Select
          labelId="category-select-label"
          name="category"
          value={category}
          onChange={onChange}
          label="Category"
        >
          {categoryOptions.map((cat, index) => (
            <MenuItem key={index} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Date"
        name="date"
        type="date"
        value={date}
        onChange={onChange}
        fullWidth
        required
        variant="outlined"
        InputLabelProps={{ shrink: true }}
      />

      {submitError && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {submitError}
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Add Transaction
        </Button>
      </Box>
    </Box>
  );
};

export default TransactionForm;
