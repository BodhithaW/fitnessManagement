const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: 'WP0001'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  bmiId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'BMI'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  workoutPlan: {
    type: String,
    trim: true,
    default: ''
  },
  adminNotes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Pre-save middleware to auto-generate WorkoutPlan ID
workoutPlanSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const lastWorkoutPlan = await this.constructor.findOne({}, {}, { sort: { 'id': -1 } });
      if (lastWorkoutPlan) {
        const lastId = lastWorkoutPlan.id.replace('WP', '');
        const nextId = String(parseInt(lastId) + 1).padStart(4, '0');
        this.id = `WP${nextId}`;
      } else {
        this.id = 'WP0001';
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
