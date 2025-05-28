const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.addTransaction = async (req, res) => {
  const { description, amount, category, type, date } = req.body;

  try {
    const newTransaction = new Transaction({
      description,
      amount,
      category,
      type,
      date,
      user: req.user.id
    });

    const transaction = await newTransaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateTransaction = async (req, res) => {
  const { description, amount, category, type, date } = req.body;
  const transactionFields = { description, amount, category, type, date };

  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: transactionFields },
      { new: true }
    );

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // await Transaction.findByIdAndRemove(req.params.id);
   await Transaction.findByIdAndDelete(req.params.id)
    
    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.categorySummary = async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);
    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.monthlySummary = async (req, res) => {
  try {
    const monthly = await Transaction.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json(monthly);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};