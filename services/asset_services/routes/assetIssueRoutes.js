const express = require('express');
const { protect, authorizeRoles } = require('../../users_services/middleware/auth');
const {
  createIssue,
  getIssues,
  getAllIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  assignIssue,
  resolveIssue,
  getIssueStats
} = require('../controllers/assetIssueController');

const router = express.Router();

// Asset Issue CRUD operations
router.post('/', protect, authorizeRoles('staff', 'admin'), createIssue);
router.get('/', protect, getIssues);
router.get('/stats', protect, getIssueStats);
router.get('/all', protect, authorizeRoles('admin'), getAllIssues);
router.get('/:id', protect, getIssue);
router.put('/:id', protect, authorizeRoles('staff', 'admin'), updateIssue);
router.delete('/:id', protect, authorizeRoles('staff', 'admin'), deleteIssue);

// Issue management
router.patch('/:id/assign', protect, authorizeRoles('admin'), assignIssue);
router.patch('/:id/resolve', protect, authorizeRoles('admin', 'technician'), resolveIssue);

module.exports = router;


