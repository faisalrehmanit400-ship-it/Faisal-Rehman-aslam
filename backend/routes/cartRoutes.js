/**
 * MarketSphere - Shopping Cart & Wishlist Routes
 * /api/cart & /api/wishlist
 */

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { optionalAuth, authenticate } = require('../middleware/authMiddleware');

// Cart endpoints (supports authenticated or guest session ID)
router.get('/', optionalAuth, cartController.getCart);
router.post('/items', optionalAuth, cartController.addItem);
router.put('/items/:productId', optionalAuth, cartController.updateQuantity);
router.delete('/items/:productId', optionalAuth, cartController.removeItem);
router.delete('/', optionalAuth, cartController.clearCart);
router.post('/promo', cartController.applyPromo);

module.exports = router;
