const express = require('express');
const { protect, authorizeRoles } = require('../../users_services/middleware/auth');
const { createLocation, listLocations, getLocationById, updateLocation, deleteLocation } = require('../controllers/locationController');

const router = express.Router();

// Public routes (for asset creation forms)
router.get('/', listLocations);
router.get('/:id', getLocationById);

// Protected routes (admin only)
router.post('/', protect, authorizeRoles('admin'), createLocation);
router.put('/:id', protect, authorizeRoles('admin'), updateLocation);
router.delete('/:id', protect, authorizeRoles('admin'), deleteLocation);

module.exports = router;


