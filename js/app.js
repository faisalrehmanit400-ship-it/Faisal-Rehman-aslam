/**
 * MarketSphere - Global Multi-Vendor Marketplace Core Controller
 * Vanilla JavaScript application controller.
 * Manages state, localStorage persistence, currency conversions,
 * cart drawer, product quick view modals, checkout simulator,
 * flash sale countdown, category filtering, search, sorting, and toast alerts.
 * 
 * Works 100% offline with VS Code Live Server ("Go Live"). Zero dependencies.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. STATE & STORAGE MANAGEMENT
  // ==========================================================================
  const CURRENCIES = {
    USD: { symbol: '$', rate: 1.0, format: (v) => `$${v.toFixed(2)}` },
    EUR: { symbol: '€', rate: 0.92, format: (v) => `€${(v * 0.92).toFixed(2)}` },
    GBP: { symbol: '£', rate: 0.79, format: (v) => `£${(v * 0.79).toFixed(2)}` },
    JPY: { symbol: '¥', rate: 155, format: (v) => `¥${Math.round(v * 155).toLocaleString()}` },
    CAD: { symbol: 'CA$', rate: 1.36, format: (v) => `CA$${(v * 1.36).toFixed(2)}` }
  };

  const PROMO_CODES = {
    'SPHERE10': 0.10,
    'WELCOME20': 0.20,
    'GLOBAL15': 0.15
  };

  // Safe localStorage accessor
  const storage = {
    get: (key, fallback) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set: (key, val) => {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn('Storage quota exceeded or unavailable', e);
      }
    }
  };

  const state = {
    products: typeof PRODUCTS !== 'undefined' ? PRODUCTS : [],
    currency: storage.get('marketsphere_currency', 'USD'),
    cart: storage.get('marketsphere_cart', [
      { id: 'prod-001', qty: 1 },
      { id: 'prod-003', qty: 2 }
    ]),
    wishlist: storage.get('marketsphere_wishlist', ['prod-002']),
    selectedCategory: 'all',
    searchQuery: '',
    sortBy: 'featured',
    appliedPromo: null,
    discountPercent: 0,
    activeModalProduct: null
  };

  // ==========================================================================
  // 2. HELPER FUNCTIONS
  // ==========================================================================
  function formatMoney(amountInUSD) {
    const cur = CURRENCIES[state.currency] || CURRENCIES.USD;
    return cur.format(Number(amountInUSD) || 0);
  }

  function getProductById(id) {
    return state.products.find((p) => p.id === id) || null;
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    }

    toast.innerHTML = `
      <span class="toast-icon">${iconSvg}</span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }

  function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHtml += '★';
      } else if (i === fullStars && hasHalf) {
        starsHtml += '★';
      } else {
        starsHtml += '☆';
      }
    }
    return `<span class="stars" title="${rating} out of 5 stars">${starsHtml}</span>`;
  }

  // ==========================================================================
  // 3. CART OPERATIONS
  // ==========================================================================
  function saveCart() {
    storage.set('marketsphere_cart', state.cart);
    updateCartUI();
  }

  function addToCart(productId, quantity = 1, silent = false) {
    const product = getProductById(productId);
    if (!product) return;

    const existingIndex = state.cart.findIndex((item) => item.id === productId);
    if (existingIndex > -1) {
      state.cart[existingIndex].qty += quantity;
    } else {
      state.cart.push({ id: productId, qty: quantity });
    }

    saveCart();

    if (!silent) {
      showToast(`Added <strong>${product.name.slice(0, 32)}...</strong> to bag`);
    }
  }

  function updateCartQuantity(productId, delta) {
    const item = state.cart.find((c) => c.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(productId, true);
      return;
    }
    saveCart();
  }

  function removeFromCart(productId, silent = false) {
    const product = getProductById(productId);
    state.cart = state.cart.filter((c) => c.id !== productId);
    saveCart();
    if (!silent && product) {
      showToast(`Removed item from cart`);
    }
  }

  function clearCart() {
    state.cart = [];
    state.appliedPromo = null;
    state.discountPercent = 0;
    saveCart();
    showToast('Shopping bag cleared');
  }

  function calculateCartTotals() {
    let subtotalUSD = 0;
    let totalItems = 0;

    state.cart.forEach((item) => {
      const prod = getProductById(item.id);
      if (prod) {
        subtotalUSD += prod.price * item.qty;
        totalItems += item.qty;
      }
    });

    const discountAmountUSD = subtotalUSD * (state.discountPercent || 0);
    const discountedSubtotalUSD = subtotalUSD - discountAmountUSD;
    
    // Free shipping above $100 USD equivalent, otherwise $12 USD flat international DDP
    const shippingUSD = subtotalUSD > 100 || subtotalUSD === 0 ? 0 : 12.0;
    // Estimated tax/duties 5%
    const taxUSD = discountedSubtotalUSD > 0 ? discountedSubtotalUSD * 0.05 : 0;
    const finalTotalUSD = discountedSubtotalUSD + shippingUSD + taxUSD;

    return {
      subtotalUSD,
      discountAmountUSD,
      discountedSubtotalUSD,
      shippingUSD,
      taxUSD,
      finalTotalUSD,
      totalItems
    };
  }

  function updateCartUI() {
    const totals = calculateCartTotals();

    // Badges in header and mobile nav
    document.querySelectorAll('.cart-count-badge').forEach((badge) => {
      badge.textContent = totals.totalItems;
      badge.style.display = totals.totalItems > 0 ? 'flex' : 'none';
    });

    // Drawer elements
    const drawerItemsEl = document.getElementById('cart-drawer-items');
    const drawerSubtotalEl = document.getElementById('cart-subtotal');
    const drawerDiscountEl = document.getElementById('cart-discount');
    const drawerDiscountRow = document.getElementById('cart-discount-row');
    const drawerShippingEl = document.getElementById('cart-shipping');
    const drawerTaxEl = document.getElementById('cart-tax');
    const drawerTotalEl = document.getElementById('cart-total');
    const drawerEmptyEl = document.getElementById('cart-empty-message');
    const drawerFooterEl = document.getElementById('cart-drawer-footer');
    const checkoutBtn = document.getElementById('btn-proceed-checkout');

    if (!drawerItemsEl) return;

    if (state.cart.length === 0) {
      drawerItemsEl.innerHTML = '';
      if (drawerEmptyEl) drawerEmptyEl.style.display = 'block';
      if (drawerFooterEl) drawerFooterEl.style.display = 'none';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (drawerEmptyEl) drawerEmptyEl.style.display = 'none';
    if (drawerFooterEl) drawerFooterEl.style.display = 'flex';
    if (checkoutBtn) checkoutBtn.disabled = false;

    drawerItemsEl.innerHTML = state.cart
      .map((item) => {
        const prod = getProductById(item.id);
        if (!prod) return '';

        const itemTotal = prod.price * item.qty;

        return `
          <div class="cart-item" data-id="${prod.id}">
            <img 
              src="${prod.image}" 
              alt="${prod.name}" 
              class="cart-item-thumb" 
              onerror="this.src='${prod.fallbackImage}'" 
            />
            <div class="cart-item-details">
              <div class="cart-item-title" onclick="window.MarketSphere.openProductDetails('${prod.id}')">${prod.name}</div>
              <div class="cart-item-seller">Seller: ${prod.seller} · <span>${prod.sellerCountry}</span></div>
              <div class="cart-item-bottom">
                <div class="qty-stepper">
                  <button type="button" class="qty-btn" onclick="window.MarketSphere.updateQuantity('${prod.id}', -1)" aria-label="Decrease quantity">−</button>
                  <span class="qty-val">${item.qty}</span>
                  <button type="button" class="qty-btn" onclick="window.MarketSphere.updateQuantity('${prod.id}', 1)" aria-label="Increase quantity">+</button>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="cart-item-price">${formatMoney(itemTotal)}</span>
                  <button type="button" class="cart-item-remove" onclick="window.MarketSphere.removeFromCart('${prod.id}')" title="Remove item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    if (drawerSubtotalEl) drawerSubtotalEl.textContent = formatMoney(totals.subtotalUSD);
    
    if (drawerDiscountRow && drawerDiscountEl) {
      if (totals.discountAmountUSD > 0) {
        drawerDiscountRow.style.display = 'flex';
        drawerDiscountEl.textContent = `-${formatMoney(totals.discountAmountUSD)} (${state.appliedPromo})`;
      } else {
        drawerDiscountRow.style.display = 'none';
      }
    }

    if (drawerShippingEl) {
      drawerShippingEl.textContent = totals.shippingUSD === 0 ? 'FREE (Over $100)' : formatMoney(totals.shippingUSD);
    }
    if (drawerTaxEl) drawerTaxEl.textContent = formatMoney(totals.taxUSD);
    if (drawerTotalEl) drawerTotalEl.textContent = formatMoney(totals.finalTotalUSD);
  }

  // ==========================================================================
  // 4. WISHLIST OPERATIONS
  // ==========================================================================
  function saveWishlist() {
    storage.set('marketsphere_wishlist', state.wishlist);
    updateWishlistUI();
  }

  function toggleWishlist(productId) {
    const prod = getProductById(productId);
    if (!prod) return;

    const idx = state.wishlist.indexOf(productId);
    if (idx > -1) {
      state.wishlist.splice(idx, 1);
      showToast(`Removed <strong>${prod.name.slice(0, 24)}...</strong> from wishlist`);
    } else {
      state.wishlist.push(productId);
      showToast(`Saved <strong>${prod.name.slice(0, 24)}...</strong> to wishlist`);
    }
    saveWishlist();
    renderAllProductGrids();
  }

  function updateWishlistUI() {
    document.querySelectorAll('.wishlist-count-badge').forEach((badge) => {
      badge.textContent = state.wishlist.length;
      badge.style.display = state.wishlist.length > 0 ? 'flex' : 'none';
    });

    // Update wishlist modal if open
    const wishlistItemsEl = document.getElementById('wishlist-modal-items');
    if (wishlistItemsEl) {
      if (state.wishlist.length === 0) {
        wishlistItemsEl.innerHTML = `
          <div style="text-align:center; padding:32px 16px; color:var(--text-muted);">
            <p style="font-size:16px; font-weight:600; margin-bottom:8px;">Your Wishlist is Empty</p>
            <p style="font-size:13px;">Click the heart icon on any product to save items for later.</p>
          </div>
        `;
      } else {
        wishlistItemsEl.innerHTML = state.wishlist
          .map((id) => {
            const prod = getProductById(id);
            if (!prod) return '';
            return `
              <div class="cart-item" style="align-items:center;">
                <img src="${prod.image}" alt="${prod.name}" class="cart-item-thumb" onerror="this.src='${prod.fallbackImage}'" />
                <div class="cart-item-details">
                  <div class="cart-item-title">${prod.name}</div>
                  <div class="cart-item-seller">Seller: ${prod.seller} · ${formatMoney(prod.price)}</div>
                </div>
                <div style="display:flex; gap:6px;">
                  <button type="button" class="btn-primary" style="padding:6px 12px; font-size:12px;" onclick="window.MarketSphere.moveWishlistToCart('${prod.id}')">Add to Bag</button>
                  <button type="button" class="qty-btn" style="border-radius:4px;" onclick="window.MarketSphere.toggleWishlist('${prod.id}')" title="Remove">✕</button>
                </div>
              </div>
            `;
          })
          .join('');
      }
    }
  }

  function moveWishlistToCart(productId) {
    addToCart(productId, 1);
    const idx = state.wishlist.indexOf(productId);
    if (idx > -1) {
      state.wishlist.splice(idx, 1);
      saveWishlist();
    }
    openCartDrawer();
  }

  // ==========================================================================
  // 5. PRODUCT RENDERING CARDS & GRIDS
  // ==========================================================================
  function createProductCardHTML(prod) {
    const isWishlisted = state.wishlist.includes(prod.id);
    const oldPriceHTML = prod.oldPrice ? `<span class="old-price">${formatMoney(prod.oldPrice)}</span>` : '';
    const discountBadgeHTML = prod.discount
      ? `<span class="product-discount-badge">-${prod.discount}%</span>`
      : '';

    return `
      <article class="product-card" data-id="${prod.id}">
        <div class="product-thumb-box">
          ${discountBadgeHTML}
          <button 
            type="button" 
            class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" 
            onclick="window.MarketSphere.toggleWishlist('${prod.id}')" 
            title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
            aria-label="Wishlist toggle"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <img 
            src="${prod.image}" 
            alt="${prod.name}" 
            class="product-img" 
            loading="lazy" 
            onerror="this.src='${prod.fallbackImage}'"
            onclick="window.MarketSphere.openProductDetails('${prod.id}')"
          />
        </div>
        <div class="product-card-body">
          <div class="product-category-row">
            <span>${prod.category}</span>
            <span class="product-seller" title="Seller: ${prod.seller}">${prod.seller}</span>
          </div>
          <h3 class="product-card-title" onclick="window.MarketSphere.openProductDetails('${prod.id}')">${prod.name}</h3>
          <div class="product-rating-row">
            ${renderStars(prod.rating)}
            <span>(${prod.reviewCount})</span>
          </div>
          <div class="product-price-row">
            <span class="current-price">${formatMoney(prod.price)}</span>
            ${oldPriceHTML}
          </div>
          <div class="product-card-actions">
            <button 
              type="button" 
              class="btn-card-cart" 
              onclick="window.MarketSphere.addToCart('${prod.id}', 1)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span>Add to Bag</span>
            </button>
            <button 
              type="button" 
              class="btn-card-quickview" 
              onclick="window.MarketSphere.openProductDetails('${prod.id}')" 
              title="Quick view product specs"
              aria-label="Quick View"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderFlashSaleGrid() {
    const container = document.getElementById('flash-sale-grid');
    if (!container) return;

    const flashProducts = state.products.filter((p) => p.isFlashSale).slice(0, 4);
    container.innerHTML = flashProducts.map(createProductCardHTML).join('');
  }

  function renderTrendingGrid() {
    const container = document.getElementById('trending-grid');
    if (!container) return;

    const trendingProducts = state.products.filter((p) => p.isTrending).slice(0, 4);
    container.innerHTML = trendingProducts.map(createProductCardHTML).join('');
  }

  function renderBestSellersGrid() {
    const container = document.getElementById('bestsellers-grid');
    if (!container) return;

    const bestSellers = state.products.filter((p) => p.isBestSeller).slice(0, 4);
    container.innerHTML = bestSellers.map(createProductCardHTML).join('');
  }

  function renderMainCatalog() {
    const container = document.getElementById('main-catalog-grid');
    const countEl = document.getElementById('catalog-results-count');
    if (!container) return;

    let items = [...state.products];

    // Filter by Category
    if (state.selectedCategory !== 'all') {
      items = items.filter((p) => p.category.toLowerCase() === state.selectedCategory.toLowerCase());
    }

    // Filter by Search Query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.seller.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (state.sortBy === 'price_asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === 'price_desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (state.sortBy === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    } else if (state.sortBy === 'discount') {
      items.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    if (countEl) {
      countEl.textContent = `Showing ${items.length} ${items.length === 1 ? 'item' : 'items'}`;
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
          <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">No products found</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Try adjusting your keyword or reset filters to see all available marketplace items.</p>
          <button type="button" class="btn-primary" onclick="window.MarketSphere.resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(createProductCardHTML).join('');
  }

  function renderAllProductGrids() {
    renderFlashSaleGrid();
    renderTrendingGrid();
    renderBestSellersGrid();
    renderMainCatalog();
  }

  // ==========================================================================
  // 6. FLASH SALE COUNTDOWN TIMER
  // ==========================================================================
  function initFlashSaleTimer() {
    const hoursEl = document.getElementById('flash-hours');
    const minsEl = document.getElementById('flash-mins');
    const secsEl = document.getElementById('flash-secs');
    if (!hoursEl || !minsEl || !secsEl) return;

    // Reset daily countdown anchor: 8 hours, 45 minutes, 30 seconds
    let totalSeconds = 8 * 3600 + 45 * 60 + 30;

    setInterval(() => {
      if (totalSeconds <= 0) {
        totalSeconds = 24 * 3600;
      }
      totalSeconds--;

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      hoursEl.textContent = String(h).padStart(2, '0');
      minsEl.textContent = String(m).padStart(2, '0');
      secsEl.textContent = String(s).padStart(2, '0');
    }, 1000);
  }

  // ==========================================================================
  // 7. PRODUCT DETAILS MODAL (QUICK VIEW)
  // ==========================================================================
  function openProductDetails(productId) {
    const prod = getProductById(productId);
    if (!prod) return;

    state.activeModalProduct = prod;

    const modal = document.getElementById('product-details-modal');
    const modalBody = document.getElementById('product-modal-body');
    if (!modal || !modalBody) return;

    const isWishlisted = state.wishlist.includes(prod.id);
    const oldPriceHTML = prod.oldPrice ? `<span class="old-price" style="font-size:16px;">${formatMoney(prod.oldPrice)}</span>` : '';
    const discountBadgeHTML = prod.discount ? `<span class="product-discount-badge" style="position:static;">Save ${prod.discount}%</span>` : '';

    let specsRows = '';
    if (prod.specs && typeof prod.specs === 'object') {
      specsRows = Object.entries(prod.specs)
        .map(([key, val]) => `<tr><td>${key}</td><td>${val}</td></tr>`)
        .join('');
    }

    modalBody.innerHTML = `
      <div class="modal-details-grid">
        <div class="modal-img-wrap">
          <img src="${prod.image}" alt="${prod.name}" class="modal-img" onerror="this.src='${prod.fallbackImage}'" />
        </div>
        <div>
          <div class="modal-meta-row">
            <span>${prod.category}</span>
            <span>·</span>
            <span>Seller: <strong>${prod.seller}</strong> (${prod.sellerCountry}) ★ ${prod.sellerRating || '4.9'}</span>
          </div>
          <h2 class="modal-title">${prod.name}</h2>
          <div class="modal-rating-badge">
            ${renderStars(prod.rating)}
            <span style="font-weight:600; color:var(--text-main);">${prod.rating}</span>
            <span>(${prod.reviewCount} verified international reviews)</span>
          </div>
          <div class="modal-price-box">
            <span class="modal-price">${formatMoney(prod.price)}</span>
            ${oldPriceHTML}
            ${discountBadgeHTML}
          </div>
          <div class="modal-stock-status ${prod.stock < 10 ? 'low' : ''}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            <span>${prod.stock > 0 ? `In Stock (${prod.stock} units ready for priority air dispatch)` : 'Temporarily Out of Stock'}</span>
          </div>
          <p class="modal-desc">${prod.description}</p>
          
          ${specsRows ? `
            <h4 style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-main); margin-bottom:8px;">Specifications</h4>
            <table class="modal-specs-table">
              <tbody>
                ${specsRows}
              </tbody>
            </table>
          ` : ''}

          <div class="modal-actions-row">
            <div class="qty-stepper" style="height:44px; padding:0 4px;">
              <button type="button" class="qty-btn" id="modal-qty-dec" style="width:32px; height:32px;">−</button>
              <span class="qty-val" id="modal-qty-val" style="width:36px; font-size:14px;">1</span>
              <button type="button" class="qty-btn" id="modal-qty-inc" style="width:32px; height:32px;">+</button>
            </div>
            <button type="button" class="btn-primary" style="flex:1; height:44px; gap:8px;" id="modal-btn-add-cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span>Add to Shopping Bag</span>
            </button>
            <button 
              type="button" 
              class="btn-card-quickview" 
              style="width:44px; height:44px; padding:0;" 
              id="modal-btn-wishlist"
              title="${isWishlisted ? 'Saved' : 'Save to Wishlist'}"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'var(--accent-red)' : 'none'}" stroke="${isWishlisted ? 'var(--accent-red)' : 'currentColor'}" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Modal Qty Logic
    let currentQty = 1;
    const qtyValEl = document.getElementById('modal-qty-val');
    const decBtn = document.getElementById('modal-qty-dec');
    const incBtn = document.getElementById('modal-qty-inc');
    const addCartBtn = document.getElementById('modal-btn-add-cart');
    const wishBtn = document.getElementById('modal-btn-wishlist');

    if (decBtn && qtyValEl) {
      decBtn.addEventListener('click', () => {
        if (currentQty > 1) {
          currentQty--;
          qtyValEl.textContent = currentQty;
        }
      });
    }

    if (incBtn && qtyValEl) {
      incBtn.addEventListener('click', () => {
        if (currentQty < (prod.stock || 99)) {
          currentQty++;
          qtyValEl.textContent = currentQty;
        }
      });
    }

    if (addCartBtn) {
      addCartBtn.addEventListener('click', () => {
        addToCart(prod.id, currentQty);
        closeProductDetails();
        openCartDrawer();
      });
    }

    if (wishBtn) {
      wishBtn.addEventListener('click', () => {
        toggleWishlist(prod.id);
        const active = state.wishlist.includes(prod.id);
        wishBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${active ? 'var(--accent-red)' : 'none'}" stroke="${active ? 'var(--accent-red)' : 'currentColor'}" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        `;
      });
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProductDetails() {
    const modal = document.getElementById('product-details-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ==========================================================================
  // 8. CART DRAWER & CHECKOUT FLOW
  // ==========================================================================
  function openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function openWishlistModal() {
    updateWishlistUI();
    const modal = document.getElementById('wishlist-modal');
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeWishlistModal() {
    const modal = document.getElementById('wishlist-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function openCheckoutModal() {
    closeCartDrawer();
    const modal = document.getElementById('checkout-modal');
    const summaryListEl = document.getElementById('checkout-summary-items');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');
    const formView = document.getElementById('checkout-form-view');
    const successView = document.getElementById('checkout-success-view');

    if (!modal) return;

    if (formView) formView.style.display = 'grid';
    if (successView) successView.style.display = 'none';

    const totals = calculateCartTotals();

    if (summaryListEl) {
      summaryListEl.innerHTML = state.cart
        .map((item) => {
          const prod = getProductById(item.id);
          if (!prod) return '';
          return `
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; margin-bottom:8px;">
              <span style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${prod.name} × ${item.qty}</span>
              <span style="font-weight:600; font-family:var(--font-mono);">${formatMoney(prod.price * item.qty)}</span>
            </div>
          `;
        })
        .join('');
    }

    if (subtotalEl) subtotalEl.textContent = formatMoney(totals.subtotalUSD);
    if (shippingEl) shippingEl.textContent = totals.shippingUSD === 0 ? 'FREE' : formatMoney(totals.shippingUSD);
    if (taxEl) taxEl.textContent = formatMoney(totals.taxUSD);
    if (totalEl) totalEl.textContent = formatMoney(totals.finalTotalUSD);

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function processCheckoutOrder(event) {
    if (event) event.preventDefault();

    const nameInput = document.getElementById('checkout-name');
    const emailInput = document.getElementById('checkout-email');
    const addressInput = document.getElementById('checkout-address');

    if (!nameInput || !emailInput || !addressInput) return;
    if (!nameInput.value.trim() || !emailInput.value.trim() || !addressInput.value.trim()) {
      showToast('Please fill in your delivery name, email, and address', 'error');
      return;
    }

    const placeOrderBtn = document.getElementById('btn-place-order');
    if (placeOrderBtn) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = `
        <span class="loading-spinner" style="display:inline-block; width:16px; height:16px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:8px;"></span>
        Authorizing Escrow Payment...
      `;
    }

    setTimeout(() => {
      const orderId = `MS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const trackingCode = `EXP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const formView = document.getElementById('checkout-form-view');
      const successView = document.getElementById('checkout-success-view');
      const orderIdDisplay = document.getElementById('order-confirmed-id');
      const trackingDisplay = document.getElementById('order-confirmed-tracking');

      if (orderIdDisplay) orderIdDisplay.textContent = orderId;
      if (trackingDisplay) trackingDisplay.textContent = trackingCode;

      if (formView) formView.style.display = 'none';
      if (successView) successView.style.display = 'block';

      // Clear cart
      state.cart = [];
      state.appliedPromo = null;
      state.discountPercent = 0;
      saveCart();

      if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Authorize & Place Order';
      }

      showToast(`Order ${orderId} placed successfully!`, 'info');
    }, 1200);
  }

  // ==========================================================================
  // 9. EVENT LISTENERS & DOM HOOKS
  // ==========================================================================
  function initEventListeners() {
    // Currency Selector
    const currencySelect = document.getElementById('currency-selector');
    if (currencySelect) {
      currencySelect.value = state.currency;
      currencySelect.addEventListener('change', (e) => {
        state.currency = e.target.value;
        storage.set('marketsphere_currency', state.currency);
        renderAllProductGrids();
        updateCartUI();
        showToast(`Currency changed to ${state.currency}`);
      });
    }

    // Search Bar Input & Form
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const searchCatSelect = document.getElementById('search-category-select');

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (searchInput) {
          state.searchQuery = searchInput.value;
          renderMainCatalog();
          scrollToCatalog();
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderMainCatalog();
      });
    }

    if (searchCatSelect) {
      searchCatSelect.addEventListener('change', (e) => {
        setCategoryFilter(e.target.value);
        scrollToCatalog();
      });
    }

    // Sub-navigation category pills
    document.querySelectorAll('.cat-nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat') || 'all';
        setCategoryFilter(cat);
        scrollToCatalog();
      });
    });

    // Catalog Sort dropdown
    const sortSelect = document.getElementById('sort-selector');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderMainCatalog();
      });
    }

    // Cart trigger buttons
    document.querySelectorAll('.btn-cart-trigger').forEach((btn) => {
      btn.addEventListener('click', openCartDrawer);
    });

    // Cart close & backdrop
    const closeDrawerBtn = document.getElementById('btn-close-cart');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeCartDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeCartDrawer);

    // Wishlist triggers
    document.querySelectorAll('.btn-wishlist-trigger').forEach((btn) => {
      btn.addEventListener('click', openWishlistModal);
    });

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        closeProductDetails();
        closeCheckoutModal();
        closeWishlistModal();
      });
    });

    // Modal backdrop clicks
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeProductDetails();
          closeCheckoutModal();
          closeWishlistModal();
        }
      });
    });

    // Promo Code Form
    const promoForm = document.getElementById('promo-code-form');
    const promoInput = document.getElementById('promo-code-input');
    if (promoForm && promoInput) {
      promoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = promoInput.value.trim().toUpperCase();
        if (PROMO_CODES[code]) {
          state.appliedPromo = code;
          state.discountPercent = PROMO_CODES[code];
          promoInput.value = '';
          updateCartUI();
          showToast(`Promo <strong>${code}</strong> applied (${state.discountPercent * 100}% off)!`);
        } else {
          showToast('Invalid promo code. Try "SPHERE10" or "WELCOME20"', 'error');
        }
      });
    }

    // Clear cart button
    const clearCartBtn = document.getElementById('btn-clear-cart');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', clearCart);
    }

    // Proceed to checkout button
    const proceedCheckoutBtn = document.getElementById('btn-proceed-checkout');
    if (proceedCheckoutBtn) {
      proceedCheckoutBtn.addEventListener('click', openCheckoutModal);
    }

    // Checkout form submit
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', processCheckoutOrder);
    }

    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletter-email');
        if (emailInput && emailInput.value.trim()) {
          showToast(`Subscribed ${emailInput.value.trim()} to VIP marketplace alerts!`);
          emailInput.value = '';
        }
      });
    }

    // Mobile Hamburger Toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    const mobileDrawerClose = document.getElementById('mobile-drawer-close');
    if (mobileMenuToggle && mobileNavDrawer) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileNavDrawer.classList.toggle('open');
      });
    }
    if (mobileDrawerClose && mobileNavDrawer) {
      mobileDrawerClose.addEventListener('click', () => {
        mobileNavDrawer.classList.remove('open');
      });
    }

    // Keyboard Escape to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCartDrawer();
        closeProductDetails();
        closeCheckoutModal();
        closeWishlistModal();
        if (mobileNavDrawer) mobileNavDrawer.classList.remove('open');
      }
    });
  }

  function setCategoryFilter(category) {
    state.selectedCategory = category;

    // Update active class on pills
    document.querySelectorAll('.cat-nav-btn').forEach((btn) => {
      const cat = btn.getAttribute('data-cat') || 'all';
      if (cat.toLowerCase() === category.toLowerCase()) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update select in search bar if present
    const searchCatSelect = document.getElementById('search-category-select');
    if (searchCatSelect) {
      searchCatSelect.value = category;
    }

    renderMainCatalog();
  }

  function scrollToCatalog() {
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function resetFilters() {
    state.selectedCategory = 'all';
    state.searchQuery = '';
    state.sortBy = 'featured';

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('sort-selector');
    if (sortSelect) sortSelect.value = 'featured';

    setCategoryFilter('all');
  }

  // ==========================================================================
  // 10. PUBLIC API ATTACHED TO WINDOW
  // ==========================================================================
  window.MarketSphere = {
    addToCart,
    updateQuantity: updateCartQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    moveWishlistToCart,
    openProductDetails,
    closeProductDetails,
    openCartDrawer,
    closeCartDrawer,
    openWishlistModal,
    closeWishlistModal,
    openCheckoutModal,
    closeCheckoutModal,
    setCategoryFilter,
    resetFilters,
    showToast
  };

  // ==========================================================================
  // 11. INITIALIZATION ON DOM READY
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initFlashSaleTimer();
    renderAllProductGrids();
    updateCartUI();
    updateWishlistUI();
  });
})();
