# VS Code Live Server ("Go Live") Testing Guide

OmniTrade's frontend was engineered from the ground up to run seamlessly via the **VS Code Live Server** extension without requiring any build step, bundler, or terminal command.

---

## 1. How to Test via Live Server

1. Open the project in **VS Code**.
2. Install the **Live Server** extension if not already installed (Extension ID: `ritwickdey.liveserver`).
3. There are two supported ways to launch:
   - **Method A (Recommended)**: Right-click `/frontend/index.html` in the VS Code file explorer and click **"Open with Live Server"**.
   - **Method B**: Click the **"Go Live"** badge in the bottom-right status bar of VS Code.
4. Your default browser will navigate to:
   ```
   http://127.0.0.1:5500/frontend/index.html
   ```

---

## 2. Live Server Resilience Guarantees

- **No Missing File 404s**: All assets, images, CSS, and JS modules use strict relative paths (`./css/style.css`, `./js/app.js`, `./assets/images/...`).
- **Offline / Sandbox Mode**: The frontend detects whether the backend API is live at `http://localhost:5000/api`. If offline, it smoothly activates **Local Data Mode**, using the high-fidelity mock catalog and browser `localStorage` for all interactions (adding to cart, checkout, currency switching, seller inventory, reviews).
- **Clean Browser Console**: No unhandled promise rejections, missing font warnings, or undefined JavaScript errors.
- **Full Flow Operability**:
  - Test searching for "headphones" or "watch".
  - Test filtering by category: Electronics, Watches, Beauty.
  - Test sorting: Lowest Price, Highest Price, Top Rated.
  - Test clicking a product to view the Product Detail modal or page with full specifications and verified reviews.
  - Test adding variants to the cart, modifying quantities, and applying promo code `GLOBAL10`.
  - Test completing checkout with the safe mock payment form.
  - Test switching user roles from the header (Customer / Seller / Admin) to preview the Seller Inventory portal or Platform Admin statistics!
