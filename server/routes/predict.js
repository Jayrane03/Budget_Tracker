// In your Node.js Express route: routes/predict-budget.js
import express  from 'express';
const  router = express.Router();
import axios from 'axios';
import Transaction from '../models/Transaction.js'; // Make sure this path is correct

// Use an environment variable for your Flask server URL
// Use an environment variable for your Flask server URL
// const FLASK_SERVER_URL = process.env.PYTHON_SERVER_URL;


const FLASK_SERVER_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://budget-tracker-micro-service.onrender.com'
    : 'http://localhost:5001';

console.log(`✅ Flask server set to: ${FLASK_SERVER_URL} (env: ${process.env.NODE_ENV})`);
// POST /api/predict-budget
// Assuming authentication middleware runs before this,
// so req.user.id is available and userId from body is for specific request, or remove userId from body
router.post('/predict-budget', async (req, res) => {
  // If your route is authenticated, you might prefer req.user.id
  // const userId = req.user.id;
  const { userId, income } = req.body; // Using userId from body as per your original code

  // ✅ Validate inputs
  if (!userId || income === undefined || income === null) {
    return res.status(400).json({ error: 'Missing userId or income in request.' });
  }

  try {
    // ✅ Fetch transactions from MongoDB
    const transactions = await Transaction.find({ user: userId });

    if (!transactions || transactions.length === 0) {
      // It's possible for a user to have no transactions yet.
      // Flask can't predict without data.
      return res.status(404).json({ error: 'No transaction data found for this user. Please add some transactions to get predictions.' });
    }

    // ✅ IMPORTANT: Process transactions to ensure 'amount' and 'date' are in expected formats for Python
    const processedTransactions = transactions.map(t => {
      // Mongoose documents are not plain objects; .toObject() converts them.
      const obj = t.toObject();

      // Ensure amount is a number. If your Mongoose schema uses Decimal128, it will be an object.
      // Convert it to a float.
      const amountValue = obj.amount && typeof obj.amount.toString === 'function'
                          ? parseFloat(obj.amount.toString()) // For Decimal128
                          : parseFloat(obj.amount); // For regular numbers

      // Ensure date is a 'YYYY-MM-DD' string for consistent parsing in Python
      const dateValue = obj.date ? new Date(obj.date).toISOString().split('T')[0] : null;

      return {
        // You can include _id or remove it if not needed by Flask
        _id: obj._id ? obj._id.toString() : null, // Convert ObjectId to string
        description: obj.description,
        amount: amountValue,
        category: obj.category,
        type: obj.type,
        date: dateValue,
        // Add any other fields your Flask app might use
      };
    }).filter(t => t.amount !== null && !isNaN(t.amount) && t.date !== null); // Filter out invalid entries

    console.log('--- Data being sent from Node.js to Flask ---');
    console.log(`Income: ${income}`);
    console.log(`Transactions (first 2):`, processedTransactions.slice(0, 5));
    console.log('---------------------------------------------\n');

    // ✅ Forward to Flask server for budget prediction
    const flaskRes = await axios.post(`${FLASK_SERVER_URL}/api/predict-budget`, {
      transactions: processedTransactions,
      income,
    });

    return res.json(flaskRes.data);
  } catch (error) {
    console.error('❌ Error forwarding to Flask server from Node.js:', error.message);
    if (error.response) {
      // This means Flask sent an error response (e.g., 400, 500)
      console.error('Flask response data:', error.response.data);
      console.error('Flask response status:', error.response.status);
    } else if (error.request) {
      // This means the request was made but no response was received (e.g., Flask server down)
      console.error('No response received from Flask. Is Flask server running at', FLASK_SERVER_URL, '?');
    } else {
      // Something else happened in setting up the request
      console.error('Error setting up request to Flask:', error.message);
    }

    // Return a generic 500 or pass through Flask's error if appropriate
    return res.status(error.response?.status || 500).json({
      error: 'Failed to fetch prediction from Python service',
      details: error.response?.data || error.message,
    });
  }
});

// module.exports = router;
export default router; // Use ES6 export for consistency