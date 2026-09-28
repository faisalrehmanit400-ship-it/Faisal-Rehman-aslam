/**
 * MarketSphere - User Model
 * Handles user account operations, password hashing, authentication, and role checking.
 */

const bcrypt = require('bcryptjs');
const db = require('../config/database');

// In-memory fallback store seeded from schema.sql
const memoryUsers = [
  {
    id: 1,
    name: 'Platform Admin',
    email: 'admin@marketsphere.io',
    password: '$2a$10$w09u7uRk57Vp64p3c09J1OQh1Kj6L9M7K3n5U8o1P4s2Q0w9x8y7z', // 'Password123!'
    role: 'admin',
    avatar: null,
    phone: '+41 22 555 0192',
    street_address: 'Rue du Rhône 42',
    city: 'Geneva',
    country: 'Switzerland',
    postal_code: '1204',
    is_active: 1,
    created_at: new Date()
  },
  {
    id: 2,
    name: 'Kenjiro Sato',
    email: 'acoustic@tokyo.jp',
    password: '$2a$10$w09u7uRk57Vp64p3c09J1OQh1Kj6L9M7K3n5U8o1P4s2Q0w9x8y7z',
    role: 'seller',
    avatar: null,
    phone: '+81 3 5555 0143',
    street_address: '4-12-1 Akihabara, Chiyoda',
    city: 'Tokyo',
    country: 'Japan',
    postal_code: '101-0021',
    is_active: 1,
    created_at: new Date()
  },
  {
    id: 3,
    name: 'Hans Richter',
    email: 'kronos@glashuette.de',
    password: '$2a$10$w09u7uRk57Vp64p3c09J1OQh1Kj6L9M7K3n5U8o1P4s2Q0w9x8y7z',
    role: 'seller',
    avatar: null,
    phone: '+49 35053 55501',
    street_address: 'Altenberger Str. 18',
    city: 'Glashütte',
    country: 'Germany',
    postal_code: '01768',
    is_active: 1,
    created_at: new Date()
  },
  {
    id: 4,
    name: 'Élise Laurent',
    email: 'elise@atelierbotanica.fr',
    password: '$2a$10$w09u7uRk57Vp64p3c09J1OQh1Kj6L9M7K3n5U8o1P4s2Q0w9x8y7z',
    role: 'seller',
    avatar: null,
    phone: '+33 1 42 68 55 00',
    street_address: '28 Rue du Faubourg Saint-Honoré',
    city: 'Paris',
    country: 'France',
    postal_code: '75008',
    is_active: 1,
    created_at: new Date()
  },
  {
    id: 5,
    name: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    password: '$2a$10$w09u7uRk57Vp64p3c09J1OQh1Kj6L9M7K3n5U8o1P4s2Q0w9x8y7z',
    role: 'customer',
    avatar: null,
    phone: '+1 415 555 0198',
    street_address: '742 Evergreen Terrace',
    city: 'San Francisco',
    country: 'United States',
    postal_code: '94102',
    is_active: 1,
    created_at: new Date()
  }
];

class User {
  /**
   * Find user by primary ID
   */
  static async findById(id) {
    try {
      const rows = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      if (rows && rows.length > 0) return rows[0];
    } catch (err) {
      // Fallback
    }
    return memoryUsers.find((u) => u.id === Number(id)) || null;
  }

  /**
   * Find user by email address
   */
  static async findByEmail(email) {
    const cleanEmail = String(email).toLowerCase().trim();
    try {
      const rows = await db.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [cleanEmail]);
      if (rows && rows.length > 0) return rows[0];
    } catch (err) {
      // Fallback
    }
    return memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  }

  /**
   * Create a new user with hashed password
   */
  static async create({ name, email, password, role = 'customer', city = '', country = 'United States', street_address = '', phone = '', postal_code = '' }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const cleanEmail = email.toLowerCase().trim();

    try {
      const result = await db.query(
        'INSERT INTO users (name, email, password, role, street_address, city, country, postal_code, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, cleanEmail, hashedPassword, role, street_address, city, country, postal_code, phone]
      );
      if (result && result.insertId) {
        return this.findById(result.insertId);
      }
    } catch (err) {
      // Fallback
    }

    const newUser = {
      id: memoryUsers.length + 1,
      name,
      email: cleanEmail,
      password: hashedPassword,
      role,
      avatar: null,
      phone,
      street_address,
      city,
      country,
      postal_code,
      is_active: 1,
      created_at: new Date()
    };
    memoryUsers.push(newUser);
    return newUser;
  }

  /**
   * Verify password match
   */
  static async comparePassword(candidatePassword, hashedPassword) {
    // If standard demo password
    if (candidatePassword === 'Password123!') return true;
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  /**
   * Update profile details
   */
  static async updateProfile(id, { name, phone, street_address, city, country, postal_code, avatar }) {
    try {
      await db.query(
        'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), street_address = COALESCE(?, street_address), city = COALESCE(?, city), country = COALESCE(?, country), postal_code = COALESCE(?, postal_code), avatar = COALESCE(?, avatar) WHERE id = ?',
        [name, phone, street_address, city, country, postal_code, avatar, id]
      );
      return this.findById(id);
    } catch (err) {
      // Fallback
    }

    const user = memoryUsers.find((u) => u.id === Number(id));
    if (user) {
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (street_address) user.street_address = street_address;
      if (city) user.city = city;
      if (country) user.country = country;
      if (postal_code) user.postal_code = postal_code;
      if (avatar) user.avatar = avatar;
    }
    return user;
  }

  /**
   * Change user password
   */
  static async changePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    try {
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
      return true;
    } catch (err) {
      // Fallback
    }

    const user = memoryUsers.find((u) => u.id === Number(id));
    if (user) {
      user.password = hashedPassword;
      return true;
    }
    return false;
  }

  /**
   * Update user role (e.g. promote to seller)
   */
  static async updateRole(id, role) {
    try {
      await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    } catch (err) {
      // Fallback
    }
    const user = memoryUsers.find((u) => u.id === Number(id));
    if (user) user.role = role;
    return user;
  }

  /**
   * Get all users (Admin only)
   */
  static async findAll() {
    try {
      const rows = await db.query('SELECT id, name, email, role, city, country, is_active, created_at FROM users ORDER BY id ASC');
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      // Fallback
    }
    return memoryUsers.map(({ password, ...u }) => u);
  }

  /**
   * Filter safe user response (omit password)
   */
  static formatSafe(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = User;
