const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a location name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  building: {
    type: String,
    required: [true, 'Please add a building name/number'],
    trim: true
  },
  floor: {
    type: String,
    required: [true, 'Please add a floor number/name'],
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please add a valid email']
  },
  contactPhone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add compound index for unique location per building and floor
locationSchema.index({ name: 1, building: 1, floor: 1 }, { unique: true });

// Create model if not exists
module.exports = mongoose.models.Location || mongoose.model('Location', locationSchema);
