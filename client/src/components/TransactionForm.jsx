import { useState } from 'react';
import axios from 'axios';
import config from '../services/helper';
const TransactionForm = ({ addTransaction }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);

  const { description, amount, category, type, date } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategorize = async () => {
    if (!description) return;
    
    try {
      setLoading(true);
      const res = await axios.post(`${config.BASE_URL}/api/categorize`, { description });
      setFormData({ ...formData, category: res.data.category });
    } catch (err) {
      console.error('Error categorizing transaction', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!description || !amount || !category) {
      return alert('Please fill all fields');
    }
    
    const newTransaction = {
      description,
      amount: type === 'expense' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)),
      category,
      type,
      date
    };
    
    addTransaction(newTransaction);
    
    // Reset form
    setFormData({
      description: '',
      amount: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="form-container">
      <h2>Add New Transaction</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <div className="input-with-button">
            <input
              type="text"
              name="description"
              value={description}
              onChange={onChange}
              placeholder="Transaction description"
              required
            />
            <button type="button" onClick={handleCategorize} disabled={loading}>
              {loading ? 'AI...' : 'Auto-categorize'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            name="amount"
            value={amount}
            onChange={onChange}
            placeholder="Amount"
            required
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select name="type" value={type} onChange={onChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            name="category"
            value={category}
            onChange={onChange}
            placeholder="Category"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            name="date"
            value={date}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit" className="btn">Add Transaction</button>
      </form>
    </div>
  );
};

export default TransactionForm;