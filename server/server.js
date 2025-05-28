const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transRoutes');
const predictRoutes = require('./routes/predict');
const analyzeRoute = require('./routes/analys');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api', analyzeRoute);
app.use('/api', predictRoutes); // ✅ fixed

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
