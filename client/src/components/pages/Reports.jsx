import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import config  from '../../services/helper';
import '../../Styles/pages.css'; // Ensure you have the styles for the reports page
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [anomalies, setAnomalies] = useState([]);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${config.BASE_URL}/api/transactions`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        setTransactions(res.data);
        
        if (res.data.length > 0) {
          // Call Python AI for analysis
          const analysis = await axios.post(`${config.BASE_URL}/api/analyze`, {
            transactions: res.data
          });
          
          setAnomalies(analysis.data.anomalies || []);
          prepareChartData(res.data, analysis.data);
        }
      } catch (err) {
        console.error('Error fetching data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);
  
  const prepareChartData = (transactions) => {
    // Get all months in data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Prepare data for monthly spending by category
    const categories = [...new Set(transactions.map(t => t.category))];
    
    // Group spending by month and category
    const monthlyData = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = date.getMonth();
      const monthName = months[month];
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = {};
        categories.forEach(cat => {
          monthlyData[monthName][cat] = 0;
        });
      }
      
      if (transaction.type === 'expense') {
        monthlyData[monthName][transaction.category] += Math.abs(transaction.amount);
      }
    });
    
    // Create chart data
    const monthLabels = Object.keys(monthlyData).sort(
      (a, b) => months.indexOf(a) - months.indexOf(b)
    );
    
    const datasets = categories.map((category, index) => {
      const backgroundColors = [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)'
      ];
      
      return {
        label: category,
        data: monthLabels.map(month => monthlyData[month][category] || 0),
        backgroundColor: backgroundColors[index % backgroundColors.length]
      };
    });
    
    setChartData({
      labels: monthLabels,
      datasets
    });
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Expenses by Category',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };
  
  return (
    <div className="reports">
      <h1>Financial Reports</h1>
      
      {loading ? (
        <p>Loading reports...</p>
      ) : transactions.length < 5 ? (
        <p>Add at least 5 transactions to generate reports</p>
      ) : (
        <div className="reports-content">
          <div className="chart-section">
            <h2>Monthly Spending Analysis</h2>
            <div className="chart-container">
              <Bar options={chartOptions} data={chartData} />
            </div>
          </div>
          
          <div className="anomalies-section">
            <h2>Unusual Spending</h2>
            {anomalies.length > 0 ? (
              <table className="anomalies-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((anomaly, index) => (
                    <tr key={index}>
                      <td>{formatDate(anomaly.date)}</td>
                      <td>{anomaly.description}</td>
                      <td>{anomaly.category}</td>
                      <td className="expense-text">${Math.abs(anomaly.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No unusual spending detected</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;