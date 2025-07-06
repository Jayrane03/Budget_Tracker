// Updated and Optimized: BudgetDashboardContent.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../services/helper';
import TransactionForm from '../TransactionForm';
import dayjs from 'dayjs';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Button,
  Modal,
  Select,
  MenuItem,
  Divider,
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
import "../../Styles/Dashboard.css";
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const chartTypes = { Doughnut, Pie, Bar };

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
import "../../Styles/Dashboard.css";
import { styled } from '@mui/system';

export default function BudgetDashboardContent() {
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('Doughnut');
  const [openModal, setOpenModal] = useState(false);

  const expenseImg = 'https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-Expenses-smooth-conceptual-smashingstocks-glyph-smashing-stocks.png';
  const incomeImg = 'https://img.icons8.com/ios-filled/100/receive-change.png';
  const balanceImg = 'https://img.icons8.com/ios-filled/100/merchant-account.png';
  const budgetImg = 'https://img.icons8.com/ios-filled/100/accounting.png';

  const ChartComponent = chartTypes[selectedChart];

  const AmountTableCell = styled(TableCell)(({ theme, type }) => ({
    color: type === 'expense' ? theme.palette.error.main : theme.palette.success.main,
    fontWeight: 'bold',
  }));


  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${config.BASE_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data || []);
    } catch (err) {
      console.error('Error fetching transactions', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const currentMonth = dayjs().format('YYYY-MM');
      const res = await axios.get(`${config.BASE_URL}/api/budget?month=${currentMonth}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudget(res.data || null);
    } catch (error) {
      console.error('Error fetching budget:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchBudget();
  }, []);

  const addTransaction = async (tx) => {
    try {
      await axios.post(`${config.BASE_URL}/api/transactions`, tx, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      await fetchTransactions();
      setOpenModal(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const expenseCategories = {};
  const incomeCategories = {};
  transactions.forEach((t) => {
    const amount = Math.abs(t.amount);
    if (t.type === 'expense') {
      expenseCategories[t.category] = (expenseCategories[t.category] || 0) + amount;
    } else if (t.type === 'income') {
      incomeCategories[t.category] = (incomeCategories[t.category] || 0) + amount;
    }
  });

  const totalIncome = Object.values(incomeCategories).reduce((a, b) => a + b, 0);
  const totalExpense = Object.values(expenseCategories).reduce((a, b) => a + b, 0);

  const expenseChartData = {
    labels: Object.keys(expenseCategories),
    datasets: [{
      label: 'Expenses',
      data: Object.values(expenseCategories),
      backgroundColor: ['#FF6384','#36A2EB','#66bb6a','#FFCE56','#4BC0C0','#9966FF','#FF9F40'],
      borderWidth: 1,
    }],
  };

  const incomeChartData = {
    labels: Object.keys(incomeCategories),
    datasets: [{
      label: 'Income',
      data: Object.values(incomeCategories),
      backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40','#1b5e20'],
      borderWidth: 1,
    }],
  };

  const budgetChartData = budget ? {
    labels: budget.categoryLimits.map(item => item.category),
    datasets: [{
      label: 'Budget Allocation',
      data: budget.categoryLimits.map(item => item.amount),
      backgroundColor: ['#00BFA6', '#FFD54F', '#FF6E40', '#64B5F6', '#9575CD', '#4DD0E1', '#FF7043'],
      borderWidth: 1,
    }],
  } : null;

  return (
  <Box sx={{ p: 4 , overflow:"scroll"}}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography className='dash-tit' variant="h4" fontWeight="bold">Dashboard</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
          + Add Transaction
        </Button>
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
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>

          {[ [incomeImg, 'Income', totalIncome, '#4caf50'], [expenseImg, 'Expenses', totalExpense, '#f44336'], [balanceImg, 'Balance', totalIncome - totalExpense, '#2196f3'], [budgetImg, 'Budget', budget?.totalBudget || 0, '#ff9800'] ].map(([img, label, value, color], i) => (
            <Paper key={i} sx={{ p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.05)',height:"17vh", width:"96%", margin:'0 2px', backdropFilter: 'blur(6px)', color: '#fff', transition: '0.3s', '&:hover': { transform: 'scale(1.03)', boxShadow: `0 4px 20px ${color}`  } }}>
              <Box display="flex" alignItems="center" gap={2} >
                <img src={img} alt={label} style={{height:"80px" , width:"80px", borderRadius:"20px", background:"#fff", padding:"10px"}} />
                <Box >
                  <Typography variant="subtitle1" fontWeight={600}>{label}</Typography>
                  <Typography variant="h4" sx={{ color }}>₹{value.toFixed(2)}</Typography>
                </Box>
              </Box>
            </Paper>
          ))}

          {[ ['Expense Breakdown', expenseChartData], ['Income Breakdown', incomeChartData] ].map(([label, data]) => (
            <Paper key={label} sx={{ p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(6px)', color: '#fff' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={600}>{label}</Typography>
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
                {data.labels.length ? <ChartComponent key={`${label}-${selectedChart}`} data={data} /> : <Typography>No data</Typography>}
              </Box>
            </Paper>
          ))}

          {budgetChartData && (
            <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(6px)', color: '#fff' }}>
              <Typography variant="h6" fontWeight={600}>📊 Budget Allocation Overview</Typography>
              <Divider sx={{ my: 2 }} />
              <ChartComponent data={budgetChartData} />
            </Paper>
          )}

          <Paper sx={{ gridColumn: '1 / -1', p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(6px)', color: '#fff' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Recent Transactions</Typography>
            {transactions.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell>{dayjs(tx.date).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <AmountTableCell type={tx.type} align="right">
                        {tx.type === 'expense' ? '-' : '+'}₹{Math.abs(tx.amount).toFixed(2)}
                      </AmountTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography>No recent transactions</Typography>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}