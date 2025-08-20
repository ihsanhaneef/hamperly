const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  index: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    type: String,
    default: 'default-category.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Static constants
categorySchema.statics.STATUS_ACTIVE = true;
categorySchema.statics.STATUS_INACTIVE = false;

// Pre-save middleware to handle auto-increment and updatedAt
categorySchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  // Handle auto-increment for index field
  if (this.isNew || this.index === undefined || this.index === null) {
    try {
      const lastCategory = await this.constructor.findOne({}, {}, { sort: { 'index': -1 } });
      this.index = lastCategory && lastCategory.index ? lastCategory.index + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Virtual for image path
categorySchema.virtual('imagePath').get(function() {
  if (this.image) {
    return `/uploads/categories/${this.image}`;
  }
  return '/uploads/default/default-category.jpg';
});

// Ensure virtual fields are serialized
categorySchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Category', categorySchema);
