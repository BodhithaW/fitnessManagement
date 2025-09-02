// const express = require('express');
// const Product = require('../models/Product');
// const auth = require('../middlewares/auth');
// const upload = require('../middlewares/upload');
// const fs = require('fs');
// const path = require('path');
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

// // ADMIN ROUTES (Protected + Admin Only)

// // Add new product (Admin Only)
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.post('/', auth, isAdmin, async (req, res) => {
//   try {
//     const { name, description, price, category, stock, image } = req.body;

//     if (!image) {
//       return res.status(400).json({
//         success: false,
//         message: 'Product image is required'
//       });
//     }

//     //validate that image is a valid URL or base64 string
//     if (!image.startsWith('data:image/')) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid image format. Must be a base64 encoded image string.'
//       });
//     }

//     const product = new Product({
//       name,
//       description,
//       price: parseFloat(price),
//       category,
//       stock: parseInt(stock) || 0,
//       image: image, // Store base64 string directly
//       createdBy: req.user._id
//     });

//     console.log('Storing image as base64 string . Image length:', image.length);

//     await product.save();

//     res.status(201).json({
//       success: true,
//       message: 'Product added successfully',
//       data: {
//         product
//       }
//     });

//   } catch (error) {
//     console.error('Add product error:', error);
    
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

// // Update product (Admin Only)
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.put('/:productId', auth, isAdmin, async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { name, description, price, category, stock, isActive, image } = req.body;

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found'
//       });
//     }

//     const updates = {};
//     if (name) updates.name = name;
//     if (description) updates.description = description;
//     if (price) updates.price = parseFloat(price);
//     if (category) updates.category = category;
//     if (stock !== undefined) updates.stock = parseInt(stock);
//     if (isActive !== undefined) updates.isActive = isActive;

//     // Handle image update
//     if (image) {
//       //validate that image is a valid URL or base64 string
//       if (!image.startsWith('data:image/')) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid image format. Must be a base64 encoded image string.'
//         });
//       }
//       updates.image = image; // Store base64 string directly
//     }
   

//     const updatedProduct = await Product.findByIdAndUpdate(
//       productId,
//       updates,
//       { new: true, runValidators: true }
//     );

//     res.json({
//       success: true,
//       message: 'Product updated successfully',
//       data: {
//         product: updatedProduct
//       }
//     });

//   } catch (error) {
//     console.error('Update product error:', error);
    
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

// // Delete product (Admin Only)
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.delete('/:productId', auth, isAdmin, async (req, res) => {
//   try {
//     const { productId } = req.params;

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found'
//       });
//     }

//     await Product.findByIdAndDelete(productId);

//     res.json({
//       success: true,
//       message: 'Product deleted successfully',
//       data: {
//         deletedProduct: {
//           id: product._id,
//           name: product.name
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Delete product error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

//     // Delete image file
// //     if (product.image && product.image !== '/uploads/products/default.jpg') {
// //       const imagePath = path.join(__dirname, '../../', product.image);
// //       if (fs.existsSync(imagePath)) {
// //         fs.unlinkSync(imagePath);
// //       }
// //     }

// //     await Product.findByIdAndDelete(productId);

// //     res.json({
// //       success: true,
// //       message: 'Product deleted successfully',
// //       data: {
// //         deletedProduct: {
// //           id: product._id,
// //           name: product.name
// //         }
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Delete product error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Internal server error'
// //     });
// //   }
// // });

// // Get all products (Admin Only - includes inactive)
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.get('/admin/all', auth, isAdmin, async (req, res) => {
//   try {
//     const { page = 1, limit = 10, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

//     const query = {};
    
//     // Filter by category
//     if (category) {
//       query.category = category;
//     }

//     // Search functionality
//     if (search) {
//       query.$text = { $search: search };
//     }

//     // Sorting
//     const sortOptions = {};
//     sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

//     const skip = (parseInt(page) - 1) * parseInt(limit);
    
//     const products = await Product.find(query)
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(parseInt(limit))
//       .populate('createdBy', 'name userId');

//     const total = await Product.countDocuments(query);

//     res.json({
//       success: true,
//       message: 'Products retrieved successfully',
//       data: {
//         products,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(total / parseInt(limit)),
//           totalProducts: total,
//           productsPerPage: parseInt(limit)
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get admin products error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Get single product (Admin Only)
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.get('/admin/:productId', auth, isAdmin, async (req, res) => {
//   try {
//     const { productId } = req.params;

//     const product = await Product.findById(productId)
//       .populate('createdBy', 'name userId');

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Product retrieved successfully',
//       data: {
//         product
//       }
//     });

//   } catch (error) {
//     console.error('Get admin product error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // USER ROUTES (Public/Protected)

// // Get all active products (Public)
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.get('/', async (req, res) => {
//   try {
//     const { page = 1, limit = 12, category, search, sortBy = 'createdAt', sortOrder = 'desc', minPrice, maxPrice } = req.query;

//     const query = { isActive: true };
    
//     // Filter by category
//     if (category) {
//       query.category = category;
//     }

//     // Price range filter
//     if (minPrice || maxPrice) {
//       query.price = {};
//       if (minPrice) query.price.$gte = parseFloat(minPrice);
//       if (maxPrice) query.price.$lte = parseFloat(maxPrice);
//     }

//     // Search functionality
//     if (search) {
//       query.$text = { $search: search };
//     }

//     // Sorting
//     const sortOptions = {};
//     sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

//     const skip = (parseInt(page) - 1) * parseInt(limit);
    
//     const products = await Product.find(query)
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(parseInt(limit))
//       .select('-createdBy -__v');

//       //debug: Log image info
//       console.log('Products found:', products.length);
//       products.forEach(product => {
//         console.log(`Product: ${product.name}, Image type: base64, Length: ${product.image ? product.image.length : 0}`);
//         });

//     const total = await Product.countDocuments(query);

//     res.json({
//       success: true,
//       message: 'Products retrieved successfully',
//       data: {
//         products,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(total / parseInt(limit)),
//           totalProducts: total,
//           productsPerPage: parseInt(limit)
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get products error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Get single product (Public)
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.get('/:productId', async (req, res) => {
//   try {
//     const { productId } = req.params;

//     const product = await Product.findById(productId)
//       .select('-createdBy -__v');

//     if (!product || !product.isActive) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Product retrieved successfully',
//       data: {
//         product
//       }
//     });

//   } catch (error) {
//     console.error('Get product error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Get product categories (Public)
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.get('/categories/list', async (req, res) => {
//   try {
//     const categories = await Product.distinct('category', { isActive: true });
    
//     res.json({
//       success: true,
//       message: 'Categories retrieved successfully',
//       data: {
//         categories
//       }
//     });

//   } catch (error) {
//     console.error('Get categories error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// module.exports = router;

const express = require('express');
const Product = require('../models/Product');
const auth = require('../middlewares/auth');
const cors = require('cors');

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

// ADMIN ROUTES (Protected + Admin Only)

// Add new product (Admin Only)
router.use(cors({ origin: 'http://localhost:3000' }));
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Product image is required'
      });
    }

    // Validate that image is base64
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Please provide a valid base64 image.'
      });
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock) || 0,
      image: image, // Store base64 image data directly
      createdBy: req.user._id
    });

    console.log('Storing product with base64 image. Image length:', image.length);

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: {
        product
      }
    });

  } catch (error) {
    console.error('Add product error:', error);
    
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

// Update product (Admin Only)
router.use(cors({ origin: 'http://localhost:3000' }));
router.put('/:productId', auth, isAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, category, stock, isActive, image } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (price) updates.price = parseFloat(price);
    if (category) updates.category = category;
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (isActive !== undefined) updates.isActive = isActive;

    // Handle image update
    if (image) {
      // Validate that image is base64
      if (!image.startsWith('data:image/')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image format. Please provide a valid base64 image.'
        });
      }
      updates.image = image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: updatedProduct
      }
    });

  } catch (error) {
    console.error('Update product error:', error);
    
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

// Delete product (Admin Only)
router.use(cors({ origin: 'http://localhost:3000' }));
router.delete('/:productId', auth, isAdmin, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(productId);

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        deletedProduct: {
          id: product._id,
          name: product.name
        }
      }
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all products (Admin Only - includes inactive)
router.use(cors({ origin: 'http://localhost:3000' }));
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name userId');

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProducts: total,
          productsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single product (Admin Only)
router.use(cors({ origin: 'http://localhost:3000' }));
router.get('/admin/:productId', auth, isAdmin, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate('createdBy', 'name userId');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: {
        product
      }
    });

  } catch (error) {
    console.error('Get admin product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// USER ROUTES (Public/Protected)

// Get all active products (Public)
router.use(cors({ origin: 'http://localhost:3000' }));
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, sortBy = 'createdAt', sortOrder = 'desc', minPrice, maxPrice } = req.query;

    const query = { isActive: true };
    
    // Filter by category
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-createdBy -__v');

    // Debug: Log image info
    console.log('Products found:', products.length);
    products.forEach(product => {
      console.log(`Product: ${product.name}, Image type: base64, Length: ${product.image ? product.image.length : 0}`);
    });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProducts: total,
          productsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single product (Public)
router.use(cors({ origin: 'http://localhost:3000' }));
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .select('-createdBy -__v');

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: {
        product
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get product categories (Public)
router.use(cors({ origin: 'http://localhost:3000' }));
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
