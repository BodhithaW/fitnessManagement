const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['supplements', 'equipment', 'clothing', 'accessories', 'nutrition']
  },
  image: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', category: 1 });
productSchema.index({ isActive: 1 });

// Method to remove sensitive fields from JSON responses
productSchema.methods.toJSON = function() {
  const product = this.toObject();
  delete product.__v;
  return product;
};

module.exports = mongoose.model('Product', productSchema);
