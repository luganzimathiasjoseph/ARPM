const express = require('express');
const { protect, authorizeRoles } = require('../../users_services/middleware/auth');
const { sendTestNotification } = require('../controllers/notificationController');

const router = express.Router();

router.post('/test', protect, authorizeRoles('admin'), sendTestNotification);

module.exports = router;





