/**
 * MarketSphere - Automated End-to-End API Test Suite
 * Tests all core REST endpoints against the Express application instance.
 */

const http = require('http');
const app = require('../server');

function request(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting MarketSphere Backend Automated API Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`[Test Server] Bound to ephemeral port: ${port}`);

  try {
    // 1. Healthcheck
    const resHealth = await request(server, { path: '/api/health' });
    assert(resHealth.statusCode === 200 && resHealth.body.success === true, 'Health check responds 200 OK');

    // 2. Categories
    const resCats = await request(server, { path: '/api/categories' });
    assert(resCats.statusCode === 200 && Array.isArray(resCats.body.data), 'Categories endpoint returns list of categories');

    // 3. Products list
    const resProds = await request(server, { path: '/api/products' });
    assert(resProds.statusCode === 200 && resProds.body.data.length >= 8, 'Products catalog returns at least 8 items');

    // 4. Product search & filter
    const resSearch = await request(server, { path: '/api/products?search=headphones' });
    assert(resSearch.statusCode === 200 && resSearch.body.data.length > 0, 'Product search for "headphones" matches item');

    // 5. Product details
    const resProd1 = await request(server, { path: '/api/products/1' });
    assert(resProd1.statusCode === 200 && resProd1.body.data.id === 1, 'Product details endpoint returns item #1');

    // 6. User Login (Customer: marcus.vance@example.com / Password123!)
    const resLogin = await request(server, { path: '/api/auth/login', method: 'POST' }, {
      email: 'marcus.vance@example.com',
      password: 'Password123!'
    });
    assert(resLogin.statusCode === 200 && resLogin.body.data.token, 'Customer login succeeds and returns JWT token');
    const customerToken = resLogin.body.data ? resLogin.body.data.token : null;

    // 7. Get Current User profile (/api/auth/me)
    const resMe = await request(server, {
      path: '/api/auth/me',
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(resMe.statusCode === 200 && resMe.body.data.user.email === 'marcus.vance@example.com', 'Get current user returns profile');

    // 8. Admin login and role protection check
    const resAdminLogin = await request(server, { path: '/api/auth/login', method: 'POST' }, {
      email: 'admin@marketsphere.io',
      password: 'Password123!'
    });
    assert(resAdminLogin.statusCode === 200 && resAdminLogin.body.data.user.role === 'admin', 'Admin login succeeds with admin role');
    const adminToken = resAdminLogin.body.data ? resAdminLogin.body.data.token : null;

    // 9. Admin Stats endpoint (with admin token)
    const resAdminStats = await request(server, {
      path: '/api/admin/stats',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(resAdminStats.statusCode === 200 && resAdminStats.body.data.total_products > 0, 'Admin can access platform governance stats');

    // 10. Normal customer BLOCKED from admin stats (Forbidden 403)
    const resBlockedAdmin = await request(server, {
      path: '/api/admin/stats',
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(resBlockedAdmin.statusCode === 403, 'Normal customer is blocked from admin endpoints (403 Forbidden)');

    // 11. Cart API - Get Cart
    const resCart = await request(server, {
      path: '/api/cart',
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(resCart.statusCode === 200 && Array.isArray(resCart.body.data.items), 'Cart endpoint returns calculated items and total');

    // 12. Cart API - Add Item
    const resAddCart = await request(server, {
      path: '/api/cart/items',
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` }
    }, { product_id: 2, quantity: 1 });
    assert(resAddCart.statusCode === 201 && resAddCart.body.data.items.length > 0, 'Add item to cart updates bag calculation');

    // 13. Promo Code validation
    const resPromo = await request(server, {
      path: '/api/cart/promo',
      method: 'POST'
    }, { code: 'SPHERE10' });
    assert(resPromo.statusCode === 200 && resPromo.body.data.discount_percent === 0.1, 'Promo code SPHERE10 gives 10% discount');

    // 14. Order Checkout (Server-authoritative database price calculation)
    const resOrder = await request(server, {
      path: '/api/orders',
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` }
    }, {
      shipping_name: 'Marcus Vance',
      shipping_email: 'marcus.vance@example.com',
      shipping_address: '742 Evergreen Terrace',
      shipping_city: 'San Francisco',
      shipping_country: 'United States',
      items: [{ product_id: 1, quantity: 1 }]
    });
    assert(resOrder.statusCode === 201 && resOrder.body.data.order_number, `Order placed successfully (Order #${resOrder.body.data?.order_number})`);

    // 15. Track order endpoint
    if (resOrder.body.data?.order_number) {
      const resTrack = await request(server, {
        path: `/api/orders/track/${resOrder.body.data.order_number}`
      });
      assert(resTrack.statusCode === 200 && resTrack.body.data.status === 'Confirmed', 'Order tracking returns express logistics details');
    }

    // 16. Customer reviews API
    const resReview = await request(server, {
      path: '/api/products/2/reviews',
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` }
    }, {
      rating: 5,
      title: 'Precision titanium luxury',
      comment: 'Superb balance on the wrist and completely silent automatic rotor movement.'
    });
    assert(resReview.statusCode === 201, 'Customer can submit verified product review');

    // 17. Wishlist API
    const resWishlistAdd = await request(server, {
      path: '/api/wishlist',
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` }
    }, { product_id: 4 });
    assert(resWishlistAdd.statusCode === 201, 'Product saved to customer wishlist');

    const resWishlistGet = await request(server, {
      path: '/api/wishlist',
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(resWishlistGet.statusCode === 200 && resWishlistGet.body.data.length > 0, 'Get wishlist returns saved items');

    // 18. Seller Dashboard
    const resSellerLogin = await request(server, { path: '/api/auth/login', method: 'POST' }, {
      email: 'acoustic@tokyo.jp',
      password: 'Password123!'
    });
    const sellerToken = resSellerLogin.body.data?.token;
    const resSellerDash = await request(server, {
      path: '/api/sellers/me/dashboard',
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    assert(resSellerDash.statusCode === 200 && resSellerDash.body.data.stats, 'Seller can access merchant metrics and orders');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log(`\n--- Test Results: ${passed} Passed, ${failed} Failed ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
