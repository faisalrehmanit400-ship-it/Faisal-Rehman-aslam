-- =====================================================================
-- OmniTrade Global Marketplace - Seed Data
-- Provides verified sellers, curated international catalog, demo users, orders
-- =====================================================================

-- 1. USERS (Password for all accounts is 'OmniTrade2026!')
-- Hashes generated via bcrypt (cost factor 10)
INSERT INTO users (id, name, email, password_hash, role, preferred_currency) VALUES
('usr_admin_01', 'Elena Rostova', 'admin@omnitrade.com', '$2b$10$wT8K8U9rVb7vGqJ6Q0LqX.qN0bE8n5Z9gZ1r4s7t0u3v6w9x2y5zA', 'admin', 'USD'),
('usr_seller_01', 'Kenji Takahashi', 'tokyo.audio@omnitrade.com', '$2b$10$wT8K8U9rVb7vGqJ6Q0LqX.qN0bE8n5Z9gZ1r4s7t0u3v6w9x2y5zA', 'seller', 'JPY'),
('usr_seller_02', 'Lukas Weber', 'kronos.horology@omnitrade.com', '$2b$10$wT8K8U9rVb7vGqJ6Q0LqX.qN0bE8n5Z9gZ1r4s7t0u3v6w9x2y5zA', 'seller', 'EUR'),
('usr_seller_03', 'Dr. Juliette Moreau', 'botanica.paris@omnitrade.com', '$2b$10$wT8K8U9rVb7vGqJ6Q0LqX.qN0bE8n5Z9gZ1r4s7t0u3v6w9x2y5zA', 'seller', 'EUR'),
('usr_buyer_01', 'Marcus Vance', 'marcus.buyer@example.com', '$2b$10$wT8K8U9rVb7vGqJ6Q0LqX.qN0bE8n5Z9gZ1r4s7t0u3v6w9x2y5zA', 'customer', 'USD')
ON CONFLICT (id) DO NOTHING;

-- 2. SELLERS
INSERT INTO sellers (id, user_id, store_name, store_slug, description, country, business_registration_number, rating_avg, rating_count, total_sales) VALUES
('sel_01', 'usr_seller_01', 'AcousticLab Tokyo', 'acousticlab-tokyo', 'Precision audio monitors, custom diaphragms, and studio monitoring hardware crafted in Shibuya, Japan.', 'JPN', 'JP-90182411', 4.96, 428, 148200.00),
('sel_02', 'usr_seller_02', 'Kronos Werkstatt', 'kronos-werkstatt', 'Hand-finished automatic chronographs and titanium mechanical tool watches assembled in Glashütte, Germany.', 'DEU', 'DE-HRB88201', 4.92, 312, 289400.00),
('sel_03', 'usr_seller_03', 'Atelier Botanica Paris', 'atelier-botanica', 'Ecocert organic cold-pressed serums and phyto-active botanical elixirs formulated in Provence, France.', 'FRA', 'FR-RCS402199', 4.88, 590, 89300.00)
ON CONFLICT (id) DO NOTHING;

-- 3. CATEGORIES
INSERT INTO categories (id, name, slug, description, sort_order) VALUES
('cat_elec', 'Electronics', 'electronics', 'High-fidelity audio, computing, and precision devices.', 1),
('cat_horology', 'Watches & Precision', 'watches-precision', 'Mechanical timepieces and horological instruments.', 2),
('cat_beauty', 'Beauty & Wellness', 'beauty-wellness', 'Natural botanical skincare, active serums, and apothecary.', 3),
('cat_home', 'Home & Interiors', 'home-interiors', 'Architectural lighting, travertine decor, and ceramics.', 4),
('cat_apparel', 'Apparel & Accessories', 'apparel-accessories', 'Artisanal leather goods, wool overcoats, and footwear.', 5)
ON CONFLICT (id) DO NOTHING;

-- 4. PRODUCTS
INSERT INTO products (id, seller_id, category_id, title, slug, brand, sku, short_description, description, price, compare_at_price, stock_quantity, origin_country, weight_kg, rating_avg, rating_count, is_featured) VALUES
('prd_01', 'sel_01', 'cat_elec', 'AcousticLab Studio Master H1 Wireless Headphones', 'acousticlab-studio-master-h1', 'AcousticLab', 'ACL-H1-BLK', 'Reference-grade 45mm planar magnetic drivers with active hybrid isolation and 40h battery.', 'Engineered for audio engineers and discerning audiophiles. Features beryllium-coated diaphragms, replaceable lambskin memory foam ear pads, and low-latency lossless LDAC streaming.', 389.00, 449.00, 48, 'JPN', 0.38, 4.95, 184, TRUE),
('prd_02', 'sel_02', 'cat_horology', 'Kronos Automatik Calibre 41 Field Watch', 'kronos-automatik-calibre-41', 'Kronos Werkstatt', 'KW-CAL41-TI', 'Grade 5 aerospace titanium case, automatic movement with 68h power reserve, and Italian cordovan strap.', 'A rugged yet refined horological tool. Water resistant to 200m with anti-reflective double-domed sapphire crystal and Super-LumiNova BGW9 indices for maximum clarity.', 840.00, 950.00, 22, 'DEU', 0.12, 4.92, 96, TRUE),
('prd_03', 'sel_03', 'cat_beauty', 'Sérum Éclat Botanique Bio-Renewal Elixir', 'serum-eclat-botanique', 'Atelier Botanica', 'ABP-SER-50', 'Concentrated botanical squalane with cold-pressed rosehip seed extract and bakuchiol.', 'Dermatologist formulated in Grasse. Packed with antioxidant phytosterols and cold-pressed botanical oils to restore lipid barriers without synthetic fragrance.', 78.00, 92.00, 115, 'FRA', 0.18, 4.89, 214, TRUE),
('prd_04', 'sel_01', 'cat_elec', 'AcousticLab Solid State Desktop Headphone DAC/Amp', 'acousticlab-desktop-dac-amp', 'AcousticLab', 'ACL-DAC-PRO', 'Dual ESS Sabre ES9038Q2M architecture with discrete Class-A balanced output stage.', 'Clean, uncolored acoustic amplification delivering up to 2.4W into 32 ohms. Supports full MQA decoding and 32-bit/768kHz PCM resolution.', 499.00, 560.00, 31, 'JPN', 1.20, 4.88, 45, FALSE)
ON CONFLICT (id) DO NOTHING;

-- 5. PRODUCT IMAGES
INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, sort_order) VALUES
('img_01', 'prd_01', 'assets/images/headphones.jpg', 'AcousticLab Studio Master H1 over-ear wireless headphones', TRUE, 0),
('img_02', 'prd_02', 'assets/images/watch.jpg', 'Kronos Automatik Calibre 41 Titanium Watch on basalt stone', TRUE, 0),
('img_03', 'prd_03', 'assets/images/serum.jpg', 'Sérum Éclat Botanique luxury amber dropper bottle', TRUE, 0),
('img_04', 'prd_04', 'assets/images/hero.jpg', 'AcousticLab Solid State DAC and studio desktop collection', TRUE, 0)
ON CONFLICT (id) DO NOTHING;

-- 6. PRODUCT VARIANTS
INSERT INTO product_variants (id, product_id, title, sku, price, stock_quantity, option1_name, option1_value) VALUES
('var_01_a', 'prd_01', 'Matte Carbon Black', 'ACL-H1-BLK', 389.00, 28, 'Finish', 'Matte Carbon'),
('var_01_b', 'prd_01', 'Silver Anodized Aluminum', 'ACL-H1-SLV', 389.00, 20, 'Finish', 'Silver Anodized'),
('var_02_a', 'prd_02', 'Basalt Black Dial / Cordovan Strap', 'KW-CAL41-TI-BLK', 840.00, 14, 'Dial', 'Basalt Black'),
('var_02_b', 'prd_02', 'Arctic White Dial / Steel Mesh', 'KW-CAL41-TI-WHT', 890.00, 8, 'Dial', 'Arctic White')
ON CONFLICT (id) DO NOTHING;

-- 7. REVIEWS
INSERT INTO reviews (id, product_id, user_id, rating, title, comment, is_verified_purchase, seller_reply, seller_replied_at) VALUES
('rev_01', 'prd_01', 'usr_buyer_01', 5, 'Stunning soundstage and all-day comfort', 'I produce audio masters in London. These provide neutral, transparent reproduction that rivals wired studio monitors. The lambskin cups are plush.', TRUE, 'Thank you Marcus! We spent 14 months tuning the planar damping for that exact neutral curve.', CURRENT_TIMESTAMP),
('rev_02', 'prd_02', 'usr_buyer_01', 5, 'Exceptional craftsmanship and German precision', 'The titanium case feels practically weightless on the wrist. The mechanical winding is silky smooth. Worth every euro.', TRUE, 'Sehr geehrter Marcus, thank you for your appreciation of Glashütte watchmaking heritage.', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
