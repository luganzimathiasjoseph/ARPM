const Category = require('../models/Category');
const Location = require('../models/Location');
const ErrorResponse = require('../../../utils/errors');
const asyncHandler = require('../../../middleware/async');

// @desc    Get all categories
// @route   GET /api/v1/assets/categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res, next) => {
  try {
    console.log('Attempting to fetch categories...');
    const categories = await Category.find().select('name description');
    
    if (!categories || categories.length === 0) {
      console.log('No categories found, returning empty array');
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    console.log(`Found ${categories.length} categories`);
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error in getCategories:', error);
    next(new ErrorResponse('Failed to fetch categories', 500));
  }
});

// @desc    Get all locations
// @route   GET /api/v1/assets/locations
// @access  Private
exports.getLocations = asyncHandler(async (req, res, next) => {
  try {
    console.log('Attempting to fetch locations...');
    const locations = await Location.find().select('name building floor');
    
    if (!locations || locations.length === 0) {
      console.log('No locations found, returning empty array');
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    console.log(`Found ${locations.length} locations`);
    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error('Error in getLocations:', error);
    next(new ErrorResponse('Failed to fetch locations', 500));
  }
});
