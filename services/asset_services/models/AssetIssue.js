const mongoose = require('mongoose');

const AssetIssueSchema = new mongoose.Schema({
  // Basic Information
  issueType: {
    type: String,
    enum: ['incident', 'maintenance', 'replacement', 'new_device'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'complete', 'rejected'],
    default: 'pending'
  },
  
  // Asset Information (if related to existing asset)
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
  
  // Incident Report Details
  incidentDate: { type: Date },
  incidentLocation: { type: String },
  witnesses: [{ type: String }],
  attachments: [{ type: String }], // File paths or URLs
  
  // Maintenance/Replacement Details
  maintenanceType: {
    type: String,
    enum: ['repair', 'replacement', 'upgrade', 'preventive']
  },
  estimatedCost: { type: Number },
  urgency: { type: String },
  
  // New Device Request Details
  deviceType: { type: String },
  justification: { type: String },
  preferredBrand: { type: String },
  preferredModel: { type: String },
  estimatedBudget: { type: Number },
  
  // Assignment and Resolution
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  resolutionNotes: { type: String },
  
  // Metadata
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
AssetIssueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AssetIssue', AssetIssueSchema);


