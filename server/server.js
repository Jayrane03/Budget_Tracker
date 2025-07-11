require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables


// Route imports
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transRoutes');
const predictRoutes = require('./routes/predict');
const analyzeRoute = require('./routes/analys');
const budgetRoutes = require('./routes/budgetRoutes');
const app = express();

// Connect to MongoDB
connectDB();

// CORS setup
const allowedOrigins = [
  'http://localhost:5173',                            // Local dev
  'https://budget-tracker-frontend-ijfx.onrender.com' // Production
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow no origin (like Postman or curl) or whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin: ' + origin));
    }
  },
  credentials: true,
}));
// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analyze', analyzeRoute);
app.use('/api', predictRoutes);
app.use('/api/budget',budgetRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
);
