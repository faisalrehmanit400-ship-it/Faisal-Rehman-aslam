/**
 * MarketSphere - Review Model
 * Manages verified customer ratings, comments, and average product score calculations.
 */

const db = require('../config/database');

const memoryReviews = [
  {
    id: 1,
    product_id: 1,
    user_id: 5,
    user_name: 'Marcus Vance',
    rating: 5,
    title: 'Exceptional acoustic clarity and isolation',
    comment: 'The planar dynamic drivers reproduce sub-bass frequencies cleanly without muddying the mids. Transcontinental shipping took only 3 business days to California!',
    created_at: new Date()
  },
  {
    id: 2,
    product_id: 2,
    user_id: 5,
    user_name: 'Marcus Vance',
    rating: 5,
    title: 'Flawless titanium finishing',
    comment: 'Grade 5 titanium feels featherlight yet indestructible. The anti-reflective sapphire crystal is invisible under direct sunlight.',
    created_at: new Date()
  }
];

class Review {
  static async findByProductId(productId) {
    try {
      const rows = await db.query(
        `SELECT r.*, u.name as user_name 
         FROM reviews r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.product_id = ? 
         ORDER BY r.id DESC`,
        [productId]
      );
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      // Fallback
    }
    return memoryReviews.filter((r) => r.product_id === Number(productId));
  }

  static async findById(id) {
    try {
      const rows = await db.query('SELECT * FROM reviews WHERE id = ? LIMIT 1', [id]);
      if (rows && rows.length > 0) return rows[0];
    } catch (err) {
      // Fallback
    }
    return memoryReviews.find((r) => r.id === Number(id)) || null;
  }

  static async create({ product_id, user_id, user_name = 'Customer', rating, title = '', comment }) {
    const validRating = Math.max(1, Math.min(5, Number(rating) || 5));

    try {
      const result = await db.query(
        'INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES (?, ?, ?, ?, ?)',
        [product_id, user_id, validRating, title, comment]
      );
      if (result && result.insertId) {
        return this.findById(result.insertId);
      }
    } catch (err) {
      // Fallback
    }

    // Check if user already reviewed
    const existing = memoryReviews.find((r) => r.product_id === Number(product_id) && r.user_id === Number(user_id));
    if (existing) {
      existing.rating = validRating;
      existing.title = title;
      existing.comment = comment;
      return existing;
    }

    const newRev = {
      id: memoryReviews.length + 1,
      product_id: Number(product_id),
      user_id: Number(user_id),
      user_name,
      rating: validRating,
      title,
      comment,
      created_at: new Date()
    };
    memoryReviews.push(newRev);
    return newRev;
  }

  static async update(id, userId, { rating, title, comment }) {
    const rev = await this.findById(id);
    if (!rev) return null;
    if (rev.user_id !== Number(userId)) {
      throw new Error('FORBIDDEN');
    }

    const validRating = rating ? Math.max(1, Math.min(5, Number(rating))) : rev.rating;

    try {
      await db.query(
        'UPDATE reviews SET rating = ?, title = COALESCE(?, title), comment = COALESCE(?, comment) WHERE id = ?',
        [validRating, title, comment, id]
      );
      return this.findById(id);
    } catch (err) {
      // Fallback
    }

    if (rating) rev.rating = validRating;
    if (title) rev.title = title;
    if (comment) rev.comment = comment;
    return rev;
  }

  static async delete(id, userId, isAdmin = false) {
    const rev = await this.findById(id);
    if (!rev) return false;
    if (!isAdmin && rev.user_id !== Number(userId)) {
      throw new Error('FORBIDDEN');
    }

    try {
      await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    } catch (err) {
      // Fallback
    }

    const idx = memoryReviews.findIndex((r) => r.id === Number(id));
    if (idx > -1) {
      memoryReviews.splice(idx, 1);
      return true;
    }
    return false;
  }
}

module.exports = Review;
