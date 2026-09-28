/**
 * MarketSphere - Order & Logistics Routes
 * /api/orders
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');

// Public tracking
router.get('/track/:orderNumber', orderController.trackOrder);

// Protected customer order management
router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, orderController.getUserOrders);
router.get('/:id', authenticate, orderController.getOrderById);

module.exports = router;
