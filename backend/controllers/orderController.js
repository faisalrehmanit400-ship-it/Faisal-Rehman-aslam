/**
 * MarketSphere - Order Processing & Checkout Controller
 * Coordinates multi-vendor escrow checkout, verified database pricing, inventory deduction, and logistics tracking.
 */

const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Seller = require('../models/Seller');

const PROMO_CODES = {
  'SPHERE10': 0.10,
  'WELCOME20': 0.20,
  'GLOBAL15': 0.15
};

/**
 * Create Order / Checkout
 * POST /api/orders
 * Calculates final total using database values ONLY (never frontend prices).
 */
async function createOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      shipping_name,
      shipping_email,
      shipping_address,
      shipping_city,
      shipping_country,
      shipping_postal_code,
      payment_method = 'Credit Card (Escrow)',
      promo_code,
      currency = 'USD',
      items: incomingItems
    } = req.body;

    if (!shipping_name || !shipping_email || !shipping_address || !shipping_city) {
      return res.status(400).json({
        success: false,
        message: 'Shipping name, email, street address, and city are mandatory.'
      });
    }

    // Determine checkout items: Either from incoming items array or user's active cart
    let checkoutItems = [];
    if (Array.isArray(incomingItems) && incomingItems.length > 0) {
      checkoutItems = incomingItems;
    } else {
      const cart = await Cart.getCart(userId);
      checkoutItems = cart.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }));
    }

    if (checkoutItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot place order with an empty shopping bag.'
      });
    }

    // Server-authoritative calculation and stock verification
    let verifiedSubtotal = 0;
    const verifiedOrderItems = [];

    for (const item of checkoutItems) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ID #${item.product_id} no longer exists in marketplace catalog.`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for "${product.name}". Available stock: ${product.stock}, requested: ${item.quantity}.`
        });
      }

      const itemTotal = Number((product.price * item.quantity).toFixed(2));
      verifiedSubtotal += itemTotal;

      verifiedOrderItems.push({
        product_id: product.id,
        seller_id: product.seller_id,
        product_name: product.name,
        unit_price: product.price,
        quantity: item.quantity,
        total_price: itemTotal
      });
    }

    verifiedSubtotal = Number(verifiedSubtotal.toFixed(2));

    // Calculate promo discount if applicable
    let discountAmount = 0.00;
    const cleanPromo = (promo_code || '').toUpperCase().trim();
    if (cleanPromo && PROMO_CODES[cleanPromo]) {
      discountAmount = Number((verifiedSubtotal * PROMO_CODES[cleanPromo]).toFixed(2));
    }

    const discountedSubtotal = verifiedSubtotal - discountAmount;
    // Free shipping above $100 USD, else $12.00 flat
    const shippingFee = verifiedSubtotal > 100 ? 0.00 : 12.00;
    // 5% customs & VAT (DDP)
    const taxDuty = Number((discountedSubtotal * 0.05).toFixed(2));
    const totalAmount = Number((discountedSubtotal + shippingFee + taxDuty).toFixed(2));

    // 1. Create Order Master Record
    const order = await Order.create({
      user_id: userId,
      subtotal: verifiedSubtotal,
      shipping_fee: shippingFee,
      tax_duty: taxDuty,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      currency,
      payment_method,
      shipping_name,
      shipping_email,
      shipping_address,
      shipping_city,
      shipping_country: shipping_country || req.user.country || 'United States',
      shipping_postal_code: shipping_postal_code || ''
    });

    // 2. Insert line items and decrement stock
    for (const line of verifiedOrderItems) {
      await OrderItem.create({
        order_id: order.id,
        product_id: line.product_id,
        seller_id: line.seller_id,
        product_name: line.product_name,
        unit_price: line.unit_price,
        quantity: line.quantity,
        total_price: line.total_price
      });

      // Deduct stock from product
      await Product.decrementStock(line.product_id, line.quantity);

      // Record seller volume
      await Seller.recordSale(line.seller_id, line.total_price);
    }

    // 3. Clear user's active cart
    await Cart.clearCart(userId);

    // 4. Fetch full hydrated order
    const completedOrder = await Order.findById(order.id);

    res.status(201).json({
      success: true,
      message: 'Escrow authorization successful. Order confirmed.',
      data: completedOrder
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current customer order history
 * GET /api/orders
 */
async function getUserOrders(req, res, next) {
  try {
    const orders = await Order.findByUserId(req.user.id);
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
 * Get single order details
 * GET /api/orders/:id
 */
async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Ensure customer owns order, or is admin
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this order.'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Track shipment status by order number
 * GET /api/orders/track/:orderNumber
 */
async function trackOrder(req, res, next) {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findByOrderNumber(orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order located with this tracking reference.'
      });
    }

    res.json({
      success: true,
      data: {
        order_number: order.order_number,
        status: order.status,
        tracking_number: order.tracking_number,
        carrier: 'MarketSphere Global Air Express',
        payment_status: order.payment_status,
        destination_country: order.shipping_country,
        created_at: order.created_at,
        items_count: order.items ? order.items.length : 0
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  trackOrder
};
