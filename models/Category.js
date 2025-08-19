const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
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
    type: String, // This will store the path or URL to the image
    default: 'default-category.jpg' // Default image if none is provided
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

categorySchema.statics.STATUS_ACTIVE = true;
categorySchema.statics.STATUS_INACTIVE = false;


// Update the updatedAt field before saving
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// You can add virtuals or methods if needed
categorySchema.virtual('imagePath').get(function() {
  if (this.image) {
    return `/uploads/categories/${this.image}`;
  }
  return '/uploads/default-category.jpg';
});

module.exports = mongoose.model('Category', categorySchema);