/**
 * MarketSphere - Multi-Vendor Seller Routes
 * /api/sellers
 */

const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { authenticate } = require('../middleware/authMiddleware');

// Public seller storefront profile
router.get('/:id', sellerController.getSellerProfile);

// Protected seller management
router.post('/register', authenticate, sellerController.registerSeller);
router.get('/me/dashboard', authenticate, sellerController.getMyStore);
router.put('/me', authenticate, sellerController.updateSellerProfile);
router.get('/me/orders', authenticate, sellerController.getSellerOrders);
router.put('/orders/:orderId/status', authenticate, sellerController.updateOrderStatus);

module.exports = router;
