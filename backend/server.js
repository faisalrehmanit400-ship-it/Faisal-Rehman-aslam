/**
 * MarketSphere — International Multi-Vendor E-Commerce Marketplace
 * Express.js Backend Server Entry Point
 * Implements REST APIs for authentication, products, sellers, carts, orders, and administration.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment configuration
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const db = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const { authenticate } = require('./middleware/authMiddleware');

// Route modules
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productController = require('./controllers/productController');
const cartController = require('./controllers/cartController');

const app = express();
const PORT = process.env.PORT || 5000;

// ==============================================================================
// 1. CORS CONFIGURATION
// Supports VS Code Live Server (http://127.0.0.1:5500), Vite dev (3000), and custom CLIENT_URL
// ==============================================================================
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development for Live Server
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID', 'X-Requested-With']
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger in development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// Serve frontend static files if accessed directly on the backend port
app.use(express.static(path.join(__dirname, '../frontend')));

// ==============================================================================
// 2. HEALTH & SYSTEM DIAGNOSTICS
// ==============================================================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MarketSphere REST API is healthy and operational.',
    data: {
      service: 'MarketSphere Multi-Vendor Backend',
      version: '1.0.0',
      database: db.getIsConnected() ? 'MySQL Connected' : 'Resilient Repository (Standalone)',
      timestamp: new Date().toISOString()
    }
  });
});

// Dedicated categories route mapping
app.get('/api/categories', productController.getCategories);

// Dedicated wishlist router mapping
const wishlistRouter = express.Router();
wishlistRouter.use(authenticate);
wishlistRouter.get('/', cartController.getWishlist);
wishlistRouter.post('/', cartController.addToWishlist);
wishlistRouter.delete('/:productId', cartController.removeFromWishlist);
app.use('/api/wishlist', wishlistRouter);

// Dedicated reviews route mapping
const reviewsRouter = express.Router();
reviewsRouter.get('/product/:id', productController.getReviews);
reviewsRouter.post('/product/:id', authenticate, productController.addReview);
app.use('/api/reviews', reviewsRouter);

// ==============================================================================
// 3. MOUNT CORE REST API ROUTES
// ==============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// ==============================================================================
// 4. ERROR HANDLING
// ==============================================================================
app.use(notFoundHandler);
app.use(errorHandler);

// ==============================================================================
// 5. SERVER INITIALIZATION
// ==============================================================================
if (require.main === module) {
  // Test database connection on startup
  db.testConnection().then(() => {
    app.listen(PORT, () => {
      console.log(`
=============================================================
🚀 MarketSphere Multi-Vendor Backend Server Online
-------------------------------------------------------------
📡 Port:           ${PORT}
🌐 REST Base URL:  http://localhost:${PORT}/api
🛍️ Frontend Host:  ${path.join(__dirname, '../frontend')}
🗄️ Database:      ${process.env.DB_NAME || 'marketsphere_db'} (${process.env.DB_HOST || 'localhost'})
🔒 Auth System:    JWT + Bcrypt Hashing
=============================================================
      `);
    });
  });
}

module.exports = app;
