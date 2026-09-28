/**
 * MarketSphere - Product & Category Routes
 * /api/products & /api/categories
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');

// Public catalog endpoints
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/reviews', productController.getReviews);

// Protected endpoints (Sellers / Reviews)
router.post('/', authenticate, productController.createProduct);
router.put('/:id', authenticate, productController.updateProduct);
router.delete('/:id', authenticate, productController.deleteProduct);
router.post('/:id/reviews', authenticate, productController.addReview);

module.exports = router;
