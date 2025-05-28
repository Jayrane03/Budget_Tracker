import { useState, useEffect } from 'react';
import axios from 'axios';
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
import TransactionForm from '../TransactionForm';
import config from '../../services/helper';
import '../../Styles/Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const chartTypes = { Doughnut, Pie, Bar };

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [selectedChart, setSelectedChart] = useState('Doughnut');

  const ChartComponent = chartTypes[selectedChart];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${config.BASE_URL}/api/transactions`, {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        });
        setTransactions(res.data);

        // Analyze only after fetch
        if (res.data.length > 0) {
          analyzeTransactions(res.data);
        }
      } catch (err) {
        console.error('Error fetching transactions', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []); // Only on mount

  const analyzeTransactions = async (transactionsData) => {
    try {
     const res = await axios.post(
  `${config.BASE_URL}/api/analyze`,
  { transactions: transactionsData },
  {
    headers: { 'Content-Type': 'application/json' },
  }
);

    console.log('Response from /api/analyze:', res.data);
setInsights(res.data.insights || []);

      console.log('AI Insights:', res.data.insights);
    } catch (err) {
      console.error('Error analyzing transactions', err);
    }
  };

  const addTransaction = async (transaction) => {
    try {
      const res = await axios.post(`${config.BASE_URL}/api/transactions`, transaction, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });

      const newTransactions = [...transactions, res.data];
      setTransactions(newTransactions);
      analyzeTransactions(newTransactions);
    } catch (err) {
      console.error('Error adding transaction', err);
    }
  };

  // Expense chart data
  const categoryTotals = {};
  transactions.forEach((t) => {
    if (t.type === 'expense') {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    }
  });

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Expenses',
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderWidth: 1,
      },
    ],
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="dashboard-content">
          <div className="summary-cards">
            <div className="card income">
              <h3>Income</h3>
              <h2>${totalIncome.toFixed(2)}</h2>
            </div>
            <div className="card expense">
              <h3 >Expenses</h3>
              <h2>${totalExpense.toFixed(2)}</h2>
            </div>
            <div className="card balance">
              <h3>Balance</h3>
              <h2>${(totalIncome - totalExpense).toFixed(2)}</h2>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="chart-container">
              <div className="chart-header">
                <h2>Expense Breakdown</h2>
                <select
                  value={selectedChart}
                  onChange={(e) => setSelectedChart(e.target.value)}
                  className="chart-select"
                >
                  <option value="Doughnut">Doughnut</option>
                  <option value="Pie">Pie</option>
                  <option value="Bar">Bar</option>
                </select>
              </div>

              {chartData.labels.length > 0 ? (
                <ChartComponent
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        labels: {
                          color: '#c9d1d9',
                        },
                      },
                    },
                  }}
                />
              ) : (
                <p>No expense data to display</p>
              )}
            </div>

            <div className="insights-container">
              <h2>AI Insights</h2>
              <ul className="insights-list">
  {insights.map((insight, index) => (
    <li key={index}>
      🚨 {insight.description} (${insight.amount}) - {insight.category}
    </li>
  ))}
</ul>

            </div>
          </div>

          <TransactionForm addTransaction={addTransaction} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
