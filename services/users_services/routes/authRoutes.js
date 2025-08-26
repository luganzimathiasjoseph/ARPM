// routes/authRoutes.js

const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes - no auth required
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes - require valid JWT
router.get('/profile', protect, getUserProfile);

module.exports = router;
