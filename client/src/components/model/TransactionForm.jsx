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
  CircularProgress // For loading indicator on auto-categorize
} from '@mui/material';
import config from '../../services/helper'; // Assuming this path is correct

const TransactionForm = ({ addTransaction, handleClose }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0] // Sets default to today's date
  });

  const [loading, setLoading] = useState(false); // For auto-categorize button
  const [submitError, setSubmitError] = useState(''); // For form submission errors

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
    setSubmitError(''); // Clear previous errors

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

    // Call the addTransaction prop (which will make the API call and close the modal)
    addTransaction(newTransaction);

    // Reset form data after submission
    setFormData({
      description: '',
      amount: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });

    // We don't call handleClose here directly, as addTransaction in the parent
    // component (BudgetDashboardContent) is responsible for closing the modal after the API call.
  };

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2, // Spacing between form elements
        p: 2, // Padding inside the form if it's not already handled by parent Box
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
        sx={{ mb: 1 }} // Margin bottom for spacing
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

      <TextField
        label="Category"
        name="category"
        value={category}
        onChange={onChange}
        placeholder="e.g., Food, Transport, Salary"
        fullWidth
        required
        variant="outlined"
      />

      <TextField
        label="Date"
        name="date"
        type="date"
        value={date}
        onChange={onChange}
        fullWidth
        
        required
        variant="outlined"
        InputLabelProps={{ shrink: true }} // Ensures label is always "shrunk" for date input
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