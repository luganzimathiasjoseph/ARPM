const mongoose = require('mongoose');

const AssetConfirmationSchema = new mongoose.Schema({
  // Asset Information
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  
  // Confirmation Type
  confirmationType: {
    type: String,
    enum: ['receipt', 'return'],
    required: true
  },
  
  // Receipt Details
  receiptDate: { type: Date, default: Date.now },
  receiptCondition: {
    type: String,
    enum: ['new', 'good', 'fair', 'poor'],
    required: function() { return this.confirmationType === 'receipt'; }
  },
  receiptNotes: { type: String },
  
  // Return Details
  returnDate: { type: Date, default: Date.now },
  returnCondition: {
    type: String,
    enum: ['new', 'good', 'fair', 'poor'],
    required: function() { return this.confirmationType === 'return'; }
  },
  returnNotes: { type: String },
  damageReport: { type: String },
  
  // Location Information
  location: { type: String },
  department: { type: String },
  
  // Digital Signature/Confirmation
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  confirmationTimestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String },
  
  // Witness Information (optional)
  witnessName: { type: String },
  witnessSignature: { type: String },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
AssetConfirmationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AssetConfirmation', AssetConfirmationSchema);


