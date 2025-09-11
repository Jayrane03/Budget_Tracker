import mongoose from'mongoose';


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
const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
// module.exports = mongoose.model('Budget', budgetSchema);
