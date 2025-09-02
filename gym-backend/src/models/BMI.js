const mongoose = require('mongoose');

const bmiSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: 'BMI0001'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120
  },
  gender: {
    type: String,
    required: true,
  },
  height: {
    type: Number,
    required: true,
    min: 50,
    max: 300
  },
  weight: {
    type: Number,
    required: true,
    min: 20,
    max: 500
  },
  bmiValue: {
    type: Number,
    required: true
  },
  healthConditions: {
    type: String,
    trim: true,
    default: ''
  },
  bmiFeedback: {
    type: String,
    enum: ['PENDING', 'UNDERWEIGHT', 'NORMAL', 'OVERWEIGHT', 'OBESE'],
    default: 'PENDING'
  }
}, {
  timestamps: true
});

// Pre-save middleware to auto-generate BMI ID
bmiSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const lastBMI = await this.constructor.findOne({}, {}, { sort: { 'id': -1 } });
      if (lastBMI) {
        const lastId = lastBMI.id.replace('BMI', '');
        const nextId = String(parseInt(lastId) + 1).padStart(4, '0');
        this.id = `BMI${nextId}`;
      } else {
        this.id = 'BMI0001';
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to calculate BMI feedback based on BMI value
bmiSchema.methods.calculateFeedback = function() {
  if (this.bmiValue < 18.5) {
    return 'UNDERWEIGHT';
  } else if (this.bmiValue >= 18.5 && this.bmiValue < 25) {
    return 'NORMAL';
  } else if (this.bmiValue >= 25 && this.bmiValue < 30) {
    return 'OVERWEIGHT';
  } else {
    return 'OBESE';
  }
};

module.exports = mongoose.model('BMI', bmiSchema);
