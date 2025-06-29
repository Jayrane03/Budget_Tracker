import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Button,
  Modal,
} from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { Doughnut, Pie, Bar } from 'react-chartjs-2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import config from '../../services/helper';
import TransactionForm from '../TransactionForm';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const chartTypes = { Doughnut, Pie, Bar };
const today = dayjs();

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

export default function BudgetDashboardContent() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('Doughnut');
  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const ChartComponent = chartTypes[selectedChart];

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${config.BASE_URL}/api/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched response:', res.data);
      const fetched = res.data || [];
      setTransactions(fetched);
    } catch (err) {
      console.error('Error fetching transactions', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const addTransaction = async (tx) => {
    try {
      await axios.post(`${config.BASE_URL}/api/transactions`, tx, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      await fetchTransactions();
      setOpenModal(false);
    } catch (error) {
      console.error('Error adding or fetching transactions:', error);
    }
  };

  const expenseCategories = {};
  const incomeCategories = {};
  transactions.forEach(t => {
    if (t.type === 'expense') {
      expenseCategories[t.category] = (expenseCategories[t.category] || 0) + Math.abs(t.amount);
    } else if (t.type === 'income') {
      incomeCategories[t.category] = (incomeCategories[t.category] || 0) + t.amount;
    }
  });

  const totalIncome = Object.values(incomeCategories).reduce((a, b) => a + b, 0);
  const totalExpense = Object.values(expenseCategories).reduce((a, b) => a + b, 0);

  const expenseChartData = {
    labels: Object.keys(expenseCategories),
    datasets: [{
      label: 'Expenses',
      data: Object.values(expenseCategories),
      backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40'],
      borderWidth: 1,
    }],
  };

  const incomeChartData = {
    labels: Object.keys(incomeCategories),
    datasets: [{
      label: 'Income',
      data: Object.values(incomeCategories),
      backgroundColor: ['#4caf50','#81c784','#66bb6a','#388e3c','#2e7d32','#1b5e20'],
      borderWidth: 1,
    }],
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Dashboard</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>+ Add Transaction</Button>
      </Box>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>Add New Transaction</Typography>
          <TransactionForm addTransaction={addTransaction} handleClose={() => setOpenModal(false)} />
        </Box>
      </Modal>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Box className="dashboard-grid" sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 3,
        }}>

          {[['Income', totalIncome, '#4caf50'], ['Expenses', totalExpense, '#f44336'], ['Balance', totalIncome - totalExpense, '#2196f3']].map(([label, value, color], i) => (
            <Paper
              key={i}
              sx={{ p: 3, borderRadius: 4, gridColumn: 'span 2', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(6px)', color: '#fff', '&:hover': { transform: 'scale(1.05)', boxShadow: `0 4px 20px ${color}` } }}
            >
              <Typography variant="subtitle1" fontWeight={600}>{label}</Typography>
              <Typography variant="h4" sx={{ color }}>{`₹${value.toFixed(2)}`}</Typography>
            </Paper>
          ))}

          <Paper sx={{ gridColumn: 'span 3', p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(6px)', color: '#fff' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>Expense Breakdown</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Chart</InputLabel>
                <Select value={selectedChart} onChange={e => setSelectedChart(e.target.value)} label="Chart">
                  <MenuItem value="Doughnut">Doughnut</MenuItem>
                  <MenuItem value="Pie">Pie</MenuItem>
                  <MenuItem value="Bar">Bar</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box mt={2}>
              {expenseChartData.labels.length ? <ChartComponent key={`expense-${selectedChart}`} data={expenseChartData} /> : <Typography>No data</Typography>}
            </Box>
          </Paper>

          <Paper sx={{ gridColumn: 'span 3', p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(6px)', color: '#fff' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>Income Breakdown</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Chart</InputLabel>
                <Select value={selectedChart} onChange={e => setSelectedChart(e.target.value)} label="Chart">
                  <MenuItem value="Doughnut">Doughnut</MenuItem>
                  <MenuItem value="Pie">Pie</MenuItem>
                  <MenuItem value="Bar">Bar</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box mt={2}>
              {incomeChartData.labels.length ? <ChartComponent key={`income-${selectedChart}`} data={incomeChartData} /> : <Typography>No data</Typography>}
            </Box>
          </Paper>

          <Paper sx={{ gridColumn: '1 / -1', p: 2, borderRadius: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar value={selectedDate} onChange={setSelectedDate} disableFuture />
            </LocalizationProvider>
          </Paper>
        </Box>
      )}
    </Box>
  );
}