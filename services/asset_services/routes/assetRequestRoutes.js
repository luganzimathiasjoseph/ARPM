const express = require('express');
const { protect, authorizeRoles } = require('../../users_services/middleware/auth');
const { createRequest, listMyRequests, listAllRequests, approveRequest, rejectRequest, updateCondition } = require('../controllers/assetRequestController');

const router = express.Router();

router.use(protect);

// Staff
router.post('/', createRequest);
router.get('/me', listMyRequests);
router.post('/condition', updateCondition);

// Admin
router.get('/', authorizeRoles('admin'), listAllRequests);
router.post('/:id/approve', authorizeRoles('admin'), approveRequest);
router.post('/:id/reject', authorizeRoles('admin'), rejectRequest);

module.exports = router;


