const express = require('express');
const BMI = require('../models/BMI');
const auth = require('../middlewares/auth');

const router = express.Router();

// Calculate BMI value
const calculateBMI = (weight, height) => {
  // Height should be in meters, weight in kg
  const heightInMeters = height / 100; // Convert cm to meters
  return (weight / (heightInMeters * heightInMeters)).toFixed(2);
};

// Create new BMI record
router.post('/calculate', auth, async (req, res) => {
  try {
    const { age, gender, height, weight, healthConditions } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!age || !height || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Age, height, and weight are required'
      });
    }

    // Calculate BMI value
    const bmiValue = parseFloat(calculateBMI(weight, height));
    
    // Calculate BMI feedback
    let bmiFeedback = 'PENDING';
    if (bmiValue < 18.5) {
      bmiFeedback = 'UNDERWEIGHT';
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      bmiFeedback = 'NORMAL';
    } else if (bmiValue >= 25 && bmiValue < 30) {
      bmiFeedback = 'OVERWEIGHT';
    } else {
      bmiFeedback = 'OBESE';
    }

    // Create new BMI record
    const bmiRecord = new BMI({
      userId,
      age,
      gender,
      height,
      weight,
      bmiValue,
      healthConditions: healthConditions || '',
      bmiFeedback
    });

    await bmiRecord.save();

    res.status(201).json({
      success: true,
      message: 'BMI calculated and saved successfully',
      data: {
        bmi: bmiRecord
      }
    });

  } catch (error) {
    console.error('BMI calculation error:', error);
    
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

// Get user's BMI records by token
router.get('/my-bmi', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const bmiRecords = await BMI.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'BMI records retrieved successfully',
      data: {
        bmiRecords,
        total: bmiRecords.length
      }
    });

  } catch (error) {
    console.error('Get user BMI error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all BMI records (Admin only)
router.get('/all', auth, async (req, res) => {
  try {
    // Check if user is admin (userId = '0001')
    if (req.user.userId !== '0001') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const bmiRecords = await BMI.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'All BMI records retrieved successfully',
      data: {
        bmiRecords,
        total: bmiRecords.length
      }
    });

  } catch (error) {
    console.error('Get all BMI error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update BMI feedback by token
router.put('/feedback/:bmiId', auth, async (req, res) => {
  try {
    const { bmiId } = req.params;
    const { bmiFeedback } = req.body;
    const userId = req.user.userId;

    // Validate bmiFeedback
    const validFeedbacks = ['PENDING', 'UNDERWEIGHT', 'NORMAL', 'OVERWEIGHT', 'OBESE'];
    if (!validFeedbacks.includes(bmiFeedback)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid BMI feedback. Must be one of: PENDING, UNDERWEIGHT, NORMAL, OVERWEIGHT, OBESE'
      });
    }

    // Find and update BMI record
    const bmiRecord = await BMI.findOneAndUpdate(
      { id: bmiId, userId }, // Only allow user to update their own records
      { bmiFeedback },
      { new: true, runValidators: true }
    );

    if (!bmiRecord) {
      return res.status(404).json({
        success: false,
        message: 'BMI record not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'BMI feedback updated successfully',
      data: {
        bmi: bmiRecord
      }
    });

  } catch (error) {
    console.error('Update BMI feedback error:', error);
    
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

// Get specific BMI record by ID
router.get('/:bmiId', auth, async (req, res) => {
  try {
    const { bmiId } = req.params;
    const userId = req.user.userId;

    const bmiRecord = await BMI.findOne({ id: bmiId, userId });

    if (!bmiRecord) {
      return res.status(404).json({
        success: false,
        message: 'BMI record not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'BMI record retrieved successfully',
      data: {
        bmi: bmiRecord
      }
    });

  } catch (error) {
    console.error('Get BMI record error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


//update
// Update an existing BMI record and recalculate BMI
router.put('/update/:bmiId', auth, async (req, res) => {
  try {
    const { bmiId } = req.params;
    const userId = req.user.userId;
    const { age, gender, height, weight, healthConditions } = req.body;

    // Validate input
    if (!age || !height || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Age, height, and weight are required for update'
      });
    }

    // Recalculate BMI
    const bmiValue = parseFloat(calculateBMI(weight, height));
    let bmiFeedback = 'PENDING';
    if (bmiValue < 18.5) {
      bmiFeedback = 'UNDERWEIGHT';
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      bmiFeedback = 'NORMAL';
    } else if (bmiValue >= 25 && bmiValue < 30) {
      bmiFeedback = 'OVERWEIGHT';
    } else {
      bmiFeedback = 'OBESE';
    }

    // Update record
    const updatedBMI = await BMI.findOneAndUpdate(
      { id: bmiId, userId },
      {
        age,
        height,
        gender,
        weight,
        healthConditions: healthConditions || '',
        bmiValue,
        bmiFeedback
      },
      { new: true, runValidators: true }
    );

    if (!updatedBMI) {
      return res.status(404).json({
        success: false,
        message: 'BMI record not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'BMI record updated successfully',
      data: {
        bmi: updatedBMI
      }
    });

  } catch (error) {
    console.error('Update BMI error:', error);
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


// Delete BMI record
router.delete('/:bmiId', auth, async (req, res) => {
  try {
    const { bmiId } = req.params;
    const userId = req.user.userId;

    const bmiRecord = await BMI.findOneAndDelete({ id: bmiId, userId });

    if (!bmiRecord) {
      return res.status(404).json({
        success: false,
        message: 'BMI record not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'BMI record deleted successfully',
      data: {
        deletedBMI: {
          id: bmiRecord.id,
          bmiValue: bmiRecord.bmiValue,
          bmiFeedback: bmiRecord.bmiFeedback
        }
      }
    });

  } catch (error) {
    console.error('Delete BMI record error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
