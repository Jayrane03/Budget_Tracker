import express from 'express';
import { saveBudget, getBudgetByMonth, updateBudget } from '../controller/budgetController.js';

import authenticate from '../middleware/auth.js'
const router = express.Router();

router.post('/', authenticate, saveBudget);      // Create budget
router.get('/', authenticate, getBudgetByMonth); // Fetch budget for month
router.put('/:id', authenticate, updateBudget);  // Update budget

// module.exports = router; // ✅ Corrected: Use CommonJS export
export default router; // ✅ Corrected: Use ES6 export