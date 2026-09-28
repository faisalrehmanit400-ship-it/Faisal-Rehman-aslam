/**
 * MarketSphere - Product & Category Controller
 * Handles product listing, filtering, search, seller catalog management, and reviews.
 */

const Product = require('../models/Product');
const Seller = require('../models/Seller');
const Review = require('../models/Review');

/**
 * Get all products with search, category filter, and sorting
 * GET /api/products
 */
async function getAllProducts(req, res, next) {
  try {
    const { search, category, sort = 'featured', limit = 50, offset = 0, flash } = req.query;

    const products = await Product.findAll({
      search: search || '',
      category: category || '',
      sort,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      flash
    });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single product by ID
 * GET /api/products/:id
 */
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Attach recent customer reviews
    const reviews = await Review.findByProductId(id);

    res.json({
      success: true,
      data: {
        ...product,
        reviews
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all marketplace categories
 * GET /api/categories
 */
async function getCategories(req, res, next) {
  try {
    const categories = await Product.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new product (Seller only)
 * POST /api/products
 */
async function createProduct(req, res, next) {
  try {
    const { name, category_id, description, price, old_price, discount, stock, image, specifications } = req.body;

    if (!name || !category_id || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, category_id, and price are required.'
      });
    }

    // Lookup seller profile for this user
    let seller = await Seller.findByUserId(req.user.id);
    if (!seller && req.user.role === 'admin') {
      // Admin fallback to seller #1
      seller = await Seller.findById(1);
    }

    if (!seller) {
      return res.status(403).json({
        success: false,
        message: 'Only registered sellers can publish products. Please create a seller profile first.'
      });
    }

    const product = await Product.create({
      seller_id: seller.id,
      category_id,
      name,
      description: description || '',
      price: parseFloat(price),
      old_price: old_price ? parseFloat(old_price) : null,
      discount: discount ? parseInt(discount, 10) : 0,
      stock: stock !== undefined ? parseInt(stock, 10) : 10,
      image: image || './assets/images/hero.jpg',
      specifications
    });

    res.status(201).json({
      success: true,
      message: 'Product published successfully to the marketplace.',
      data: product
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing product (Owner seller or Admin only)
 * PUT /api/products/:id
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await Product.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Authorization check: Must be owner seller or platform admin
    if (req.user.role !== 'admin') {
      const seller = await Seller.findByUserId(req.user.id);
      if (!seller || seller.id !== existing.seller_id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized. You can only modify your own store products.'
        });
      }
    }

    const updated = await Product.update(id, req.body);

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a product (Owner seller or Admin only)
 * DELETE /api/products/:id
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await Product.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (req.user.role !== 'admin') {
      const seller = await Seller.findByUserId(req.user.id);
      if (!seller || seller.id !== existing.seller_id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized. You cannot delete another vendor’s products.'
        });
      }
    }

    await Product.delete(id);

    res.json({
      success: true,
      message: 'Product removed from marketplace catalog.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Product Reviews: Add Review
 * POST /api/products/:id/reviews
 */
async function addReview(req, res, next) {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment text are required.'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const review = await Review.create({
      product_id: id,
      user_id: req.user.id,
      user_name: req.user.name,
      rating: parseInt(rating, 10),
      title: title || '',
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your verified review has been submitted.',
      data: review
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Product Reviews: Get Reviews
 * GET /api/products/:id/reviews
 */
async function getReviews(req, res, next) {
  try {
    const { id } = req.params;
    const reviews = await Review.findByProductId(id);
    res.json({
      success: true,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getReviews
};
