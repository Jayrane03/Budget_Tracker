import express from 'express';
const router = express.Router();
import Transaction from"../models/Transaction.js"
// import {getTransactions} from"../controller/transactionController.js";
// import auth from'../middleware/auth.js';
/**
 * Analyzes transactions for anomalies.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * 
 */
router.get('/transactions/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.params.userId }).sort({ date: -1 });
    res.json({ transactions });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
router.post('/analyze', (req, res) => {
  try {
    const { transactions } = req.body;

    // Validate transactions array
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Invalid or missing transactions array.' });
    }

    // Validate transaction objects
    if (!transactions.every(tx => typeof tx === 'object' && tx !== null)) {
      return res.status(400).json({ error: 'Invalid transaction objects.' });
    }

    console.log('Received transactions for analysis:', transactions);

    // Filter anomalies based on amount
    const anomalies = transactions.filter(tx => {
      return typeof tx.amount === 'number' && Math.abs(tx.amount) > 1000;
    });

    console.log('Anomalies found:', anomalies);

    // Return insights
    return res.status(200).json({ insights: anomalies });

  } catch (error) {
    console.error('Error analyzing transactions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;