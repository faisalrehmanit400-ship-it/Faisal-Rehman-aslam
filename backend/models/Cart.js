/**
 * MarketSphere - Cart Model
 * Server-authoritative shopping cart with live database pricing, inventory checking, and fee computation.
 */

const db = require('../config/database');
const Product = require('./Product');

// In-memory cart store indexed by userId or sessionId
// key: `user_${userId}` or `session_${sessionId}` -> array of { product_id, quantity }
const memoryCarts = {
  'user_5': [
    { product_id: 1, quantity: 1 },
    { product_id: 3, quantity: 2 }
  ]
};

class Cart {
  static getCartKey(userId, sessionId) {
    if (userId) return `user_${userId}`;
    return `session_${sessionId || 'guest'}`;
  }

  static async getCart(userId, sessionId) {
    const key = this.getCartKey(userId, sessionId);
    const rawItems = memoryCarts[key] || [];

    let subtotal = 0;
    const items = [];

    for (const item of rawItems) {
      const prod = await Product.findById(item.product_id);
      if (prod) {
        // Enforce maximum available stock
        const effectiveQty = Math.min(item.quantity, prod.stock);
        const itemTotal = Number((prod.price * effectiveQty).toFixed(2));
        subtotal += itemTotal;

        items.push({
          product_id: prod.id,
          name: prod.name,
          price: prod.price,
          image: prod.image,
          stock: prod.stock,
          seller_name: prod.seller_name,
          quantity: effectiveQty,
          total_price: itemTotal
        });
      }
    }

    subtotal = Number(subtotal.toFixed(2));
    // Free shipping above $100 USD, else $12.00 flat international DDP
    const shipping = subtotal > 100 || subtotal === 0 ? 0.00 : 12.00;
    // Estimated 5% VAT / customs duty
    const tax_duty = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + shipping + tax_duty).toFixed(2));

    return {
      items,
      item_count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      shipping,
      tax_duty,
      total
    };
  }

  static async addItem(userId, sessionId, productId, quantity = 1) {
    const prod = await Product.findById(productId);
    if (!prod) {
      throw new Error('PRODUCT_NOT_FOUND');
    }
    if (prod.stock <= 0) {
      throw new Error('PRODUCT_OUT_OF_STOCK');
    }

    const key = this.getCartKey(userId, sessionId);
    if (!memoryCarts[key]) memoryCarts[key] = [];

    const existing = memoryCarts[key].find((i) => i.product_id === Number(productId));
    if (existing) {
      const targetQty = existing.quantity + quantity;
      if (targetQty > prod.stock) {
        existing.quantity = prod.stock;
      } else {
        existing.quantity = targetQty;
      }
    } else {
      memoryCarts[key].push({
        product_id: Number(productId),
        quantity: Math.min(quantity, prod.stock)
      });
    }

    return this.getCart(userId, sessionId);
  }

  static async updateQuantity(userId, sessionId, productId, quantity) {
    const prod = await Product.findById(productId);
    if (!prod) throw new Error('PRODUCT_NOT_FOUND');

    const key = this.getCartKey(userId, sessionId);
    if (!memoryCarts[key]) return this.getCart(userId, sessionId);

    if (quantity <= 0) {
      return this.removeItem(userId, sessionId, productId);
    }

    const existing = memoryCarts[key].find((i) => i.product_id === Number(productId));
    if (existing) {
      existing.quantity = Math.min(quantity, prod.stock);
    }

    return this.getCart(userId, sessionId);
  }

  static async removeItem(userId, sessionId, productId) {
    const key = this.getCartKey(userId, sessionId);
    if (memoryCarts[key]) {
      memoryCarts[key] = memoryCarts[key].filter((i) => i.product_id !== Number(productId));
    }
    return this.getCart(userId, sessionId);
  }

  static async clearCart(userId, sessionId) {
    const key = this.getCartKey(userId, sessionId);
    memoryCarts[key] = [];
    return this.getCart(userId, sessionId);
  }
}

module.exports = Cart;
