const WorkOrder = require('../models/WorkOrder');

// @desc    Get all work orders
// @route   GET /api/v1/maintenance/work-orders
// @access  Private
exports.getWorkOrders = async (req, res, next) => {
  try {
    const workOrders = await WorkOrder.find().populate('asset').populate('assignedTo');

    res.status(200).json({
      success: true,
      count: workOrders.length,
      data: workOrders
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create a work order
// @route   POST /api/v1/maintenance/work-orders
// @access  Private
exports.createWorkOrder = async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.create(req.body);

    res.status(201).json({
      success: true,
      data: workOrder
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
