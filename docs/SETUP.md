# OmniTrade Global Marketplace — Setup & Installation Guide

This guide covers running the project locally, testing with VS Code Live Server, and connecting the backend API with PostgreSQL or MySQL.

---

## 1. Quick Start: VS Code Live Server (Static Frontend)

No npm install, no node modules, and no backend needed for initial design and customer flow testing!

1. Open VS Code.
2. Open the project root folder or navigate into `/frontend`.
3. If you have the **Live Server** extension installed (`ritwickdey.liveserver`):
   - Right-click `/frontend/index.html` and select **"Open with Live Server"** (or click **"Go Live"** in the VS Code status bar at the bottom right).
4. Your browser will automatically open:
   ```
   http://127.0.0.1:5500/frontend/index.html
   ```
5. You can immediately browse products, filter by category, add items to cart, checkout, switch roles (Customer, Seller, Admin), view order tracking, and add new products.

---

## 2. Full-Stack Setup (Node.js + Express Backend)

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- Optional: PostgreSQL 13+ or MySQL 8.0+

### Steps
1. In the project root, duplicate `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure your database connection in `.env` (or leave empty to run the backend in resilient sandbox memory mode).
3. Start the backend API server:
   ```bash
   node backend/server.js
   ```
   The API will listen at `http://localhost:5000`.

---

## 3. Database Schema Import

### For PostgreSQL:
```bash
createdb omnitrade_db
psql -d omnitrade_db -f database/schema.sql
psql -d omnitrade_db -f database/seeds.sql
```

### For MySQL:
```bash
mysql -u root -p -e "CREATE DATABASE omnitrade_db;"
mysql -u root -p omnitrade_db < database/schema.sql
mysql -u root -p omnitrade_db < database/seeds.sql
```

---

## 4. Default Demo Credentials

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Admin** | `admin@omnitrade.com` | `OmniTrade2026!` | Platform metrics, seller approvals, global order overview |
| **Seller (Tokyo Audio)** | `tokyo.audio@omnitrade.com` | `OmniTrade2026!` | Inventory control, add/edit products, sales analytics |
| **Customer** | `marcus.buyer@example.com` | `OmniTrade2026!` | Browsing, cart, checkout, order tracking, wishlist |
