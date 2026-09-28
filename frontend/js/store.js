/**
 * OmniTrade Global Marketplace - Reactive State Store
 * Handles Cart, Wishlist, Currency conversions, Role simulation, and LocalStorage persistence.
 * Zero external dependencies.
 */

class OmniStore {
  constructor() {
    this.storageKey = 'omnitrade_state_v1';
    this.listeners = new Set();

    // Default State
    this.state = {
      currency: 'USD',
      currentRole: 'customer', // 'customer' | 'seller' | 'admin'
      user: {
        name: 'Marcus Vance',
        email: 'marcus.buyer@example.com',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80'
      },
      cart: [],
      wishlist: ['prd_02'],
      promoCode: '',
      discountPercent: 0,
      orders: window.OMNITRADE_DATA ? [...window.OMNITRADE_DATA.demoOrders] : [],
      products: window.OMNITRADE_DATA ? [...window.OMNITRADE_DATA.products] : [],
      selectedCategory: 'all',
      searchQuery: '',
      sortBy: 'featured'
    };

    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      }
    } catch (e) {
      console.warn('[OmniStore] LocalStorage unreadable, initializing default memory state.');
    }
  }

  saveToStorage() {
    try {
      const { cart, wishlist, currency, currentRole, orders, promoCode, discountPercent } = this.state;
      localStorage.setItem(this.storageKey, JSON.stringify({
        cart,
        wishlist,
        currency,
        currentRole,
        orders,
        promoCode,
        discountPercent
      }));
    } catch (e) {}
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.saveToStorage();
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // --- Currency & Formatting ---
  setCurrency(code) {
    if (window.OMNITRADE_DATA.currencies[code]) {
      this.state.currency = code;
      this.notify();
    }
  }

  formatPrice(amountInUSD) {
    const cur = window.OMNITRADE_DATA.currencies[this.state.currency] || window.OMNITRADE_DATA.currencies.USD;
    const converted = amountInUSD * cur.rate;
    if (cur.code === 'JPY') {
      return `${cur.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${cur.symbol}${converted.toFixed(2)}`;
  }

  // --- Role Management ---
  setRole(role) {
    if (['customer', 'seller', 'admin'].includes(role)) {
      this.state.currentRole = role;
      this.notify();
    }
  }

  // --- Cart Operations ---
  addToCart(product, variant = null, quantity = 1) {
    const variantId = variant ? variant.id : 'standard';
    const variantName = variant ? variant.name : 'Standard Edition';
    const price = variant ? variant.price : product.price;

    const existingIndex = this.state.cart.findIndex(
      item => item.productId === product.id && item.variantId === variantId
    );

    if (existingIndex > -1) {
      this.state.cart[existingIndex].quantity += quantity;
    } else {
      this.state.cart.push({
        productId: product.id,
        variantId,
        title: product.title,
        variantName,
        price,
        image: product.image,
        seller: product.seller_name,
        quantity
      });
    }

    this.notify();
    this.toast(`Added "${product.title}" to cart.`);
  }

  updateCartQuantity(productId, variantId, qty) {
    const index = this.state.cart.findIndex(
      item => item.productId === productId && item.variantId === variantId
    );
    if (index > -1) {
      if (qty <= 0) {
        this.state.cart.splice(index, 1);
      } else {
        this.state.cart[index].quantity = qty;
      }
      this.notify();
    }
  }

  removeFromCart(productId, variantId) {
    this.state.cart = this.state.cart.filter(
      item => !(item.productId === productId && item.variantId === variantId)
    );
    this.notify();
  }

  clearCart() {
    this.state.cart = [];
    this.state.promoCode = '';
    this.state.discountPercent = 0;
    this.notify();
  }

  applyPromo(code) {
    const cleaned = code.trim().toUpperCase();
    if (cleaned === 'GLOBAL10') {
      this.state.promoCode = 'GLOBAL10';
      this.state.discountPercent = 0.10;
      this.notify();
      this.toast('Promo code applied: 10% discount.');
      return { success: true, message: '10% discount applied!' };
    } else {
      return { success: false, message: 'Invalid or expired promo code.' };
    }
  }

  getCartTotals() {
    const subtotal = this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * this.state.discountPercent;
    const shipping = subtotal === 0 ? 0 : (subtotal >= 150 ? 0 : 15.00);
    const taxable = Math.max(0, subtotal - discount);
    const tax = Number((taxable * 0.0825).toFixed(2));
    const total = Number((taxable + shipping + tax).toFixed(2));
    const itemsCount = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      discount,
      shipping,
      tax,
      total,
      itemsCount
    };
  }

  // --- Wishlist ---
  toggleWishlist(productId) {
    const idx = this.state.wishlist.indexOf(productId);
    if (idx > -1) {
      this.state.wishlist.splice(idx, 1);
      this.toast('Item removed from saved wishlist.');
    } else {
      this.state.wishlist.push(productId);
      this.toast('Item saved to your wishlist.');
    }
    this.notify();
  }

  isInWishlist(productId) {
    return this.state.wishlist.includes(productId);
  }

  // --- Order Placement ---
  placeOrder(shippingInfo, paymentMethod) {
    const totals = this.getCartTotals();
    const orderNumber = `OT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: `ord_${Date.now()}`,
      order_number: orderNumber,
      customer: shippingInfo.recipientName || this.state.user.name,
      status: 'confirmed',
      currency: this.state.currency,
      total: totals.total,
      date: new Date().toISOString().split('T')[0],
      tracking: `TRK-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      carrier: 'Global Priority Express',
      shippingAddress: shippingInfo,
      items: this.state.cart.map(item => ({ ...item }))
    };

    this.state.orders.unshift(newOrder);
    this.clearCart();
    this.notify();
    return newOrder;
  }

  // --- Seller Operations ---
  addProduct(productData) {
    const id = `prd_${Date.now()}`;
    const newProduct = {
      id,
      rating: 5.0,
      reviews_count: 0,
      image: './assets/images/hero.jpg',
      seller_id: 'sel_01',
      seller_name: 'AcousticLab Tokyo',
      specs: {},
      variants: [],
      ...productData
    };
    this.state.products.unshift(newProduct);
    this.notify();
    this.toast(`Listing "${newProduct.title}" created successfully.`);
    return newProduct;
  }

  // --- Toast System ---
  toast(message) {
    let container = document.getElementById('omni-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'omni-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#10b981; flex-shrink:0;">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 220);
    }, 3200);
  }
}

window.store = new OmniStore();
