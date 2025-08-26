const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  getUserById
} = require('../controllers/adminController');

// All routes require admin role
router.use(protect);
router.use(authorizeRoles('admin'));

// User management routes
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/reset-password', resetPassword);

module.exports = router;
