// const express = require('express');
// const Cart = require('../models/Cart');
// const Product = require('../models/Product');
// const auth = require('../middlewares/auth');
// const cors = require('cors');

// const router = express.Router();

// // Add or update item in cart
// router.use(cors({ origin: 'http://localhost:3000' }));
// router.post('/add', auth, async (req, res) => {
//   try {
//     const { productId, quantity } = req.body;
//     const userId = req.user._id;

//     if (!productId || quantity <= 0) {
//       return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
//     }

//     const product = await Product.findById(productId);
//     if (!product || !product.isActive) {
//       return res.status(404).json({ success: false, message: 'Product not found or inactive' });
//     }

//     let cart = await Cart.findOne({ user: userId });

//     if (!cart) {
//       cart = new Cart({ user: userId, items: [] });
//     }

//     const existingItem = cart.items.find(item => item.product.toString() === productId);

//     if (existingItem) {
//       existingItem.quantity += quantity;
//     } else {
//       cart.items.push({ product: productId, quantity });
//     }

//     await cart.save();

//     res.json({ success: true, message: 'Cart updated successfully', data: cart });

//   } catch (err) {
//     console.error('Add to cart error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Get cart
// router.get('/', auth, async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

//     if (!cart) {
//       return res.json({ success: true, message: 'Cart is empty', data: { items: [] } });
//     }

//     res.json({ success: true, message: 'Cart retrieved', data: cart });

//   } catch (err) {
//     console.error('Get cart error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Update item quantity
// router.put('/update/:productId', auth, async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { quantity } = req.body;

//     if (quantity <= 0) {
//       return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
//     }

//     const cart = await Cart.findOne({ user: req.user._id });

//     if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

//     const item = cart.items.find(i => i.product.toString() === productId);
//     if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

//     item.quantity = quantity; // ✅ overwrite instead of add
//     await cart.save();

//     const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');

//     res.json({ success: true, message: 'Quantity updated', data: updatedCart });

//   } catch (err) {
//     console.error('Update quantity error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });


// // Remove item from cart
// router.delete('/remove/:productId', auth, async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const cart = await Cart.findOne({ user: req.user._id });

//     if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

//     cart.items = cart.items.filter(item => item.product.toString() !== productId);
//     await cart.save();

//     res.json({ success: true, message: 'Item removed', data: cart });

//   } catch (err) {
//     console.error('Remove cart item error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Clear entire cart
// router.delete('/clear', auth, async (req, res) => {
//   try {
//     await Cart.findOneAndDelete({ user: req.user._id });
//     res.json({ success: true, message: 'Cart cleared' });
//   } catch (err) {
//     console.error('Clear cart error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// module.exports = router;

const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middlewares/auth');
const cors = require('cors');

const router = express.Router();

// Enable CORS for frontend
router.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Add or update item in cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id; // always use _id from verified token

    if (!productId || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or inactive' });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // Populate product details before sending
    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');

    res.json({ success: true, message: 'Cart updated successfully', data: updatedCart });

  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      return res.json({ success: true, message: 'Cart is empty', data: { items: [] } });
    }

    res.json({ success: true, message: 'Cart retrieved', data: cart });

  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update item quantity
router.put('/update/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    res.json({ success: true, message: 'Quantity updated', data: updatedCart });

  } catch (err) {
    console.error('Update quantity error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    res.json({ success: true, message: 'Item removed', data: updatedCart });

  } catch (err) {
    console.error('Remove cart item error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Clear entire cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    await Cart.findOneAndDelete({ user: userId });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
