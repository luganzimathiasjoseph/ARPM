const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  code: { 
    type: String, 
    unique: true, 
    sparse: true, // Allows multiple null values
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ''
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'], 
    default: 'Active' 
  },
  parentCategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category' 
  },
  assetCount: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Add index


// Pre-save middleware to auto-generate code if not provided
categorySchema.pre('save', async function(next) {
  if (!this.code) {
    try {
      const count = await mongoose.model('Category').countDocuments();
      this.code = `CAT${String(count + 1).padStart(3, '0')}`;
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Virtual for full category path (including parent names)
categorySchema.virtual('fullPath').get(function() {
  if (this.parentCategory) {
    return `${this.parentCategory.name} > ${this.name}`;
  }
  return this.name;
});

// Ensure virtual fields are serialized
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
