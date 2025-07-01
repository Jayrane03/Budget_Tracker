const Budget = require('../models/Budget');

const saveBudget = async (req, res) => {
  const { month, totalBudget, categoryLimits } = req.body;
  try {
    const newBudget = new Budget({
      user: req.user.id,
      month,
      totalBudget,
      categoryLimits,
    });
    await newBudget.save();
    res.status(201).json(newBudget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBudgetByMonth = async (req, res) => {
  const userId = req.user.id;
  const { month } = req.query;

  try {
    const budget = await Budget.findOne({ user: userId, month });
    if (!budget) return res.status(404).json(null);
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateBudget = async (req, res) => {
  const { id } = req.params;
  const { totalBudget, categoryLimits } = req.body;

  try {
    const updated = await Budget.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { totalBudget, categoryLimits },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Budget not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  saveBudget,
  getBudgetByMonth,
  updateBudget,
};
