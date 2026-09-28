/**
 * MarketSphere - Seller Model
 * Manages verified multi-vendor store profiles, statistics, and merchant settings.
 */

const db = require('../config/database');

const memorySellers = [
  {
    id: 1,
    user_id: 2,
    store_name: 'AcousticLab Tokyo',
    business_name: 'AcousticLab Tokyo GK',
    description: 'Custom acoustic engineering, planar dynamic drivers, and audiophile hardware.',
    country: 'Japan',
    logo_url: null,
    banner_url: null,
    rating: 4.90,
    review_count: 436,
    total_sales: 184520.00,
    commission_rate: 4.50,
    is_verified: 1,
    status: 'active',
    created_at: new Date()
  },
  {
    id: 2,
    user_id: 3,
    store_name: 'Kronos Horology Glashütte',
    business_name: 'Kronos Feinmechanik GmbH',
    description: 'Aerospace titanium mechanical watches assembled with German precision.',
    country: 'Germany',
    rating: 4.95,
    review_count: 218,
    total_sales: 312000.00,
    commission_rate: 4.50,
    is_verified: 1,
    status: 'active',
    created_at: new Date()
  },
  {
    id: 3,
    user_id: 4,
    store_name: 'Atelier Botanica Paris',
    business_name: 'Atelier Botanica SAS',
    description: 'High-performance phyto-renew squalane and peptide botanical skincare.',
    country: 'France',
    rating: 4.88,
    review_count: 512,
    total_sales: 94600.00,
    commission_rate: 4.50,
    is_verified: 1,
    status: 'active',
    created_at: new Date()
  }
];

class Seller {
  static async findById(id) {
    try {
      const rows = await db.query('SELECT s.*, u.email as contact_email FROM sellers s JOIN users u ON s.user_id = u.id WHERE s.id = ? LIMIT 1', [id]);
      if (rows && rows.length > 0) return rows[0];
    } catch (err) {
      // Fallback
    }
    return memorySellers.find((s) => s.id === Number(id)) || null;
  }

  static async findByUserId(userId) {
    try {
      const rows = await db.query('SELECT * FROM sellers WHERE user_id = ? LIMIT 1', [userId]);
      if (rows && rows.length > 0) return rows[0];
    } catch (err) {
      // Fallback
    }
    return memorySellers.find((s) => s.user_id === Number(userId)) || null;
  }

  static async findByStoreName(storeName) {
    try {
      const rows = await db.query('SELECT * FROM sellers WHERE LOWER(store_name) = ? LIMIT 1', [storeName.toLowerCase().trim()]);
      if (rows && rows.length > 0) return rows[0];
    } catch (err) {
      // Fallback
    }
    return memorySellers.find((s) => s.store_name.toLowerCase() === storeName.toLowerCase().trim()) || null;
  }

  static async create({ user_id, store_name, business_name, description = '', country = 'International' }) {
    try {
      const result = await db.query(
        'INSERT INTO sellers (user_id, store_name, business_name, description, country) VALUES (?, ?, ?, ?, ?)',
        [user_id, store_name, business_name, description, country]
      );
      if (result && result.insertId) {
        return this.findById(result.insertId);
      }
    } catch (err) {
      // Fallback
    }

    const newSeller = {
      id: memorySellers.length + 1,
      user_id: Number(user_id),
      store_name,
      business_name,
      description,
      country,
      logo_url: null,
      banner_url: null,
      rating: 5.00,
      review_count: 0,
      total_sales: 0.00,
      commission_rate: 4.50,
      is_verified: 1,
      status: 'active',
      created_at: new Date()
    };
    memorySellers.push(newSeller);
    return newSeller;
  }

  static async update(id, { store_name, business_name, description, country, logo_url, banner_url }) {
    try {
      await db.query(
        'UPDATE sellers SET store_name = COALESCE(?, store_name), business_name = COALESCE(?, business_name), description = COALESCE(?, description), country = COALESCE(?, country), logo_url = COALESCE(?, logo_url), banner_url = COALESCE(?, banner_url) WHERE id = ?',
        [store_name, business_name, description, country, logo_url, banner_url, id]
      );
      return this.findById(id);
    } catch (err) {
      // Fallback
    }

    const s = memorySellers.find((sel) => sel.id === Number(id));
    if (s) {
      if (store_name) s.store_name = store_name;
      if (business_name) s.business_name = business_name;
      if (description) s.description = description;
      if (country) s.country = country;
      if (logo_url) s.logo_url = logo_url;
      if (banner_url) s.banner_url = banner_url;
    }
    return s;
  }

  static async findAll() {
    try {
      const rows = await db.query('SELECT s.*, u.name as owner_name, u.email as owner_email FROM sellers s JOIN users u ON s.user_id = u.id ORDER BY s.rating DESC');
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      // Fallback
    }
    return memorySellers;
  }

  static async recordSale(sellerId, amount) {
    try {
      await db.query('UPDATE sellers SET total_sales = total_sales + ? WHERE id = ?', [amount, sellerId]);
    } catch (err) {
      // Fallback
    }
    const s = memorySellers.find((sel) => sel.id === Number(sellerId));
    if (s) s.total_sales = Number((s.total_sales + amount).toFixed(2));
  }
}

module.exports = Seller;
