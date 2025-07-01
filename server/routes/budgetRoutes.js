const express = require('express');
const { saveBudget, getBudgetByMonth, updateBudget } = require('../controller/budgetController.js');
const authenticate = require('../middleware/auth.js');

const router = express.Router();

router.post('/', authenticate, saveBudget);      // Create budget
router.get('/', authenticate, getBudgetByMonth); // Fetch budget for month
router.put('/:id', authenticate, updateBudget);  // Update budget

module.exports = router; // ✅ Corrected: Use CommonJS export
