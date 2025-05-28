const User = require('../models/User'); // CORRECTED: Direct require for the Mongoose model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Ensure your .env file is loaded if you haven't done so in your server.js
// require('dotenv').config();

// Register User
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body; // Assuming 'name' field in User model

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save user
    user = new User({ name, email, password: hashedPassword }); // Ensure 'name' matches your User model schema
    await user.save();

    // Generate token
    const payload = {
      user: {
        id: user.id // Mongoose creates an 'id' virtual getter for '_id'
      }
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET, // Make sure JWT_SECRET is defined in your .env file
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Send token and user info
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err.message);
    // More specific error handling could be added here, e.g., for validation errors
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' }); // Generic message for security
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' }); // Generic message for security
    }

    const payload = {
      user: {
        id: user.id
      }
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Get Authenticated User Info
// This route typically requires an authentication middleware to be placed before it
// For example: router.get('/user', authMiddleware, getUser);
exports.getUser = async (req, res) => {
  try {
    // Check if req.user exists (from auth middleware)
    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'Authorization denied: No user ID provided by middleware' });
    }

    const user = await User.findById(req.user.id).select('-password'); // Exclude password from the response
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ user, msg: "User found successfully" }); // CORRECTED: Send message as part of JSON object
  } catch (err) {
    console.error(err.message);
    // Often, a JWT malformed or expired error would lead to 401,
    // but if it's a genuine server error during DB query, 500 is appropriate.
    res.status(500).json({ msg: 'Server Error' });
  }
};