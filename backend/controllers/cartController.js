/**
 * MarketSphere - Shopping Cart & Wishlist Controller
 * Manages server-side validated cart sessions, item quantities, discounts, and customer wishlists.
 */

const Cart = require('../models/Cart');
const Product = require('../models/Product');

// In-memory wishlist store (keyed by userId)
const memoryWishlists = {
  5: [2] // Marcus Vance has AeroTitan Watch saved
};

const PROMO_CODES = {
  'SPHERE10': 0.10,
  'WELCOME20': 0.20,
  'GLOBAL15': 0.15
};

/**
 * Get current shopping cart
 * GET /api/cart
 */
async function getCart(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || 'guest_session';

    const cart = await Cart.getCart(userId, sessionId);

    // Apply promo if query or header specifies
    const promoCode = (req.query.promo || '').toUpperCase();
    if (promoCode && PROMO_CODES[promoCode]) {
      const discountPct = PROMO_CODES[promoCode];
      const discountAmount = Number((cart.subtotal * discountPct).toFixed(2));
      cart.discount = discountAmount;
      cart.applied_promo = promoCode;
      cart.total = Number(Math.max(0, cart.total - discountAmount).toFixed(2));
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add product item to cart
 * POST /api/cart/items
 */
async function addItem(req, res, next) {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.'
      });
    }

    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || 'guest_session';

    const cart = await Cart.addItem(userId, sessionId, product_id, parseInt(quantity, 10));

    res.status(201).json({
      success: true,
      message: 'Item added to shopping bag.',
      data: cart
    });
  } catch (err) {
    if (err.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Product not found in marketplace catalog.' });
    }
    if (err.message === 'PRODUCT_OUT_OF_STOCK') {
      return res.status(400).json({ success: false, message: 'This item is currently out of stock.' });
    }
    next(err);
  }
}

/**
 * Update cart item quantity
 * PUT /api/cart/items/:productId
 */
async function updateQuantity(req, res, next) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be provided.'
      });
    }

    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || 'guest_session';

    const cart = await Cart.updateQuantity(userId, sessionId, productId, parseInt(quantity, 10));

    res.json({
      success: true,
      message: 'Cart updated.',
      data: cart
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Remove an item from cart
 * DELETE /api/cart/items/:productId
 */
async function removeItem(req, res, next) {
  try {
    const { productId } = req.params;
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || 'guest_session';

    const cart = await Cart.removeItem(userId, sessionId, productId);

    res.json({
      success: true,
      message: 'Item removed from shopping bag.',
      data: cart
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Clear entire cart
 * DELETE /api/cart
 */
async function clearCart(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || 'guest_session';

    const cart = await Cart.clearCart(userId, sessionId);

    res.json({
      success: true,
      message: 'Shopping bag cleared.',
      data: cart
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Validate and apply promotional code
 * POST /api/cart/promo
 */
async function applyPromo(req, res) {
  const { code } = req.body;
  const cleanCode = (code || '').toUpperCase().trim();

  if (PROMO_CODES[cleanCode]) {
    return res.json({
      success: true,
      message: `Promo code ${cleanCode} applied (${PROMO_CODES[cleanCode] * 100}% off)!`,
      data: {
        code: cleanCode,
        discount_percent: PROMO_CODES[cleanCode]
      }
    });
  }

  return res.status(400).json({
    success: false,
    message: 'Invalid or expired promotional code. Try SPHERE10 or WELCOME20.'
  });
}

// ==============================================================================
// WISHLIST ENDPOINTS
// ==============================================================================

/**
 * Get user wishlist
 * GET /api/wishlist
 */
async function getWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const productIds = memoryWishlists[userId] || [];

    const products = [];
    for (const pid of productIds) {
      const p = await Product.findById(pid);
      if (p) products.push(p);
    }

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
 * Add product to wishlist
 * POST /api/wishlist
 */
async function addToWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    if (!memoryWishlists[userId]) memoryWishlists[userId] = [];
    const pid = Number(product_id);

    if (!memoryWishlists[userId].includes(pid)) {
      memoryWishlists[userId].push(pid);
    }

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Remove product from wishlist
 * DELETE /api/wishlist/:productId
 */
async function removeFromWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (memoryWishlists[userId]) {
      memoryWishlists[userId] = memoryWishlists[userId].filter((id) => id !== Number(productId));
    }

    res.json({
      success: true,
      message: 'Product removed from wishlist.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  applyPromo,
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
