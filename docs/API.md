# OmniTrade Global Marketplace — REST API Reference

Base URL: `http://localhost:5000/api`

All protected endpoints require the header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### Register Account
`POST /auth/register`
```json
{
  "name": "Marcus Vance",
  "email": "marcus@example.com",
  "password": "SecurePassword123!",
  "role": "customer",
  "preferred_currency": "USD"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account registered successfully.",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "usr_1042",
    "name": "Marcus Vance",
    "email": "marcus@example.com",
    "role": "customer",
    "preferred_currency": "USD"
  }
}
```

### Login
`POST /auth/login`
```json
{
  "email": "tokyo.audio@omnitrade.com",
  "password": "OmniTrade2026!"
}
```

### Current Profile
`GET /auth/profile` *(Protected)*

---

## 2. Product Endpoints

### List Products
`GET /products?search=audio&category=electronics&sort=price_asc&minPrice=50&maxPrice=1000`

### Get Product Details
`GET /products/:id` (Accepts UUID or slug `acousticlab-studio-master-h1`)

### Create Listing (Seller / Admin)
`POST /products` *(Protected: Seller/Admin)*
```json
{
  "title": "AcousticLab Solid State Desktop DAC",
  "category_id": "cat_elec",
  "price": 499.00,
  "stock_quantity": 25,
  "brand": "AcousticLab",
  "sku": "ACL-DAC-PRO",
  "description": "High-resolution desktop converter and balanced headphone amplifier."
}
```

### Update Listing
`PUT /products/:id` *(Protected: Owner/Admin)*

### Delete Listing
`DELETE /products/:id` *(Protected: Owner/Admin)*

### Submit Product Review
`POST /products/:id/reviews` *(Protected: Customer)*
```json
{
  "rating": 5,
  "title": "Masterful acoustics",
  "comment": "Neutral frequency response and pristine transient response."
}
```

---

## 3. Cart & Order Endpoints

### Calculate Cart & Taxes
`POST /orders/cart/calculate`
```json
{
  "items": [
    { "product_id": "prd_01", "quantity": 1 }
  ],
  "shipping_country": "USA",
  "promo_code": "GLOBAL10"
}
```

### Place Order
`POST /orders` *(Optional Authentication)*
```json
{
  "items": [
    { "product_id": "prd_01", "quantity": 1 }
  ],
  "shipping_address": {
    "recipient_name": "Marcus Vance",
    "street_address": "742 Evergreen Terrace",
    "city": "Seattle",
    "state_province": "WA",
    "postal_code": "98101",
    "country": "USA"
  },
  "payment_method": "credit_card",
  "promo_code": "GLOBAL10"
}
```

### View Order Details & Tracking
`GET /orders/:id` *(Protected)*

---

## 4. Seller & Admin Endpoints

### Seller Dashboard Analytics
`GET /seller/dashboard` *(Protected: Seller)*

### Update Order Status
`PATCH /seller/orders/:orderId/status` *(Protected: Seller)*
```json
{
  "status": "shipped",
  "note": "Package dispatched with DHL Express Tracking #DHL-GLOBAL-982140"
}
```

### Admin Platform Metrics
`GET /admin/metrics` *(Protected: Admin)*

### Update Seller Verification
`PATCH /admin/sellers/:id/status` *(Protected: Admin)*
```json
{
  "status": "verified"
}
```
