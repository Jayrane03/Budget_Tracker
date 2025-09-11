
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js'; // Add `.js` extension for ESM

// Route imports (all must use `.js` extension in ESM)
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transRoutes.js';
import predictRoutes from './routes/predict.js';
import analyzeRoute from './routes/analys.js';
import budgetRoutes from './routes/budgetRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
// Connect to MongoDB
connectDB();
const app = express();
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
app.use('/api/chat', chatRoutes);
// Health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
);
