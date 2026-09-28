/**
 * MarketSphere - Order Model
 * Handles international order lifecycle, escrow status, fulfillment tracking, and customer receipts.
 */

const db = require('../config/database');
const OrderItem = require('./OrderItem');

const memoryOrders = [
  {
    id: 1,
    order_number: 'MS-2026-98124',
    user_id: 5,
    subtotal: 377.99,
    shipping_fee: 0.00,
    tax_duty: 18.90,
    discount_amount: 0.00,
    total_amount: 396.89,
    currency: 'USD',
    status: 'Confirmed',
    payment_status: 'escrow_held',
    payment_method: 'Credit Card (Escrow)',
    shipping_name: 'Marcus Vance',
    shipping_email: 'marcus.vance@example.com',
    shipping_address: '742 Evergreen Terrace',
    shipping_city: 'San Francisco',
    shipping_country: 'United States',
    shipping_postal_code: '94102',
    tracking_number: 'EXP-78901',
    created_at: new Date()
  }
];

class Order {
  static async create({
    user_id,
    subtotal,
    shipping_fee = 0.00,
    tax_duty = 0.00,
    discount_amount = 0.00,
    total_amount,
    currency = 'USD',
    payment_method = 'Credit Card (Escrow)',
    shipping_name,
    shipping_email,
    shipping_address,
    shipping_city,
    shipping_country,
    shipping_postal_code
  }) {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    const order_number = `MS-${year}-${rand}`;
    const tracking_number = `EXP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      const result = await db.query(
        `INSERT INTO orders 
         (order_number, user_id, subtotal, shipping_fee, tax_duty, discount_amount, total_amount, currency, status, payment_status, payment_method, shipping_name, shipping_email, shipping_address, shipping_city, shipping_country, shipping_postal_code, tracking_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'escrow_held', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order_number,
          user_id,
          subtotal,
          shipping_fee,
          tax_duty,
          discount_amount,
          total_amount,
          currency,
          payment_method,
          shipping_name,
          shipping_email,
          shipping_address,
          shipping_city,
          shipping_country,
          shipping_postal_code,
          tracking_number
        ]
      );

      if (result && result.insertId) {
        return this.findById(result.insertId);
      }
    } catch (err) {
      // Fallback
    }

    const newOrder = {
      id: memoryOrders.length + 1,
      order_number,
      user_id: Number(user_id),
      subtotal: Number(subtotal),
      shipping_fee: Number(shipping_fee),
      tax_duty: Number(tax_duty),
      discount_amount: Number(discount_amount),
      total_amount: Number(total_amount),
      currency,
      status: 'Confirmed',
      payment_status: 'escrow_held',
      payment_method,
      shipping_name,
      shipping_email,
      shipping_address,
      shipping_city,
      shipping_country,
      shipping_postal_code,
      tracking_number,
      created_at: new Date()
    };
    memoryOrders.unshift(newOrder);
    return newOrder;
  }

  static async findById(id) {
    let order = null;
    try {
      const rows = await db.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
      if (rows && rows.length > 0) order = rows[0];
    } catch (err) {
      // Fallback
    }
    if (!order) {
      order = memoryOrders.find((o) => o.id === Number(id));
    }
    if (!order) return null;

    const items = await OrderItem.findByOrderId(order.id);
    return { ...order, items };
  }

  static async findByOrderNumber(orderNumber) {
    let order = null;
    try {
      const rows = await db.query('SELECT * FROM orders WHERE order_number = ? LIMIT 1', [orderNumber]);
      if (rows && rows.length > 0) order = rows[0];
    } catch (err) {
      // Fallback
    }
    if (!order) {
      order = memoryOrders.find((o) => o.order_number === orderNumber);
    }
    if (!order) return null;

    const items = await OrderItem.findByOrderId(order.id);
    return { ...order, items };
  }

  static async findByUserId(userId) {
    let ordersList = [];
    try {
      const rows = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);
      if (rows && rows.length > 0) ordersList = rows;
    } catch (err) {
      // Fallback
    }
    if (ordersList.length === 0) {
      ordersList = memoryOrders.filter((o) => o.user_id === Number(userId));
    }

    const populated = await Promise.all(
      ordersList.map(async (o) => {
        const items = await OrderItem.findByOrderId(o.id);
        return { ...o, items };
      })
    );
    return populated;
  }

  static async updateStatus(id, status) {
    try {
      await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    } catch (err) {
      // Fallback
    }
    const o = memoryOrders.find((ord) => ord.id === Number(id));
    if (o) o.status = status;
    return this.findById(id);
  }

  static async findAll() {
    let ordersList = [];
    try {
      const rows = await db.query('SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.id DESC');
      if (rows && rows.length > 0) ordersList = rows;
    } catch (err) {
      // Fallback
    }
    if (ordersList.length === 0) {
      ordersList = memoryOrders;
    }

    return Promise.all(
      ordersList.map(async (o) => {
        const items = await OrderItem.findByOrderId(o.id);
        return { ...o, items };
      })
    );
  }
}

module.exports = Order;
