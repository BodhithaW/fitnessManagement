const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120
  },
  issue: {
    type: String,
    required: false,
    trim: true
  },
  problem: {
    type: String,
    required: true,
    trim: true
  },
  doctorName: {
    type: String,
    required: true,
    trim: true
  },
  dateTime: {
    type: Date,
    default: null
  },
  queueNumber: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
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
appointmentSchema.index({ dateTime: 1, queueNumber: 1, status: 1 });
appointmentSchema.index({ createdBy: 1 });
appointmentSchema.index({ doctorName: 1 });

// Method to remove sensitive fields from JSON responses
appointmentSchema.methods.toJSON = function() {
  const appointment = this.toObject();
  delete appointment.__v;
  return appointment;
};

module.exports = mongoose.model('Appointment', appointmentSchema);
