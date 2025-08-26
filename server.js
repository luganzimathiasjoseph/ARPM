const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

const _dotenv = dotenv.config(); // Store the result

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(express.json());

// Routes
const authRoutes = require('./services/users_services/routes/authRoutes');
const adminRoutes = require('./services/users_services/routes/adminRoutes');
const auditRoutes = require('./services/users_services/routes/auditRoutes');
const assetRoutes = require('./services/asset_services/routes/assetRoutes');
const categoryRoutes = require('./services/asset_services/routes/categoryRoutes');
const locationRoutes = require('./services/asset_services/routes/locationRoutes');
const assetRequestRoutes = require('./services/asset_services/routes/assetRequestRoutes');
const assetIssueRoutes = require('./services/asset_services/routes/assetIssueRoutes');
const assetConfirmationRoutes = require('./services/asset_services/routes/assetConfirmationRoutes');
const notificationRoutes = require('./services/notification_services/routes/notificationRoutes');
const reportingRoutes = require('./services/reporting_services/routes/reportingRoutes');
const workOrderRoutes = require('./services/maintenance_services/routes/workOrderRoutes');
// const technicianWorkOrderRoutes = require('./services/technician_work_orders/routes/technicianWorkOrderRoutes');

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/asset-requests', assetRequestRoutes);
app.use('/api/v1/asset-issues', assetIssueRoutes);
app.use('/api/v1/asset-confirmations', assetConfirmationRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportingRoutes);
app.use('/api/v1/maintenance/work-orders', workOrderRoutes);
// app.use('/api/v1/technician-work-orders', technicianWorkOrderRoutes);

// Error handling middleware (should be after all other middleware and routes)
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  
  // Default error status and message
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.message, 
      stack: err.stack 
    })
  });
});

// 404 Handler (should be after all other routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = _dotenv.parsed.PORT || process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

startServer();
