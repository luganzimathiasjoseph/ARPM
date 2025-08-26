const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { listAudits } = require('../controllers/auditController');

const router = express.Router();

router.get('/', protect, authorizeRoles('admin'), listAudits);

module.exports = router;


