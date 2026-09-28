/**
 * MarketSphere - Platform Administration Controller
 * Provides governance metrics, merchant moderation, order oversight, and catalog regulation.
 */

const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

/**
 * Get comprehensive marketplace dashboard analytics
 * GET /api/admin/stats
 */
async function getDashboardStats(req, res, next) {
  try {
    const users = await User.findAll();
    const sellers = await Seller.findAll();
    const products = await Product.findAll({ limit: 1000 });
    const orders = await Order.findAll();

    const totalGMV = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const platformCommission = Number((totalGMV * 0.045).toFixed(2));

    res.json({
      success: true,
      data: {
        total_users: users.length,
        total_sellers: sellers.length,
        total_products: products.length,
        total_orders: orders.length,
        gross_merchandise_volume: Number(totalGMV.toFixed(2)),
        platform_commission_earned: platformCommission,
        currency: 'USD',
        recent_orders: orders.slice(0, 5),
        top_sellers: sellers.slice(0, 5)
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all registered marketplace users
 * GET /api/admin/users
 */
async function getAllUsers(req, res, next) {
  try {
    const users = await User.findAll();
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all registered marketplace sellers
 * GET /api/admin/sellers
 */
async function getAllSellers(req, res, next) {
  try {
    const sellers = await Seller.findAll();
    res.json({
      success: true,
      count: sellers.length,
      data: sellers
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all platform orders
 * GET /api/admin/orders
 */
async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.findAll();
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Administrative product moderation removal
 * DELETE /api/admin/products/:id
 */
async function deleteProductAdmin(req, res, next) {
  try {
    const { id } = req.params;
    await Product.delete(id);
    res.json({
      success: true,
      message: 'Product removed from catalog by administrative moderation.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Administrative review moderation removal
 * DELETE /api/admin/reviews/:id
 */
async function deleteReviewAdmin(req, res, next) {
  try {
    const { id } = req.params;
    await Review.delete(id, null, true);
    res.json({
      success: true,
      message: 'Review deleted by administrative moderation.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllSellers,
  getAllOrders,
  deleteProductAdmin,
  deleteReviewAdmin
};
