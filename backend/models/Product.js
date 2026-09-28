/**
 * MarketSphere - Product Model
 * Manages marketplace catalog, variations, inventory, search, and category indexing.
 */

const db = require('../config/database');

const memoryCategories = [
  { id: 1, name: 'Electronics', slug: 'electronics' },
  { id: 2, name: 'Watches', slug: 'watches' },
  { id: 3, name: 'Beauty', slug: 'beauty' },
  { id: 4, name: 'Computers', slug: 'computers' },
  { id: 5, name: 'Fashion', slug: 'fashion' },
  { id: 6, name: 'Home & Kitchen', slug: 'home-kitchen' },
  { id: 7, name: 'Sports', slug: 'sports' },
  { id: 8, name: 'Mobile Accessories', slug: 'mobile-accessories' },
  { id: 9, name: 'Accessories', slug: 'accessories' }
];

const memoryProducts = [
  {
    id: 1,
    seller_id: 1,
    seller_name: 'AcousticLab Tokyo',
    seller_country: 'Japan',
    category_id: 1,
    category: 'Electronics',
    name: 'StudioMaster Pro ANC Over-Ear Wireless Headphones',
    slug: 'studiomaster-pro-anc',
    sku: 'SKU-AUD-001',
    description: 'Engineered with 45mm custom planar dynamic drivers, active hybrid noise cancellation (up to -38dB), low-latency Bluetooth 5.3, and a 42-hour playtime with quick charge support.',
    price: 249.99,
    old_price: 329.99,
    discount: 24,
    stock: 45,
    image: './assets/images/headphones.jpg',
    fallback_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    specifications: { 'Driver Size': '45mm Planar Dynamic', 'Battery Life': '42 hours', 'Connectivity': 'Bluetooth 5.3 + AUX' },
    rating: 4.80,
    review_count: 342,
    is_flash_sale: 1,
    is_trending: 1,
    is_bestseller: 1,
    status: 'active',
    created_at: new Date()
  },
  {
    id: 2,
    seller_id: 2,
    seller_name: 'Kronos Horology Glashütte',
    seller_country: 'Germany',
    category_id: 2,
    category: 'Watches',
    name: 'AeroTitan Automatic 42mm Mechanical Watch',
    slug: 'aerotitan-automatic-42mm',
    sku: 'SKU-WTC-002',
    description: 'Crafted in aerospace-grade Grade 5 titanium, featuring double-domed anti-reflective sapphire crystal, 68-hour power reserve automatic caliber, 100m water resistance, and hand-finished Italian leather strap.',
    price: 489.00,
    old_price: 599.00,
    discount: 18,
    stock: 18,
    image: './assets/images/watch.jpg',
    fallback_image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    specifications: { 'Case Diameter': '42mm Titanium Grade 5', 'Movement': 'Caliber MS-8800 Automatic', 'Water Resistance': '10 ATM' },
    rating: 4.90,
    review_count: 189,
    is_flash_sale: 0,
    is_trending: 1,
    is_bestseller: 1,
    status: 'active',
    created_at: new Date()
  },
  {
    id: 3,
    seller_id: 3,
    seller_name: 'Atelier Botanica Paris',
    seller_country: 'France',
    category_id: 3,
    category: 'Beauty',
    name: 'Botanique Phyto-Renew Peptide Face Elixir (50ml)',
    slug: 'botanique-phyto-renew-elixir',
    sku: 'SKU-BTY-003',
    description: 'Cold-pressed French plant squalane, active multi-molecular hyaluronic acid, and copper tripeptide-1 that visibly restores firmness, deeply hydrates, and smoothes fine lines.',
    price: 64.00,
    old_price: 85.00,
    discount: 25,
    stock: 120,
    image: './assets/images/serum.jpg',
    fallback_image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    specifications: { 'Volume': '50ml / 1.7 fl oz', 'Actives': 'Copper Tripeptide, Vegan Squalane', 'Packaging': 'Amber glass dropper' },
    rating: 4.70,
    review_count: 512,
    is_flash_sale: 1,
    is_trending: 1,
    is_bestseller: 0,
    status: 'active',
    created_at: new Date()
  },
  {
    id: 4,
    seller_id: 1,
    seller_name: 'AcousticLab Tokyo',
    seller_country: 'Japan',
    category_id: 1,
    category: 'Electronics',
    name: 'ZenithSound Desktop Studio Monitor DAC & Amp',
    slug: 'zenithsound-studio-dac',
    sku: 'SKU-AUD-004',
    description: 'Dual ESS SABRE reference 32-bit DAC architecture with discrete balanced headphone outputs. Delivering clean, uncolored acoustic reproduction for studio mixing.',
    price: 319.00,
    old_price: 389.00,
    discount: 18,
    stock: 22,
    image: './assets/images/hero.jpg',
    fallback_image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    specifications: { 'DAC Architecture': 'Dual ESS ES9038Q2M', 'Output Power': '2400mW @ 32Ω' },
    rating: 4.90,
    review_count: 94,
    is_flash_sale: 0,
    is_trending: 0,
    is_bestseller: 1,
    status: 'active',
    created_at: new Date()
  },
  {
    id: 5,
    seller_id: 1,
    seller_name: 'AcousticLab Tokyo',
    seller_country: 'Japan',
    category_id: 4,
    category: 'Computers',
    name: 'UltraSlim Magnesium 15.6-inch Creator Laptop',
    slug: 'ultraslim-magnesium-laptop',
    sku: 'SKU-CMP-005',
    description: 'Ultra-portable magnesium alloy chassis weighing only 1.18kg with 3.2K 120Hz OLED wide-gamut display and 14-core high-efficiency processor.',
    price: 1149.00,
    old_price: 1399.00,
    discount: 18,
    stock: 12,
    image: './assets/images/hero.jpg',
    fallback_image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    specifications: { 'Display': '15.6-inch 3.2K OLED 120Hz', 'Weight': '1.18 kg' },
    rating: 4.70,
    review_count: 68,
    is_flash_sale: 0,
    is_trending: 1,
    is_bestseller: 0,
    status: 'active',
    created_at: new Date()
  },
  {
    id: 6,
    seller_id: 2,
    seller_name: 'Kronos Horology Glashütte',
    seller_country: 'Germany',
    category_id: 2,
    category: 'Watches',
    name: 'Heritage Bauhaus 38mm Slim Automatic Watch',
    slug: 'heritage-bauhaus-38mm',
    sku: 'SKU-WTC-006',
    description: 'Ultra-thin 8.2mm profile, enamel minimalist dial, tempered blued hands, and German Horween shell cordovan strap.',
    price: 395.00,
    old_price: 480.00,
    discount: 17,
    stock: 25,
    image: './assets/images/watch.jpg',
    fallback_image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    specifications: { 'Thickness': '8.2mm Ultra-Slim', 'Strap': 'Horween Shell Cordovan' },
    rating: 4.80,
    review_count: 114,
    is_flash_sale: 1,
    is_trending: 0,
    is_bestseller: 1,
    status: 'active',
    created_at: new Date()
  },
  {
    id: 7,
    seller_id: 3,
    seller_name: 'Atelier Botanica Paris',
    seller_country: 'France',
    category_id: 3,
    category: 'Beauty',
    name: 'Rosehip & Bakuchiol Night Restorative Oil (30ml)',
    slug: 'rosehip-bakuchiol-night-oil',
    sku: 'SKU-BTY-007',
    description: 'Cold-pressed organic Chilean rosehip fruit oil infused with 1.5% natural plant-derived bakuchiol to nourish overnight.',
    price: 48.00,
    old_price: 62.00,
    discount: 22,
    stock: 85,
    image: './assets/images/serum.jpg',
    fallback_image: 'https://images.unsplash.com/photo-1608248597359-0a6886e87f2e?auto=format&fit=crop&w=800&q=80',
    specifications: { 'Volume': '30ml / 1.0 fl oz', 'Ingredients': 'Cold-Pressed Rosehip, 1.5% Bakuchiol' },
    rating: 4.60,
    review_count: 241,
    is_flash_sale: 0,
    is_trending: 1,
    is_bestseller: 0,
    status: 'active',
    created_at: new Date()
  },
  {
    id: 8,
    seller_id: 1,
    seller_name: 'AcousticLab Tokyo',
    seller_country: 'Japan',
    category_id: 1,
    category: 'Electronics',
    name: 'PulseMini Aluminum Lossless Hi-Fi Pocket Player',
    slug: 'pulsemini-lossless-player',
    sku: 'SKU-AUD-008',
    description: 'Precision CNC aircraft aluminum chassis with dual micro-SD slots, balanced 4.4mm output, and native DSD256 master playback.',
    price: 189.00,
    old_price: 240.00,
    discount: 21,
    stock: 34,
    image: './assets/images/headphones.jpg',
    fallback_image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80',
    specifications: { 'Storage': 'Dual MicroSD (up to 2TB)', 'DAC': 'Dual Cirrus Logic CS43198' },
    rating: 4.80,
    review_count: 76,
    is_flash_sale: 1,
    is_trending: 0,
    is_bestseller: 0,
    status: 'active',
    created_at: new Date()
  }
];

class Product {
  static async findAll({ search = '', category = '', sort = 'featured', limit = 50, offset = 0, flash = null }) {
    let items = [...memoryProducts];

    // Try SQL query
    try {
      let sql = `
        SELECT p.*, s.store_name as seller_name, s.country as seller_country, c.name as category 
        FROM products p
        JOIN sellers s ON p.seller_id = s.id
        JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'
      `;
      const params = [];

      if (category && category !== 'all') {
        sql += ' AND (LOWER(c.name) = ? OR LOWER(c.slug) = ?)';
        params.push(category.toLowerCase(), category.toLowerCase());
      }

      if (search) {
        sql += ' AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(s.store_name) LIKE ?)';
        const term = `%${search.toLowerCase()}%`;
        params.push(term, term, term);
      }

      if (flash === true || flash === 'true') {
        sql += ' AND p.is_flash_sale = 1';
      }

      if (sort === 'price_asc') sql += ' ORDER BY p.price ASC';
      else if (sort === 'price_desc') sql += ' ORDER BY p.price DESC';
      else if (sort === 'rating') sql += ' ORDER BY p.rating DESC';
      else if (sort === 'discount') sql += ' ORDER BY p.discount DESC';
      else sql += ' ORDER BY p.is_bestseller DESC, p.id DESC';

      sql += ' LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));

      const rows = await db.query(sql, params);
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      // Use fallback
    }

    // Filter memory
    if (category && category !== 'all') {
      items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.seller_name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (flash === true || flash === 'true') {
      items = items.filter((p) => p.is_flash_sale);
    }

    if (sort === 'price_asc') items.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') items.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') items.sort((a, b) => b.rating - a.rating);
    else if (sort === 'discount') items.sort((a, b) => (b.discount || 0) - (a.discount || 0));

    return items.slice(offset, offset + limit);
  }

  static async findById(id) {
    try {
      const rows = await db.query(
        `SELECT p.*, s.store_name as seller_name, s.country as seller_country, s.rating as seller_rating, c.name as category
         FROM products p
         JOIN sellers s ON p.seller_id = s.id
         JOIN categories c ON p.category_id = c.id
         WHERE p.id = ? LIMIT 1`,
        [id]
      );
      if (rows && rows.length > 0) return rows[0];
    } catch (err) {
      // Fallback
    }
    return memoryProducts.find((p) => p.id === Number(id)) || null;
  }

  static async findBySellerId(sellerId) {
    try {
      const rows = await db.query('SELECT * FROM products WHERE seller_id = ? ORDER BY id DESC', [sellerId]);
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      // Fallback
    }
    return memoryProducts.filter((p) => p.seller_id === Number(sellerId));
  }

  static async create({ seller_id, category_id, name, description, price, old_price = null, discount = 0, stock = 10, sku = null, image = './assets/images/hero.jpg', specifications = null }) {
    const calculatedSku = sku || `SKU-${Date.now().toString(36).toUpperCase()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      const result = await db.query(
        `INSERT INTO products (seller_id, category_id, name, slug, sku, description, price, old_price, discount, stock, image, specifications)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [seller_id, category_id, name, slug, calculatedSku, description, price, old_price, discount, stock, image, JSON.stringify(specifications)]
      );
      if (result && result.insertId) {
        return this.findById(result.insertId);
      }
    } catch (err) {
      // Fallback
    }

    const cat = memoryCategories.find((c) => c.id === Number(category_id)) || memoryCategories[0];
    const newProduct = {
      id: memoryProducts.length + 1,
      seller_id: Number(seller_id),
      seller_name: 'Verified Vendor',
      seller_country: 'International',
      category_id: Number(category_id),
      category: cat.name,
      name,
      slug,
      sku: calculatedSku,
      description,
      price: Number(price),
      old_price: old_price ? Number(old_price) : null,
      discount: Number(discount) || 0,
      stock: Number(stock) || 0,
      image,
      fallback_image: image,
      specifications: specifications || {},
      rating: 5.0,
      review_count: 0,
      is_flash_sale: 0,
      is_trending: 0,
      is_bestseller: 0,
      status: 'active',
      created_at: new Date()
    };
    memoryProducts.unshift(newProduct);
    return newProduct;
  }

  static async update(id, updateData) {
    try {
      const fields = [];
      const values = [];
      for (const [key, val] of Object.entries(updateData)) {
        fields.push(`${key} = ?`);
        values.push(key === 'specifications' ? JSON.stringify(val) : val);
      }
      values.push(id);
      await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
      return this.findById(id);
    } catch (err) {
      // Fallback
    }

    const p = memoryProducts.find((item) => item.id === Number(id));
    if (p) {
      Object.assign(p, updateData);
    }
    return p;
  }

  static async delete(id) {
    try {
      await db.query('DELETE FROM products WHERE id = ?', [id]);
    } catch (err) {
      // Fallback
    }
    const idx = memoryProducts.findIndex((item) => item.id === Number(id));
    if (idx > -1) {
      memoryProducts.splice(idx, 1);
      return true;
    }
    return false;
  }

  static async decrementStock(id, qty) {
    try {
      await db.query('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [qty, id]);
    } catch (err) {
      // Fallback
    }
    const p = memoryProducts.find((item) => item.id === Number(id));
    if (p) p.stock = Math.max(0, p.stock - qty);
  }

  static async getCategories() {
    try {
      const rows = await db.query('SELECT * FROM categories ORDER BY name ASC');
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      // Fallback
    }
    return memoryCategories;
  }
}

module.exports = Product;
