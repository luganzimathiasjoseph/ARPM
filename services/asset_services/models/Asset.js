const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  // Basic Asset Information
  assetId: { type: String, unique: true, required: true }, // Asset ID / Tag Number
  serialNumber: { type: String, unique: true, required: true }, // Manufacturer's serial number
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  description: { type: String },
  engravement: { type: String }, // Engravement information
  macAddress: { type: String }, // MAC address moved to basic info
  
  // Acquisition Details
  purchaseDate: { type: Date, required: true },
  warrantyExpiryDate: { type: Date },
  cost: { type: Number, default: 0 },
  supplier: { type: String },
  invoiceNumber: { type: String },
  
  // Assignment & Location
  department: { type: String, required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Technical Specifications
  specifications: {
    cpu: { type: String },
    ram: { type: String },
    storage: { type: String },
    operatingSystem: { type: String },
    capacity: { type: String }, // For UPS, etc.
    printSpeed: { type: String }, // For printers
    resolution: { type: String }, // For displays
    power: { type: String }, // For electrical equipment
  },
  
  // Accessories
  accessories: [{ type: String }], // Mouse, keyboard, cables, etc.
  
  // Lifecycle & Status Tracking
  status: { 
    type: String, 
    enum: ['In use', 'In storage', 'Under repair', 'Retired/Disposed'], 
    default: 'In use' 
  },
  condition: { 
    type: String, 
    enum: ['New', 'Good', 'Fair', 'Poor'], 
    default: 'Good' 
  },
  
  // Maintenance Tracking
  lastMaintenanceDate: { type: Date },
  nextMaintenanceSchedule: { type: Date },
  maintenanceHistory: [{
    date: { type: Date, default: Date.now },
    type: { type: String }, // Preventive, Corrective, etc.
    description: { type: String },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cost: { type: Number },
    parts: [{ type: String }]
  }],
  
  // Asset History & Movement
  movementLog: [{
    date: { type: Date, default: Date.now },
    fromLocation: { type: String },
    toLocation: { type: String },
    fromDepartment: { type: String },
    toDepartment: { type: String },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String },
    authorizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Financial & Depreciation
  depreciationMethod: { 
    type: String, 
    enum: ['straight-line', 'declining-balance'], 
    default: 'straight-line' 
  },
  usefulLifeMonths: { type: Number, default: 60 },
  currentValue: { type: Number },
  
  // Additional Tracking
  handoverAcknowledged: { type: Boolean, default: false },
  returnAcknowledged: { type: Boolean, default: false },
  replacementSuggested: { type: Boolean, default: false },
  replacementReason: { type: String },
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
AssetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Asset', AssetSchema);



