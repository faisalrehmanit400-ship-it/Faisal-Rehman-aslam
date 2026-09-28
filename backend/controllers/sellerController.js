/**
 * MarketSphere - Multi-Vendor Seller Controller
 * Enables merchant onboarding, storefront management, inventory oversight, and order fulfillment.
 */

const Seller = require('../models/Seller');
const Product = require('../models/Product');
const OrderItem = require('../models/OrderItem');
const Order = require('../models/Order');
const User = require('../models/User');

/**
 * Register as a seller and establish storefront
 * POST /api/sellers/register
 */
async function registerSeller(req, res, next) {
  try {
    const { store_name, business_name, description, country } = req.body;

    if (!store_name || !business_name) {
      return res.status(400).json({
        success: false,
        message: 'Store name and legal business name are required.'
      });
    }

    const existingUserSeller = await Seller.findByUserId(req.user.id);
    if (existingUserSeller) {
      return res.status(409).json({
        success: false,
        message: 'You already possess an active merchant storefront on MarketSphere.'
      });
    }

    const existingStoreName = await Seller.findByStoreName(store_name);
    if (existingStoreName) {
      return res.status(409).json({
        success: false,
        message: 'This store name is already registered by another vendor.'
      });
    }

    const seller = await Seller.create({
      user_id: req.user.id,
      store_name,
      business_name,
      description: description || '',
      country: country || req.user.country || 'International'
    });

    // Update user role to seller
    await User.updateRole(req.user.id, 'seller');

    res.status(201).json({
      success: true,
      message: 'Merchant storefront established successfully. Welcome to MarketSphere!',
      data: seller
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get public profile of a seller
 * GET /api/sellers/:id
 */
async function getSellerProfile(req, res, next) {
  try {
    const { id } = req.params;
    const seller = await Seller.findById(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller storefront not found.'
      });
    }

    // Attach products from this seller
    const products = await Product.findBySellerId(id);

    res.json({
      success: true,
      data: {
        ...seller,
        products
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current authenticated seller profile
 * GET /api/sellers/me/dashboard
 */
async function getMyStore(req, res, next) {
  try {
    const seller = await Seller.findByUserId(req.user.id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'No seller profile associated with this account. Please register as a vendor.'
      });
    }

    const products = await Product.findBySellerId(seller.id);
    const orderItems = await OrderItem.findBySellerId(seller.id);

    // Compute sales statistics
    const totalRevenue = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    const lowStockItems = products.filter((p) => p.stock <= 5);

    res.json({
      success: true,
      data: {
        seller,
        stats: {
          total_products: products.length,
          total_orders: orderItems.length,
          total_revenue: Number(totalRevenue.toFixed(2)),
          low_stock_count: lowStockItems.length,
          average_rating: seller.rating
        },
        products,
        recent_orders: orderItems.slice(0, 10)
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update authenticated seller storefront settings
 * PUT /api/sellers/me
 */
async function updateSellerProfile(req, res, next) {
  try {
    const seller = await Seller.findByUserId(req.user.id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller profile not found.'
      });
    }

    const { store_name, business_name, description, country, logo_url, banner_url } = req.body;
    const updated = await Seller.update(seller.id, {
      store_name,
      business_name,
      description,
      country,
      logo_url,
      banner_url
    });

    res.json({
      success: true,
      message: 'Storefront details updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get orders pertaining to the authenticated seller
 * GET /api/sellers/me/orders
 */
async function getSellerOrders(req, res, next) {
  try {
    const seller = await Seller.findByUserId(req.user.id);
    if (!seller) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own a seller storefront.'
      });
    }

    const orderItems = await OrderItem.findBySellerId(seller.id);

    res.json({
      success: true,
      count: orderItems.length,
      data: orderItems
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update fulfillment status for an order
 * PUT /api/sellers/orders/:orderId/status
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Verify seller has items in this order, or is admin
    if (req.user.role !== 'admin') {
      const seller = await Seller.findByUserId(req.user.id);
      if (!seller) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }
      const hasItem = order.items && order.items.some((i) => i.seller_id === seller.id);
      if (!hasItem) {
        return res.status(403).json({ success: false, message: 'You have no items in this order.' });
      }
    }

    const updated = await Order.updateStatus(orderId, status);

    res.json({
      success: true,
      message: `Order #${order.order_number} status updated to ${status}.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerSeller,
  getSellerProfile,
  getMyStore,
  updateSellerProfile,
  getSellerOrders,
  updateOrderStatus
};
