import axios from 'axios';
import { useState, useEffect } from 'react';

const PredictBudget = () => {
  const [income, setIncome] = useState(5000);
  const [budgetData, setBudgetData] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      setUserId(user.id);
    } else {
      setError('User not logged in');
    }
  }, []);

  const handlePredict = async () => {
    if (!userId) {
      setError('User ID not available.');
      return;
    }

    try {
      setError(null);

      const transRes = await axios.get(`http://localhost:5000/api/transactions/${userId}`);
      const transactions = transRes.data.transactions;

      const res = await axios.post('http://localhost:5001/api/predict-budget', {
        income: Number(income),
        transactions,
      });

      setBudgetData(res.data);
    } catch (err) {
      console.error('Error predicting budget:', err);
      setError('Failed to fetch budget prediction. Please try again.');
      setBudgetData(null);
    }
  };

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1000px',
      margin: '0 auto',
      background: '#0f172a',
      borderRadius: '16px',
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.15)',
      fontFamily: '"Segoe UI", sans-serif',
      color: '#f9fafb',
    },
    heading: {
      fontSize: '2.4rem',
      fontWeight: 'bold',
      marginBottom: '2rem',
      textAlign: 'center',
      color: '#38bdf8',
      textShadow: '0 0 10px rgba(56,189,248,0.5)',
    },
    contentRow: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: '2rem',
      flexWrap: 'wrap',
    },
    image: {
      flex: '1',
      maxWidth: '400px',
      borderRadius: '12px',
      border: '2px solid #334155',
      boxShadow: '0 0 12px rgba(0, 255, 255, 0.1)',
    },
    results: {
      flex: '1',
      backgroundColor: '#1e293b',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    },
    recommendationHeading: {
      fontSize: '1.3rem',
      color: '#7dd3fc',
      marginBottom: '1rem',
    },
    recommendationList: {
      listStyleType: 'disc',
      paddingLeft: '1.5rem',
    },
    message: {
      marginTop: '1rem',
      fontStyle: 'italic',
      color: '#94a3b8',
    },
    inputRow: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '2rem',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    input: {
      padding: '0.6rem 1rem',
      border: '1px solid #475569',
      borderRadius: '8px',
      backgroundColor: '#1e293b',
      color: '#f9fafb',
      fontSize: '1rem',
      minWidth: '200px',
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '0.6rem 1.2rem',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    buttonHover: {
      backgroundColor: '#2563eb',
    },
    error: {
      color: '#f87171',
      textAlign: 'center',
      marginTop: '1rem',
    },
    recommendationListItem: {
      marginBottom: '0.8rem',   
      padding: '0.5rem',
      borderRadius: '8px',
      backgroundColor: '#334155',
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🔮 AI Budget Prediction</h2>

      <div style={styles.contentRow}>
        <img
          src="/budget_ai.jpg"
          alt="AI Budget"
          style={styles.image}
        />

        {budgetData?.budget_recommendations ? (
          <div style={styles.results}>
            <h3 style={styles.recommendationHeading}>📊 Budget Recommendations</h3>
            <ul style={styles.recommendationList}>
              {Object.entries(budgetData.budget_recommendations).map(([category, amount]) => (
                <li key={category} style={styles.recommendationListItem}>
                  <strong>{category}</strong>: ${amount.toFixed(2)}
                </li>
              ))}
            </ul>
            <p style={styles.message}>{budgetData.message}</p>
          </div>
        ) : (
          <div style={{ ...styles.results, textAlign: 'center', color: '#64748b' }}>
            <p>🧠 Predictions will appear here after you click "Predict Budget"</p>
          </div>
        )}
      </div>

      <div style={styles.inputRow}>
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="Enter monthly income"
          style={styles.input}
        />
        <button onClick={handlePredict} style={styles.button}>
          Predict Budget
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

export default PredictBudget;
