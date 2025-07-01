const mongoose = require('mongoose');


const categoryLimitSchema = new mongoose.Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true },
});

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  totalBudget: { type: Number, required: true },
  categoryLimits: [categoryLimitSchema],
});

module.exports = mongoose.model('Budget', budgetSchema);
