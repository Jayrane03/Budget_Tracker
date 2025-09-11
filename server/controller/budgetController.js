import Budget from "../models/Budget.js";

// @desc Save a new monthly budget
// @route POST /api/budget
// @access Private
export const saveBudget = async (req, res) => {
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
    console.error('Error saving budget:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc Get budget for a specific month
// @route GET /api/budget?month=YYYY-MM
// @access Private
export const getBudgetByMonth = async (req, res) => {
  const userId = req.user.id;
  const { month } = req.query;

  try {
    const budget = await Budget.findOne({ user: userId, month });

    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' });
    }

    res.json(budget);
  } catch (err) {
    console.error('Error fetching budget:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc Update budget by ID
// @route PUT /api/budget/:id
// @access Private
export const updateBudget = async (req, res) => {
  const { id } = req.params;
  const { totalBudget, categoryLimits } = req.body;

  try {
    const updated = await Budget.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { totalBudget, categoryLimits },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: 'Budget not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating budget:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
