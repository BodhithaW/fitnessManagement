const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WorkoutPlan = require('../models/WorkoutPlan');
const BMI = require('../models/BMI');
const auth = require('../middlewares/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'workout-plan-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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

// Request workout plan
router.post('/request', auth, async (req, res) => {
  try {
    const { bmiId } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!bmiId) {
      return res.status(400).json({
        success: false,
        message: 'BMI ID is required'
      });
    }

    // Check if BMI record exists and belongs to user
    const bmiRecord = await BMI.findOne({ id: bmiId, userId });
    if (!bmiRecord) {
      return res.status(404).json({
        success: false,
        message: 'BMI record not found or access denied'
      });
    }

    // Check if user already has a pending request
    const existingRequest = await WorkoutPlan.findOne({ 
      userId, 
      bmiId: bmiRecord._id, 
      status: 'PENDING' 
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending workout plan request for this BMI record'
      });
    }

    // Create new workout plan request
    const workoutPlanRequest = new WorkoutPlan({
      userId,
      bmiId: bmiRecord._id, // Use the actual ObjectId from BMI record
      status: 'PENDING'
    });

    await workoutPlanRequest.save();

    res.status(201).json({
      success: true,
      message: 'Workout plan request submitted successfully',
      data: {
        workoutPlan: workoutPlanRequest
      }
    });

  } catch (error) {
    console.error('Workout plan request error:', error);
    
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

// Get user's workout plan requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const workoutPlans = await WorkoutPlan.find({ userId })
      .sort({ createdAt: -1 })
      .populate('bmiId', 'id bmiValue bmiFeedback age height weight');

    res.json({
      success: true,
      message: 'Workout plan requests retrieved successfully',
      data: {
        workoutPlans,
        total: workoutPlans.length
      }
    });

  } catch (error) {
    console.error('Get user workout plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all workout plan requests (Admin only)
router.get('/all-requests', auth, isAdmin, async (req, res) => {
  try {
    const workoutPlans = await WorkoutPlan.find({})
      .sort({ createdAt: -1 })
      .populate('bmiId', 'id bmiValue bmiFeedback age height weight');

    res.json({
      success: true,
      message: 'All workout plan requests retrieved successfully',
      data: {
        workoutPlans,
        total: workoutPlans.length
      }
    });

  } catch (error) {
    console.error('Get all workout plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin response to workout plan request with image upload
router.put('/admin-response/:requestId', auth, isAdmin, upload.single('workoutPlanImage'), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, workoutPlan, adminNotes } = req.body;
    const imageFile = req.file;

    // Validate required fields
    if (!status || !workoutPlan) {
      return res.status(400).json({
        success: false,
        message: 'Status and workout plan are required'
      });
    }

    // Validate status
    const validStatuses = ['APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be APPROVED or REJECTED'
      });
    }

    // Find workout plan by custom ID first
    const existingWorkoutPlan = await WorkoutPlan.findOne({ id: requestId });
    if (!existingWorkoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan request not found'
      });
    }

    // If there's an old image, delete it
    if (existingWorkoutPlan.workoutPlan && existingWorkoutPlan.workoutPlan.startsWith('uploads/')) {
      const oldImagePath = path.join(__dirname, '..', '..', existingWorkoutPlan.workoutPlan);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Prepare update data
    const updateData = {
      status,
      workoutPlan: workoutPlan,
      adminNotes: adminNotes || ''
    };

    // If image was uploaded, save the filename
    if (imageFile) {
      updateData.workoutPlan = `uploads/${imageFile.filename}`;
    }

    // Update the workout plan using its MongoDB _id
    const updatedWorkoutPlan = await WorkoutPlan.findByIdAndUpdate(
      existingWorkoutPlan._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Workout plan request updated successfully',
      data: {
        workoutPlan: updatedWorkoutPlan
      }
    });

  } catch (error) {
    console.error('Admin response error:', error);
    
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

// Get specific workout plan request
router.get('/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    // Find workout plan by custom ID
    const workoutPlan = await WorkoutPlan.findOne({ id: requestId })
      .populate('bmiId', 'id bmiValue bmiFeedback age height weight');

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan request not found'
      });
    }

    // Check if user can access this request (owner or admin)
    if (workoutPlan.userId !== userId && userId !== '0001') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      message: 'Workout plan request retrieved successfully',
      data: {
        workoutPlan
      }
    });

  } catch (error) {
    console.error('Get workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// // Delete workout plan request
// router.delete('/:requestId', auth, async (req, res) => {
//   try {
//     const { requestId } = req.params;
//     const userId = req.user.userId;

//     // Find workout plan by custom ID
//     const workoutPlan = await WorkoutPlan.findOne({ id: requestId });

//     if (!workoutPlan) {
//       return res.status(404).json({
//         success: false,
//         message: 'Workout plan request not found'
//       });
//     }

//     // Check if user can delete this request (owner or admin)
//     if (workoutPlan.userId !== userId && userId !== '0001') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied'
//       });
//     }

//     // Only allow deletion of pending requests
//     if (workoutPlan.status !== 'PENDING') {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot delete approved or rejected requests'
//       });
//     }

//     // If there's an image, delete it
//     if (workoutPlan.workoutPlan && workoutPlan.workoutPlan.startsWith('uploads/')) {
//       const imagePath = path.join(__dirname, '..', '..', workoutPlan.workoutPlan);
//       if (fs.existsSync(imagePath)) {
//         fs.unlinkSync(imagePath);
//       }
//     }

//     // Delete using MongoDB _id
//     await WorkoutPlan.findByIdAndDelete(workoutPlan._id);

//     res.json({
//       success: true,
//       message: 'Workout plan request deleted successfully'
//     });

//   } catch (error) {
//     console.error('Delete workout plan error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// Delete workout plan request (Admin only)
router.delete('/:requestId', auth, isAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find workout plan by custom ID
    const workoutPlan = await WorkoutPlan.findOne({ id: requestId });

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan request not found'
      });
    }

    // If there's an image, delete it
    if (workoutPlan.workoutPlan && workoutPlan.workoutPlan.startsWith('uploads/')) {
      const imagePath = path.join(__dirname, '..', '..', workoutPlan.workoutPlan);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete using MongoDB _id
    await WorkoutPlan.findByIdAndDelete(workoutPlan._id);

    res.json({
      success: true,
      message: 'Workout plan request deleted successfully'
    });

  } catch (error) {
    console.error('Delete workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


// Serve uploaded images
router.get('/image/:filename', (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(__dirname, '..', '..', 'uploads', filename);
  
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }
});

module.exports = router;
