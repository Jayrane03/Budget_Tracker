// File: components/Transactions.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../../services/helper';
import EditTransactionModal from '../model/EditTransactionModal';
import { CSVLink } from 'react-csv';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filters, setFilters] = useState({ type: 'all', category: 'all' });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/transactions`, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/transactions/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      setTransactions(transactions.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Error deleting transaction', err);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    return (
      (filters.type === 'all' || t.type === filters.type) &&
      (filters.category === 'all' || t.category === filters.category)
    );
  });

  const categories = [...new Set(transactions.map((t) => t.category))];

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <div className="dark-container transactions">
      <h2 className="section-title">Transaction History</h2>

      <div className="filter-row">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <CSVLink
          data={filteredTransactions}
          filename="transactions.csv"
          className="csv-btn"
        >
          Export CSV
        </CSVLink>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredTransactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t._id} className={t.type}>
                <td>{formatDate(t.date)}</td>
                <td>{t.description}</td>
                <td>{t.category}</td>
                <td className={t.type === 'expense' ? 'expense-text' : 'income-text'}>
                  {t.type === 'expense' ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
                </td>
                <td>
                  <button className="edit-btn" onClick={() => setSelectedTransaction(t)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => deleteTransaction(t._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedTransaction && (
        <EditTransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onSave={fetchTransactions}
        />
      )}
    </div>
  );
};

export default Transactions;

