// routes/transactionRoutes.js
import express  from'express';
const router = express.Router();
import auth from  '../middleware/auth.js';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  categorySummary,
  deleteAllTransactions,
  monthlySummary
} from'../controller/transactionController.js';

router.get('/', auth, getTransactions);
router.post('/', auth, addTransaction);
router.delete('/clear', auth, deleteAllTransactions);
router.put('/:id', auth, updateTransaction);
router.delete('/:id', auth, deleteTransaction);
router.get('/summary', auth, categorySummary);
router.get('/monthly', auth, monthlySummary);

// module.exports = router;
export default router; // Use ES6 export for consistency