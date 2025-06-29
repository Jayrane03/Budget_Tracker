import { useState } from 'react';
import axios from 'axios';
import config from '../../services/helper';
import {
  Box,
  Modal,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack
} from '@mui/material';

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

const EditTransactionModal = ({ transaction, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...transaction });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${config.BASE_URL}/api/transactions/${transaction._id}`, formData, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      onSave();
      onClose();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  return (
    <Modal open={true} onClose={onClose} aria-labelledby="edit-transaction-modal">
      <Box sx={modalStyle}>
        <Typography id="edit-transaction-modal" variant="h6" gutterBottom>
          Edit Transaction
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              select
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button variant="contained" color="primary" type="submit">
                Save
              </Button>
              <Button variant="outlined" color="secondary" onClick={onClose}>
                Cancel
              </Button>
            </Box>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default EditTransactionModal;
