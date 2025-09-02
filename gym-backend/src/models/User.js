const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: '0001'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
});

// Pre-save middleware to auto-generate userId
userSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const lastUser = await this.constructor.findOne({}, {}, { sort: { 'userId': -1 } });
      if (lastUser) {
        const lastUserId = parseInt(lastUser.userId);
        this.userId = String(lastUserId + 1).padStart(4, '0');
      } else {
        this.userId = '0001';
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to remove password from JSON responses
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
