// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const auth = require('../middlewares/auth');
// const cors = require('cors');

// const router = express.Router();

// // Admin middleware to check if user is admin
// const isAdmin = async (req, res, next) => {
//   try {
//     if (req.user.userId !== '0001') { // First user (0001) is admin
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Admin privileges required.'
//       });
//     }
//     next();
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // User Registration
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, address, postalCode, password } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User with this email already exists'
//       });
//     }

//     // Hash password
//     const saltRounds = 12;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Create new user
//     const user = new User({
//       name,
//       email,
//       address,
//       postalCode,
//       password: hashedPassword
//     });

//     await user.save();

//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       data: {
//         user: user.toJSON(),
//         token
//       }
//     });

//   } catch (error) {
//     console.error('Registration error:', error);
    
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation error',
//         errors: Object.values(error.errors).map(err => err.message)
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // User Login
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }

//     // Check password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.json({
//       success: true,
//       message: 'Login successful',
//       data: {
//         user: user.toJSON(),
//         token
//       }
//     });

//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Get All Users (Admin Only)
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.get('/users', auth, isAdmin, async (req, res) => {
//   try {
//     const users = await User.find({}).select('-password');
    
//     res.json({
//       success: true,
//       message: 'Users retrieved successfully',
//       data: {
//         users,
//         total: users.length
//       }
//     });
//   } catch (error) {
//     console.error('Get users error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Delete User (Admin Only)
// router.delete('/users/:userId', auth, isAdmin, async (req, res) => {
//   try {
//     const { userId } = req.params;
    
//     // Prevent admin from deleting themselves
//     if (userId === '0001') {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot delete admin user'
//       });
//     }

//     const user = await User.findOneAndDelete({ userId });
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'User deleted successfully',
//       data: {
//         deletedUser: {
//           userId: user.userId,
//           name: user.name,
//           email: user.email
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Delete user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Get User by Token (Current User)
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.get('/me', auth, async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       message: 'User retrieved successfully',
//       data: {
//         user: req.user
//       }
//     });
//   } catch (error) {
//     console.error('Get user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Get User Profile (Protected Route)
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.get('/profile', auth, async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       data: {
//         user: req.user
//       }
//     });
//   } catch (error) {
//     console.error('Get profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Update User Profile (Protected Route)
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.put('/profile', auth, async (req, res) => {
//   try {
//     const { name, address, postalCode } = req.body;
//     const updates = {};

//     if (name) updates.name = name;
//     if (address) updates.address = address;
//     if (postalCode) updates.postalCode = postalCode;

//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       updates,
//       { new: true, runValidators: true }
//     );

//     res.json({
//       success: true,
//       message: 'Profile updated successfully',
//       data: {
//         user: user.toJSON()
//       }
//     });

//   } catch (error) {
//     console.error('Update profile error:', error);
    
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation error',
//         errors: Object.values(error.errors).map(err => err.message)
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Change Password (Protected Route)
// router.put('/change-password', auth, async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;

//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'Current password and new password are required'
//       });
//     }

//     // Verify current password
//     const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.password);
//     if (!isCurrentPasswordValid) {
//       return res.status(400).json({
//         success: false,
//         message: 'Current password is incorrect'
//       });
//     }

//     // Hash new password
//     const saltRounds = 12;
//     const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

//     // Update password
//     await User.findByIdAndUpdate(req.user._id, { password: hashedNewPassword });

//     res.json({
//       success: true,
//       message: 'Password changed successfully'
//     });

//   } catch (error) {
//     console.error('Change password error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middlewares/auth');
const cors = require('cors');

const router = express.Router();

// CORS (allow frontend at localhost:3000)
router.use(cors({ origin: 'http://localhost:3000', credentials: true }));

/**
 * Admin middleware
 * First registered user (with email hard-coded OR special flag) is admin
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || String(req.user._id) !== "0001") {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString() }, // ✅ always _id
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * User Registration
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, address, postalCode, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      address,
      postalCode,
      password: hashedPassword
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: user.toJSON(), token }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * User Login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: user.toJSON(), token }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Get All Users (Admin only)
 */
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: { users, total: users.length }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Delete User (Admin only)
 */
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === "0001") {
      return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: { userId: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Get Current User (by token)
 */
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: { user: req.user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Update User Profile
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, address, postalCode } = req.body;
    const updates = { name, address, postalCode };

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toJSON() }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Change Password
 */
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.user._id, { password: hashedNewPassword });

    res.json({ success: true, message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
