const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/predict-budget', async (req, res) => {
  const { userId, income } = req.body;

  if (!userId || !income) {
    return res.status(400).json({ error: 'Missing userId or income' });
  }

  // Fetch transactions for this user from MongoDB
  const Transaction = require('../models/Transaction');
  const transactions = await Transaction.find({ userId });

  if (!transactions || transactions.length === 0) {
    return res.status(404).json({ error: 'No transaction data found for this user' });
  }

  try {
    // Proxy to Python server
    const response = await axios.post('http://localhost:5001/api/predict-budget', {
      transactions,
      income,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to Flask:', error.message);
    res.status(500).json({ error: 'Failed to fetch prediction from Python service' });
  }
});

module.exports = router;
