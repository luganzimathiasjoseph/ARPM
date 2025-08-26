const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../../users_services/middleware/auth');
const {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} = require('../controllers/categoryController');

// Public routes (for asset creation forms)
router.get('/', listCategories);

// Protected routes (admin only)
router.post('/', protect, authorizeRoles('admin'), createCategory);
router.get('/stats', protect, authorizeRoles('admin'), getCategoryStats);
router.get('/:id', protect, getCategory);
router.put('/:id', protect, authorizeRoles('admin'), updateCategory);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCategory);

module.exports = router;


