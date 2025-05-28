// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  categorySummary,
  monthlySummary
} = require('../controller/transactionController');

router.get('/', auth, getTransactions);
router.post('/', auth, addTransaction);
router.put('/:id', auth, updateTransaction);
router.delete('/:id', auth, deleteTransaction);
router.get('/summary', auth, categorySummary);
router.get('/monthly', auth, monthlySummary);

module.exports = router;
