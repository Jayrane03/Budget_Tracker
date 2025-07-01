import { useState , useEffect} from 'react';
import React, { useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import config from "../../services/helper"; // Adjust the path as necessary 
const categoryOptions = [
  'Food',
  'Rent',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Savings',
  'Healthcare',
  'Shopping',
];
import {AuthContext} from '../AuthContext'; // Adjust the path as necessary
const Budget = () => {
    const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [month, setMonth] = useState(dayjs());
   const fetchBudget = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${config.BASE_URL}/api/budget?month=${month.format('YYYY-MM')}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data) {
          setTotalBudget(data.totalBudget.toString());
          setCategoryLimits(data.categoryLimits || []);
          setExistingBudgetId(data._id); // Save ID for update
        }
      }
    } catch (err) {
      console.error('❌ Error fetching budget:', err);
    }
  };
  useEffect(() => {
      if (!authLoading && isAuthenticated) {
        fetchBudget();
      } else if (!authLoading && !isAuthenticated) {
      
        // setTransactions([]);
      }
    }, [isAuthenticated, month, authLoading]); // Fetch budget when month changes or auth state changes
  const [totalBudget, setTotalBudget] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Rent');
  const [categoryLimit, setCategoryLimit] = useState('');
  const [existingBudgetId, setExistingBudgetId] = useState(null); // For edit mode

  const [categoryLimits, setCategoryLimits] = useState([]);
// useEffect(() => {
 

//   fetchBudget();
// }, [month]); // Fetch when month change
  const handleAddCategory = () => {
    if (selectedCategory && categoryLimit) {
      setCategoryLimits(prev => [
        ...prev.filter(item => item.category !== selectedCategory),
        { category: selectedCategory, amount: parseFloat(categoryLimit) },
      ]);
      setCategoryLimit('');
      setSelectedCategory('');
    }
  };

  const handleDeleteCategory = (categoryToRemove) => {
    setCategoryLimits(prev => prev.filter(item => item.category !== categoryToRemove));
  };

const handleSaveBudget = async () => {
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

  try {
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
      // background: 'linear-gradient(95deg,#24243e, #00ffd5, #4141c2)',
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
      transition: 'all 0.2s ease-in-out',
    },
    saveButton: {
      backgroundColor: '#00ffd5',
      color: 'black',
      fontWeight: 'bold',
      padding: '0.8rem 1.5rem',
      fontSize: '1rem',
      borderRadius: '8px',
      display: 'block',
      margin: 'auto',
      marginTop: '1rem',
    },
    categoryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 0',
      borderBottom: '1px solid #00ffd5',
    },
    table_cell: {
      fontSize:"20px"   
    }
  };

  return (
    <Box sx={styles.container}>
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
              InputProps={{ style: { color: '#f9fafb' } }}
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
              InputProps={{ style: { color: '#f9fafb' } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              sx={styles.addButton}
              onClick={handleAddCategory}
            >
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
              <TableCell   sx={styles.table_cell}>{item.category}</TableCell>
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
