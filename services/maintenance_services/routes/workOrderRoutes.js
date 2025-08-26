const express = require('express');
const {
  getWorkOrders,
  createWorkOrder
} = require('../controllers/workOrderController');

const router = express.Router();

// All routes in this file are relative to /api/v1/maintenance/work-orders

router
  .route('/')
  .get(getWorkOrders)
  .post(createWorkOrder);

module.exports = router;
