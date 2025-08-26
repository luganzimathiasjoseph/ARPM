const express = require('express');
const { protect, authorizeRoles } = require('../../users_services/middleware/auth');
const {
  createAsset,
  listAssets,
  getAsset,
  updateAsset,
  deleteAsset,
  updateAssetStatus,
  moveAsset,
  calculateDepreciation,
  generateBarcodePayload,
  getAssetStats,
  searchAssets
} = require('../controllers/assetController');
const { getCategories, getLocations } = require('../controllers/categoryLocationController');

const router = express.Router();

// Category and Location routes
router.get('/categories', protect, getCategories);
router.get('/locations', protect, getLocations);

// Asset CRUD operations
router.post('/', protect, authorizeRoles('admin', 'technician'), createAsset);
router.get('/', protect, listAssets);
router.get('/stats', protect, getAssetStats);
router.get('/search', searchAssets); // New search route - temporarily unprotected
router.get('/:id', protect, getAsset);
router.put('/:id', protect, authorizeRoles('admin', 'technician'), updateAsset);
router.delete('/:id', protect, authorizeRoles('admin'), deleteAsset);

// Asset lifecycle operations
router.patch('/:id/status', protect, authorizeRoles('admin', 'technician'), updateAssetStatus);
router.patch('/:id/move', protect, authorizeRoles('admin', 'technician'), moveAsset);

// Asset analysis
router.get('/:id/depreciation', protect, calculateDepreciation);
router.get('/:id/barcode', protect, generateBarcodePayload);

module.exports = router;
