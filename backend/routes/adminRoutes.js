/**
 * MarketSphere - Administrator Routes
 * /api/admin
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// All admin routes require both authentication and admin role
router.use(authenticate, requireAdmin);

router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/sellers', adminController.getAllSellers);
router.get('/orders', adminController.getAllOrders);
router.delete('/products/:id', adminController.deleteProductAdmin);
router.delete('/reviews/:id', adminController.deleteReviewAdmin);

module.exports = router;
