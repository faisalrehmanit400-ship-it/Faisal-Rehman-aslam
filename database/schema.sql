-- ==============================================================================
-- MarketSphere — International Multi-Vendor E-Commerce Marketplace
-- MySQL Relational Database Schema & Realistic Seed Dataset
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `marketsphere_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `marketsphere_db`;

-- Drop existing tables in reverse dependency order if resetting
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `wishlist_items`;
DROP TABLE IF EXISTS `wishlists`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `carts`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `sellers`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS TABLE
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(190) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'seller', 'admin') NOT NULL DEFAULT 'customer',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(40) DEFAULT NULL,
  `street_address` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(80) DEFAULT 'United States',
  `postal_code` VARCHAR(30) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SELLERS TABLE
CREATE TABLE `sellers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `store_name` VARCHAR(150) NOT NULL UNIQUE,
  `business_name` VARCHAR(180) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `country` VARCHAR(80) NOT NULL DEFAULT 'International',
  `logo_url` VARCHAR(255) DEFAULT NULL,
  `banner_url` VARCHAR(255) DEFAULT NULL,
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  `review_count` INT NOT NULL DEFAULT 0,
  `total_sales` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `commission_rate` DECIMAL(4, 2) NOT NULL DEFAULT 4.50,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('active', 'suspended', 'pending') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_sellers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_sellers_rating` (`rating`),
  INDEX `idx_sellers_country` (`country`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CATEGORIES TABLE
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `description` VARCHAR(255) DEFAULT NULL,
  `icon_name` VARCHAR(50) DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PRODUCTS TABLE
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `seller_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `name` VARCHAR(220) NOT NULL,
  `slug` VARCHAR(250) NOT NULL UNIQUE,
  `sku` VARCHAR(60) NOT NULL UNIQUE,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `old_price` DECIMAL(10, 2) DEFAULT NULL,
  `discount` INT DEFAULT 0,
  `stock` INT NOT NULL DEFAULT 0,
  `image` VARCHAR(255) NOT NULL,
  `fallback_image` VARCHAR(255) DEFAULT NULL,
  `specifications` JSON DEFAULT NULL,
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  `review_count` INT NOT NULL DEFAULT 0,
  `is_flash_sale` TINYINT(1) NOT NULL DEFAULT 0,
  `is_trending` TINYINT(1) NOT NULL DEFAULT 0,
  `is_bestseller` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('active', 'draft', 'out_of_stock') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  INDEX `idx_products_seller` (`seller_id`),
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_price` (`price`),
  INDEX `idx_products_rating` (`rating`),
  INDEX `idx_products_flash` (`is_flash_sale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CARTS & CART ITEMS
CREATE TABLE `carts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `session_token` VARCHAR(100) DEFAULT NULL UNIQUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_carts_user` (`user_id`),
  INDEX `idx_carts_session` (`session_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cart_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cart_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_cart_product` (`cart_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ORDERS & ORDER ITEMS
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  `shipping_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `tax_duty` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `status` ENUM('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  `payment_status` ENUM('pending', 'escrow_held', 'released_to_seller', 'refunded') NOT NULL DEFAULT 'escrow_held',
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'Credit Card (Escrow)',
  `shipping_name` VARCHAR(120) NOT NULL,
  `shipping_email` VARCHAR(190) NOT NULL,
  `shipping_address` VARCHAR(255) NOT NULL,
  `shipping_city` VARCHAR(100) NOT NULL,
  `shipping_country` VARCHAR(80) NOT NULL,
  `shipping_postal_code` VARCHAR(30) DEFAULT NULL,
  `tracking_number` VARCHAR(80) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_number` (`order_number`),
  INDEX `idx_orders_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `seller_id` INT NOT NULL,
  `product_name` VARCHAR(220) NOT NULL,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `total_price` DECIMAL(10, 2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_order_items_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE RESTRICT,
  INDEX `idx_order_items_order` (`order_id`),
  INDEX `idx_order_items_seller` (`seller_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. REVIEWS TABLE
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `title` VARCHAR(150) DEFAULT NULL,
  `comment` TEXT NOT NULL,
  `is_verified_purchase` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_product_user_review` (`product_id`, `user_id`),
  INDEX `idx_reviews_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. WISHLISTS & WISHLIST ITEMS
CREATE TABLE `wishlists` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_wishlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `wishlist_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `wishlist_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_wishlist_items_list` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_wishlist_product` (`wishlist_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. INITIAL SEED DATA
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `city`, `country`) VALUES
(1, 'Platform Admin', 'admin@marketsphere.io', '$2a$10$w09u7uRk57Vp64p3c09J1OQh1Kj6L9M7K3n5U8o1P4s2Q0w9x8y7z', 'admin', 'Geneva', 'Switzerland'),
(2, 'Kenjiro Sato', 'acoustic@tokyo.jp', '$2a$10$w09u7uRk57Vp64p3c09J1OQh1Kj6L9M7K3n5U8o1P4s2Q0w9x8y7z', 'seller', 'Tokyo', 'Japan'),
(3, 'Hans Richter', 'kronos@glashuette.de', '$2a$10$w09u7uRk57Vp64p3c09J1OQh1Kj6L9M7K3n5U8o1P4s2Q0w9x8y7z', 'seller', 'Glashütte', 'Germany'),
(4, 'Élise Laurent', 'elise@atelierbotanica.fr', '$2a$10$w09u7uRk57Vp64p3c09J1OQh1Kj6L9M7K3n5U8o1P4s2Q0w9x8y7z', 'seller', 'Paris', 'France'),
(5, 'Marcus Vance', 'marcus.vance@example.com', '$2a$10$w09u7uRk57Vp64p3c09J1OQh1Kj6L9M7K3n5U8o1P4s2Q0w9x8y7z', 'customer', 'San Francisco', 'United States');

INSERT INTO `sellers` (`id`, `user_id`, `store_name`, `business_name`, `description`, `country`, `rating`, `review_count`, `total_sales`) VALUES
(1, 2, 'AcousticLab Tokyo', 'AcousticLab Tokyo GK', 'Custom acoustic engineering, planar dynamic drivers, and audiophile hardware.', 'Japan', 4.90, 436, 184520.00),
(2, 3, 'Kronos Horology Glashütte', 'Kronos Feinmechanik GmbH', 'Aerospace titanium mechanical watches assembled with German precision.', 'Germany', 4.95, 218, 312000.00),
(3, 4, 'Atelier Botanica Paris', 'Atelier Botanica SAS', 'High-performance phyto-renew squalane and peptide botanical skincare.', 'France', 4.88, 512, 94600.00);

INSERT INTO `categories` (`id`, `name`, `slug`, `description`) VALUES
(1, 'Electronics', 'electronics', 'High-fidelity audio, studio DACs, and precision electronics'),
(2, 'Watches', 'watches', 'Mechanical, automatic, and titanium timepieces'),
(3, 'Beauty', 'beauty', 'Phyto-renew serums, botanical skincare, and luxury cosmetics'),
(4, 'Computers', 'computers', 'Laptops, mechanical keyboards, and studio displays'),
(5, 'Fashion', 'fashion', 'Fine leather goods, cashmere apparel, and eyewear'),
(6, 'Home & Kitchen', 'home-kitchen', 'Minimalist pour-over, Japanese chef knives, and living essentials'),
(7, 'Sports', 'sports', 'Carbon fiber gravel bicycles, GPS watches, and performance gear'),
(8, 'Mobile Accessories', 'mobile-accessories', 'Titanium cases, wireless GaN chargers, and magnetic docks'),
(9, 'Accessories', 'accessories', 'Handmade leather folios, EDC pens, and travel hardware');

INSERT INTO `products` (`id`, `seller_id`, `category_id`, `name`, `slug`, `sku`, `description`, `price`, `old_price`, `discount`, `stock`, `image`, `fallback_image`, `rating`, `review_count`, `is_flash_sale`, `is_trending`, `is_bestseller`) VALUES
(1, 1, 1, 'StudioMaster Pro ANC Over-Ear Wireless Headphones', 'studiomaster-pro-anc', 'SKU-AUD-001', 'Engineered with 45mm custom planar dynamic drivers, active hybrid noise cancellation (up to -38dB), and 42-hour playtime.', 249.99, 329.99, 24, 45, './assets/images/headphones.jpg', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 4.80, 342, 1, 1, 1),
(2, 2, 2, 'AeroTitan Automatic 42mm Mechanical Watch', 'aerotitan-automatic-42mm', 'SKU-WTC-002', 'Grade 5 titanium case, double-domed anti-reflective sapphire crystal, and 68-hour power reserve automatic movement.', 489.00, 599.00, 18, 18, './assets/images/watch.jpg', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', 4.90, 189, 0, 1, 1),
(3, 3, 3, 'Botanique Phyto-Renew Peptide Face Elixir (50ml)', 'botanique-phyto-renew-elixir', 'SKU-BTY-003', 'French plant squalane, multi-molecular hyaluronic acid, and copper tripeptide-1 that visibly restores firmness.', 64.00, 85.00, 25, 120, './assets/images/serum.jpg', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 4.70, 512, 1, 1, 0),
(4, 1, 1, 'ZenithSound Desktop Studio Monitor DAC & Amp', 'zenithsound-studio-dac', 'SKU-AUD-004', 'Dual ESS SABRE reference 32-bit DAC architecture with discrete balanced headphone outputs up to 2400mW.', 319.00, 389.00, 18, 22, './assets/images/hero.jpg', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80', 4.90, 94, 0, 0, 1),
(5, 1, 4, 'UltraSlim Magnesium 15.6-inch Creator Laptop', 'ultraslim-magnesium-laptop', 'SKU-CMP-005', 'Weighing only 1.18kg with 3.2K 120Hz OLED wide-gamut display and 14-core processor.', 1149.00, 1399.00, 18, 12, './assets/images/hero.jpg', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', 4.70, 68, 0, 1, 0),
(6, 2, 2, 'Heritage Bauhaus 38mm Slim Automatic Watch', 'heritage-bauhaus-38mm', 'SKU-WTC-006', 'Ultra-thin 8.2mm profile, enamel minimalist dial, blued hands, and German Horween shell cordovan strap.', 395.00, 480.00, 17, 25, './assets/images/watch.jpg', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80', 4.80, 114, 1, 0, 1),
(7, 3, 3, 'Rosehip & Bakuchiol Night Restorative Oil (30ml)', 'rosehip-bakuchiol-night-oil', 'SKU-BTY-007', 'Cold-pressed organic Chilean rosehip fruit oil infused with 1.5% natural bakuchiol.', 48.00, 62.00, 22, 85, './assets/images/serum.jpg', 'https://images.unsplash.com/photo-1608248597359-0a6886e87f2e?auto=format&fit=crop&w=800&q=80', 4.60, 241, 0, 1, 0),
(8, 1, 1, 'PulseMini Aluminum Lossless Hi-Fi Pocket Player', 'pulsemini-lossless-player', 'SKU-AUD-008', 'Precision CNC aluminum chassis with dual micro-SD slots, balanced 4.4mm output, and native DSD256.', 189.00, 240.00, 21, 34, './assets/images/headphones.jpg', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80', 4.80, 76, 1, 0, 0);

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `subtotal`, `shipping_fee`, `tax_duty`, `discount_amount`, `total_amount`, `currency`, `status`, `payment_status`, `shipping_name`, `shipping_email`, `shipping_address`, `shipping_city`, `shipping_country`, `tracking_number`) VALUES
(1, 'MS-2026-98124', 5, 377.99, 0.00, 18.90, 0.00, 396.89, 'USD', 'Confirmed', 'escrow_held', 'Marcus Vance', 'marcus.vance@example.com', '742 Evergreen Terrace', 'San Francisco', 'United States', 'EXP-78901');

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `seller_id`, `product_name`, `unit_price`, `quantity`, `total_price`) VALUES
(1, 1, 1, 1, 'StudioMaster Pro ANC Over-Ear Wireless Headphones', 249.99, 1, 249.99),
(2, 1, 3, 3, 'Botanique Phyto-Renew Peptide Face Elixir (50ml)', 64.00, 2, 128.00);

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `rating`, `title`, `comment`) VALUES
(1, 1, 5, 5, 'Exceptional acoustic clarity and isolation', 'The planar dynamic drivers reproduce sub-bass frequencies cleanly without muddying the mids. Transcontinental shipping took only 3 business days to California!');
