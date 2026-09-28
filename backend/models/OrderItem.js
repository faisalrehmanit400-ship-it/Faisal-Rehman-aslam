/**
 * MarketSphere - Order Item Model
 * Represents individual multi-vendor line items associated with an order.
 */

const db = require('../config/database');

const memoryOrderItems = [
  {
    id: 1,
    order_id: 1,
    product_id: 1,
    seller_id: 1,
    product_name: 'StudioMaster Pro ANC Over-Ear Wireless Headphones',
    unit_price: 249.99,
    quantity: 1,
    total_price: 249.99,
    created_at: new Date()
  },
  {
    id: 2,
    order_id: 1,
    product_id: 3,
    seller_id: 3,
    product_name: 'Botanique Phyto-Renew Peptide Face Elixir (50ml)',
    unit_price: 64.00,
    quantity: 2,
    total_price: 128.00,
    created_at: new Date()
  }
];

class OrderItem {
  static async findByOrderId(orderId) {
    try {
      const rows = await db.query(
        `SELECT oi.*, p.image, p.sku, s.store_name as seller_name, s.country as seller_country
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN sellers s ON oi.seller_id = s.id
         WHERE oi.order_id = ?`,
        [orderId]
      );
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      // Fallback
    }
    return memoryOrderItems.filter((item) => item.order_id === Number(orderId));
  }

  static async findBySellerId(sellerId) {
    try {
      const rows = await db.query(
        `SELECT oi.*, o.order_number, o.status as order_status, o.created_at as order_date, o.shipping_country
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE oi.seller_id = ?
         ORDER BY oi.id DESC`,
        [sellerId]
      );
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      // Fallback
    }
    return memoryOrderItems.filter((item) => item.seller_id === Number(sellerId));
  }

  static async create({ order_id, product_id, seller_id, product_name, unit_price, quantity, total_price }) {
    try {
      const result = await db.query(
        `INSERT INTO order_items (order_id, product_id, seller_id, product_name, unit_price, quantity, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [order_id, product_id, seller_id, product_name, unit_price, quantity, total_price]
      );
      if (result && result.insertId) {
        return {
          id: result.insertId,
          order_id,
          product_id,
          seller_id,
          product_name,
          unit_price,
          quantity,
          total_price,
          created_at: new Date()
        };
      }
    } catch (err) {
      // Fallback
    }

    const newItem = {
      id: memoryOrderItems.length + 1,
      order_id: Number(order_id),
      product_id: Number(product_id),
      seller_id: Number(seller_id),
      product_name,
      unit_price: Number(unit_price),
      quantity: Number(quantity),
      total_price: Number(total_price),
      created_at: new Date()
    };
    memoryOrderItems.push(newItem);
    return newItem;
  }
}

module.exports = OrderItem;
