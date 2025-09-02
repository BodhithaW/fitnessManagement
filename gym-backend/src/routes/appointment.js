const express = require('express');
const Appointment = require('../models/Appointment');
const auth = require('../middlewares/auth');

const router = express.Router();

// Admin middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.userId !== '0001') { // First user (0001) is admin
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// USER ROUTES (Protected)

// User creates appointment
router.post('/', auth, async (req, res) => {
  try {
    const { name, age, problem,issue, doctorName } = req.body;

    // Validate required fields
    if (!name || !age || !problem || !doctorName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, age, problem, doctorName'
      });
    }

    // Validate age
    if (age < 1 || age > 120) {
      return res.status(400).json({
        success: false,
        message: 'Age must be between 1 and 120'
      });
    }

    const appointment = new Appointment({
      name,
      age,
      problem,
      issue,
      doctorName,
      createdBy: req.user._id
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// User gets all their appointments
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, doctorName } = req.query;

    const query = { createdBy: req.user._id };
    
    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by doctor
    if (doctorName) {
      query.doctorName = { $regex: doctorName, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalAppointments: total,
          appointmentsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// User gets single appointment
router.get('/my-appointments/:appointmentId', auth, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      createdBy: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment retrieved successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Get user appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// User deletes their appointment
router.delete('/my-appointments/:appointmentId', auth, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      createdBy: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Only allow deletion if appointment is pending
    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete appointment. Only pending appointments can be deleted.'
      });
    }

    await Appointment.findByIdAndDelete(appointmentId);

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
      data: {
        deletedAppointment: {
          id: appointment._id,
          name: appointment.name,
          doctorName: appointment.doctorName
        }
      }
    });

  } catch (error) {
    console.error('Delete user appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ADMIN ROUTES (Protected + Admin Only)

// Admin gets all appointments
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, doctorName, date, search } = req.query;

    const query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by doctor
    if (doctorName) {
      query.doctorName = { $regex: doctorName, $options: 'i' };
    }

    // Filter by date
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.dateTime = { $gte: startDate, $lt: endDate };
    }

    // Search by name or problem
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { problem: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const appointments = await Appointment.find(query)
      .sort({ dateTime: 1, queueNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name userId email');

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalAppointments: total,
          appointmentsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get admin appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin gets single appointment by ID
router.get('/admin/:appointmentId', auth, isAdmin, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate('createdBy', 'name userId email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment retrieved successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Get admin appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin edits appointment (dateTime and queueNumber)
router.put('/admin/:appointmentId', auth, isAdmin, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { dateTime, queueNumber, status } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const updates = {};

    // Update dateTime if provided
    if (dateTime) {
      const newDateTime = new Date(dateTime);
      if (isNaN(newDateTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }
      updates.dateTime = newDateTime;
    }

    // Update queueNumber if provided
    if (queueNumber !== undefined) {
      if (queueNumber < 1) {
        return res.status(400).json({
          success: false,
          message: 'Queue number must be greater than 0'
        });
      }
      updates.queueNumber = parseInt(queueNumber);
    }

    // Update status if provided
    if (status && ['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      updates.status = status;
    }

    // Check for queue number conflicts if updating queue number
    if (updates.queueNumber && updates.dateTime) {
      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: appointmentId },
        dateTime: updates.dateTime,
        queueNumber: updates.queueNumber,
        status: { $ne: 'cancelled' }
      });

      if (conflictingAppointment) {
        return res.status(400).json({
          success: false,
          message: 'Queue number already exists for this date and time'
        });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name userId email');

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment: updatedAppointment
      }
    });

  } catch (error) {
    console.error('Update admin appointment error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin gets appointments by date
router.get('/admin/by-date/:date', auth, isAdmin, async (req, res) => {
  try {
    const { date } = req.params;
    const { doctorName } = req.query;

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const query = {
      dateTime: { $gte: startDate, $lt: endDate },
      status: { $ne: 'cancelled' }
    };

    if (doctorName) {
      query.doctorName = { $regex: doctorName, $options: 'i' };
    }

    const appointments = await Appointment.find(query)
      .sort({ queueNumber: 1 })
      .populate('createdBy', 'name userId email');

    res.json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: {
        appointments,
        total: appointments.length,
        date: date
      }
    });

  } catch (error) {
    console.error('Get appointments by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin deletes any appointment
router.delete('/admin/:appointmentId', auth, isAdmin, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await Appointment.findByIdAndDelete(appointmentId);

    res.json({
      success: true,
      message: 'Appointment deleted successfully by admin',
      data: {
        deletedAppointment: {
          id: appointment._id,
          name: appointment.name,
          doctorName: appointment.doctorName,
          status: appointment.status
        }
      }
    });

  } catch (error) {
    console.error('Admin delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


// Admin gets next available queue number for a date
router.get('/admin/next-queue/:date', auth, isAdmin, async (req, res) => {
  try {
    const { date } = req.params;
    const { doctorName } = req.query;

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const query = {
      dateTime: { $gte: startDate, $lt: endDate },
      queueNumber: { $exists: true, $ne: null }
    };

    if (doctorName) {
      query.doctorName = { $regex: doctorName, $options: 'i' };
    }

    const lastAppointment = await Appointment.findOne(query)
      .sort({ queueNumber: -1 });

    const nextQueueNumber = lastAppointment ? lastAppointment.queueNumber + 1 : 1;

    res.json({
      success: true,
      message: 'Next queue number retrieved successfully',
      data: {
        nextQueueNumber,
        date: date,
        doctorName: doctorName || 'all'
      }
    });

  } catch (error) {
    console.error('Get next queue number error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
