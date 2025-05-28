// File: components/EditTransactionModal.jsx
import { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../../services/helper';
import "../../Styles/Dashboard.css"; // Ensure you have the styles for the modal
const EditTransactionModal = ({ transaction, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...transaction });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/api/transactions/${transaction._id}`, formData, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      onSave();
      onClose();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Transaction</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            required
          />
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Amount"
            required
          />
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
            required
          />
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;