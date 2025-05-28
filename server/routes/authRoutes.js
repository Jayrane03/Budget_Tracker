// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUser } = require('../controller/authController');
const auth = require('../middleware/auth');
const User = require('../models/User');
router.post('/register', registerUser);
router.post('/login', loginUser);
// router.get('/user', auth, getUser);
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // remove password
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json({
      name: user.name,
      email: user.email,
      username: user.username || user.name,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;
