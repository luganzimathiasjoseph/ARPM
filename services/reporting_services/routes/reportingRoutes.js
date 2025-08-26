const express = require('express');
const { protect, authorizeRoles } = require('../../users_services/middleware/auth');
const {
  assetUtilizationReport
} = require('../controllers/reportingController');

const router = express.Router();

router.get('/asset-utilization', protect, authorizeRoles('admin'), assetUtilizationReport);
// router.get('/maintenance-costs', protect, authorizeRoles('admin'), maintenanceCostReport);
// router.get('/downtime', protect, authorizeRoles('admin'), downtimeReport);
// router.post('/custom', protect, authorizeRoles('admin'), customReport);

module.exports = router;