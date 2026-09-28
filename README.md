# MarketSphere — International Multi-Vendor E-Commerce Marketplace
*"Discover. Shop. Sell."*

MarketSphere is a production-ready, international cross-border multi-vendor marketplace platform. It connects verified global artisans, technology laboratories, and horology ateliers directly with discerning international consumers.

---

## 1. Project Directory Architecture

```
MarketSphere/
│
├── frontend/                     # Step 1: 100% Live Server Compatible Frontend
│   ├── index.html                # Main marketplace storefront & modal dialogs
│   ├── css/
│   │   └── style.css             # Complete responsive design system (1,682 lines)
│   ├── js/
│   │   ├── app.js                # State, cart, wishlist, search, filter, checkout
│   │   └── products.js           # 24 demo products across 9 categories
│   └── assets/
│       └── images/               # High-resolution local imagery
│           ├── hero.jpg
│           ├── headphones.jpg
│           ├── watch.jpg
│           └── serum.jpg
│
├── backend/                      # Step 2: Node.js + Express + MySQL REST API
│   ├── server.js                 # Server entry point & CORS configuration
│   ├── package.json              # Backend dependencies & npm scripts
│   ├── .env.example              # Environment variables template
│   │
│   ├── config/
│   │   └── database.js           # MySQL2 connection pool with dev fallback
│   │
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, JWT issuance, profile
│   │   ├── productController.js  # CRUD catalog operations, search, filters, reviews
│   │   ├── sellerController.js   # Merchant storefronts, analytics, order status
│   │   ├── orderController.js    # Escrow checkout, database price verification, tracking
│   │   ├── cartController.js     # Server-authoritative cart sessions & wishlists
│   │   └── adminController.js    # Platform governance, GMV metrics, user moderation
│   │
│   ├── models/
│   │   ├── User.js               # Account entity with Bcrypt password hashing
│   │   ├── Seller.js             # Multi-vendor store profiles & sales volume
│   │   ├── Product.js            # Product catalog, stock management, categories
│   │   ├── Order.js              # Order records & escrow lifecycle
│   │   ├── OrderItem.js          # Multi-vendor individual order line items
│   │   ├── Cart.js               # Live server pricing, fee & duty computation
│   │   └── Review.js             # Customer ratings (1-5 stars) & verified feedback
│   │
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── productRoutes.js      # /api/products
│   │   ├── sellerRoutes.js       # /api/sellers
│   │   ├── orderRoutes.js        # /api/orders
│   │   ├── cartRoutes.js         # /api/cart & /api/wishlist
│   │   └── adminRoutes.js        # /api/admin
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js     # Bearer token JWT authentication & optionalAuth
│   │   ├── adminMiddleware.js    # Role-based admin route protection
│   │   └── errorMiddleware.js    # Centralized JSON error formatting & 404 handler
│   │
│   ├── database/
│   │   └── schema.sql            # Complete relational MySQL schema & seed data
│   │
│   └── test/
│       └── api-test.js           # Automated end-to-end API test suite (19 tests)
│
├── database/
│   └── schema.sql                # Root duplicate of MySQL schema & seed records
│
└── README.md                     # Comprehensive installation & documentation guide
```

---

## 2. Prerequisites & Environment Setup

### 2.1 Installing Node.js
Ensure Node.js (version 18.0.0 or later) and npm are installed on your workstation:
```bash
node -v    # Expected: v18.x.x, v20.x.x, or v22.x.x
npm -v     # Expected: 9.x.x or 10.x.x
```
If not installed, download the LTS release from [nodejs.org](https://nodejs.org/).

### 2.2 Installing Backend Dependencies
Navigate to the `backend/` folder and install dependencies:
```bash
cd backend
npm install
```
Key packages installed:
- `express` — Web framework and routing
- `mysql2` — High-performance MySQL connection pool with promise support
- `jsonwebtoken` — Secure JWT token generation and verification
- `bcryptjs` — Salted one-way password hashing (never stores plaintext)
- `cors` — Cross-Origin Resource Sharing for frontend compatibility
- `dotenv` — Zero-dependency environment variable loader
- `nodemon` *(dev)* — Automatic server restart on file edits

---

## 3. Database Setup (MySQL)

### 3.1 Creating the MySQL Database
Log into your MySQL CLI or administration tool (e.g. MySQL Workbench, phpMyAdmin, TablePlus):
```sql
CREATE DATABASE IF NOT EXISTS marketsphere_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 3.2 Executing `schema.sql`
Run the migration script to create all 11 tables and populate initial demo data:
```bash
# Using MySQL Command Line Client:
mysql -u root -p marketsphere_db < backend/database/schema.sql
```
Or open `backend/database/schema.sql` in MySQL Workbench or TablePlus and execute the script.

#### Database Tables Created:
1. `users` — Customers, sellers, and administrators with Bcrypt password hashes
2. `sellers` — Multi-vendor storefront profiles, verified trust badges, total revenue
3. `categories` — 9 marketplace departments (Electronics, Watches, Beauty, etc.)
4. `products` — Complete international catalog with stock, SKU, prices, and discounts
5. `carts` — User and guest shopping cart sessions
6. `cart_items` — Line items linked to carts and products
7. `orders` — Escrow-protected orders with DDP customs and delivery details
8. `order_items` — Multi-vendor split items with unit and total prices
9. `reviews` — Verified customer product feedback (1 to 5 stars)
10. `wishlists` — Customer saved wishlist records
11. `wishlist_items` — Saved products per user

---

## 4. Environment Configuration (`.env`)

Copy the template from `backend/.env.example` to create `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

Configure your local MySQL parameters:
```env
PORT=5000
NODE_ENV=development

# MySQL Database Connection
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=marketsphere_db
DB_PORT=3306

# JWT Secret & Expiration
JWT_SECRET=marketsphere_ultra_secure_jwt_secret_token_2026_x89!
JWT_EXPIRES_IN=7d

# CORS Allowed Origin for Frontend Client
CLIENT_URL=http://127.0.0.1:5500
```

*Note: If MySQL is not running during local quick testing, the backend will automatically use its internal memory repository seeded with `schema.sql` data so that tests and endpoint verification execute without crashing!*

---

## 5. Starting the Backend Server

To start in production mode:
```bash
cd backend
npm start
```

To start in development mode with live reloading:
```bash
cd backend
npm run dev
```

The server will launch at:
```
http://localhost:5000/api
```

---

## 6. REST API Reference

All responses conform to standard JSON format:
```json
// Success Response:
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}

// Error Response:
{
  "success": false,
  "message": "Error description"
}
```

### 6.1 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer or seller (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Authenticate user, returns JWT token |
| `POST` | `/api/auth/logout` | Public | Invalidate client session |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update user name, phone, address, country |
| `PUT` | `/api/auth/change-password` | Authenticated | Change password (verifies current password) |

### 6.2 Products & Catalog (`/api/products` & `/api/categories`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List products (supports `?search=`, `?category=`, `?sort=`, `?flash=true`) |
| `GET` | `/api/products/:id` | Public | Get single product with specifications and reviews |
| `POST` | `/api/products` | Seller/Admin | Publish new product listing |
| `PUT` | `/api/products/:id` | Seller/Admin | Update product (restricted to product owner) |
| `DELETE` | `/api/products/:id` | Seller/Admin | Delete product (restricted to product owner) |
| `GET` | `/api/categories` | Public | List all 9 marketplace departments |
| `GET` | `/api/products/:id/reviews` | Public | Get customer reviews for a product |
| `POST` | `/api/products/:id/reviews` | Authenticated | Submit product review (1-5 stars) |

### 6.3 Shopping Cart & Wishlist (`/api/cart` & `/api/wishlist`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Optional Auth | Get cart with server-calculated subtotal, tax, shipping |
| `POST` | `/api/cart/items` | Optional Auth | Add item to cart (validates inventory stock) |
| `PUT` | `/api/cart/items/:productId` | Optional Auth | Update item quantity |
| `DELETE` | `/api/cart/items/:productId` | Optional Auth | Remove item from cart |
| `DELETE` | `/api/cart` | Optional Auth | Clear entire shopping bag |
| `POST` | `/api/cart/promo` | Public | Validate promo codes (`SPHERE10`, `WELCOME20`) |
| `GET` | `/api/wishlist` | Authenticated | Retrieve user saved wishlist items |
| `POST` | `/api/wishlist` | Authenticated | Save product to wishlist |
| `DELETE` | `/api/wishlist/:productId` | Authenticated | Remove product from wishlist |

### 6.4 Orders & Checkout (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Authenticated | Place escrow-secured order (validates server prices & stock) |
| `GET` | `/api/orders` | Authenticated | Get customer order history |
| `GET` | `/api/orders/:id` | Authenticated | Get order receipt with item breakdown |
| `GET` | `/api/orders/track/:orderNumber` | Public | Track package delivery & carrier status |

### 6.5 Seller Portal (`/api/sellers`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/sellers/register` | Authenticated | Register seller storefront profile |
| `GET` | `/api/sellers/:id` | Public | View public vendor storefront & items |
| `GET` | `/api/sellers/me/dashboard` | Seller | Seller metrics (revenue, orders, low stock alerts) |
| `PUT` | `/api/sellers/me` | Seller | Update storefront description, country, banner |
| `GET` | `/api/sellers/me/orders` | Seller | View orders containing vendor items |
| `PUT` | `/api/sellers/orders/:orderId/status` | Seller/Admin | Update item fulfillment status |

### 6.6 Platform Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin Only | Platform GMV, orders, user count, commission |
| `GET` | `/api/admin/users` | Admin Only | List and manage all registered users |
| `GET` | `/api/admin/sellers` | Admin Only | Review vendor accreditation |
| `GET` | `/api/admin/orders` | Admin Only | Platform-wide order oversight |
| `DELETE` | `/api/admin/products/:id` | Admin Only | Administrative catalog moderation |
| `DELETE` | `/api/admin/reviews/:id` | Admin Only | Remove flagged customer reviews |

---

## 7. How Authentication & Security Work

1. **Password Hashing**: User passwords are never saved in plaintext. They are salted and hashed using **Bcrypt** (`bcryptjs.hash(password, 10)`).
2. **JWT Issuance**: Upon successful `/api/auth/login` or `/api/auth/register`, the server generates a cryptographically signed JSON Web Token (JWT) using the `JWT_SECRET` key.
3. **Protected Endpoints**: The client transmits this token in the HTTP `Authorization` header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```
4. **Role-Based Authorization (RBAC)**:
   - `authMiddleware` validates token expiration and decodes user.
   - `adminMiddleware` rejects any non-admin requests with `403 Forbidden`.
   - Sellers can only modify products and orders belonging to their own storefront.
5. **Server-Authoritative Pricing**: The backend **never trusts client-sent prices**. When placing an order, item prices, subtotal, DDP customs duty (5%), and shipping fees are calculated directly from verified database records.

---

## 8. Automated API Verification

An automated test suite is provided in `backend/test/api-test.js`. To run all 19 integration tests:
```bash
node backend/test/api-test.js
```
The test suite verifies:
- Health check & database connection
- Product listing, search, and category filtering
- User registration and login
- JWT issuance and Bearer token parsing
- Admin role protection (customer blocked with 403 Forbidden)
- Cart calculations and promo code discounts
- Server-authoritative checkout and stock deduction
- Multi-vendor order creation and express tracking
- Customer reviews and wishlist endpoints
- Seller metrics dashboard

---

## 9. How the Frontend Connects (Step 3 Integration Path)

The existing MarketSphere frontend (`frontend/index.html`) currently runs standalone with demo data for VS Code Live Server.

In the upcoming Step 3 integration:
1. `frontend/js/app.js` will configure an `API_BASE_URL`:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```
2. Dynamic fetch calls will replace static data:
   - `fetch(`${API_BASE_URL}/products`)` for the catalog grid
   - `fetch(`${API_BASE_URL}/cart`)` for the slide-over drawer
   - `fetch(`${API_BASE_URL}/orders`, { method: 'POST', ... })` for checkout
3. Tokens will be stored in `localStorage.getItem('marketsphere_token')` and attached as `Authorization: Bearer ${token}`.
4. If the backend is offline, the frontend's built-in demo fallback will activate automatically, ensuring zero broken pages or console errors.
