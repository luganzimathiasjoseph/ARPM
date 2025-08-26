const express = require('express');
const { protect, authorizeRoles } = require('../../users_services/middleware/auth');
const {
  createConfirmation,
  getConfirmations,
  getConfirmation
} = require('../controllers/assetConfirmationController');

const router = express.Router();

// Asset Confirmation operations
router.post('/', protect, authorizeRoles('staff', 'admin'), createConfirmation);
router.get('/', protect, getConfirmations);
router.get('/:id', protect, getConfirmation);

module.exports = router;


