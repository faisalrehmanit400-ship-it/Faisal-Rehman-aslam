# OmniTrade Global Marketplace — System Architecture

OmniTrade is a modern, modular, production-ready international multi-vendor e-commerce platform engineered for cross-border commerce. It connects global independent artisans, tech manufacturers, and verified brands with buyers worldwide.

---

## 1. High-Level Architecture Overview

```
                          ┌─────────────────────────────────────┐
                          │         Client Browsers             │
                          │   (Desktop, Tablet, Mobile)         │
                          └──────────────────┬──────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
                       ▼                                           ▼
         ┌───────────────────────────┐               ┌───────────────────────────┐
         │     Frontend Static       │               │   AI Studio Dev Preview   │
         │   (VS Code Live Server)   │               │   (Vite / React / Motion) │
         │   Zero Build Tooling      │               │   Full Reactive Hub       │
         └─────────────┬─────────────┘               └─────────────┬─────────────┘
                       │                                           │
                       │ REST API (Bearer JWT / JSON)              │
                       ▼                                           ▼
         ┌───────────────────────────────────────────────────────────────────────┐
         │                  OmniTrade Express REST API Gateway                   │
         │           Rate Limiter · Security Headers · RBAC Middleware           │
         └───────┬──────────────┬──────────────┬──────────────┬───────────┬──────┘
                 │              │              │              │           │
                 ▼              ▼              ▼              ▼           ▼
          [Auth Ctrl]   [Product Ctrl]   [Cart Ctrl]    [Order Ctrl] [Seller/Admin]
                 │              │              │              │           │
                 └──────────────┴───────┬──────┴──────────────┴───────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │   Relational Data Layer     │
                         │ PostgreSQL / MySQL (or Pool)│
                         │ + Resilient Local Store     │
                         └─────────────────────────────┘
```

---

## 2. Core Architectural Pillars

### A. Dual Execution Model
1. **VS Code Live Server ("Go Live")**:
   - The `/frontend` directory contains completely standalone HTML5, modular JavaScript, and CSS3.
   - All asset paths are relative (`./css/style.css`, `./assets/images/...`, `./js/app.js`).
   - If the backend is offline or during frontend review, the built-in **Resilient Store Engine** (`store.js` + `data.js`) automatically provides realistic international catalog data, cart persistence, role switching (Customer, Seller, Admin), order simulations, and live search without a single 404 error or broken console log.
2. **Production Full-Stack**:
   - The `/backend` directory provides a scalable Node.js/Express REST API adhering to single-responsibility architecture, JWT authentication with role authorization, and relational database bindings.

### B. Multi-Vendor Separation of Concerns
- **Platform**: Manages dispute resolution, global commission settlement (8.5%), currency conversion rates, and catalog taxonomies.
- **Sellers**: Manage vendor profile, product variants, inventory thresholds, order line fulfillment, and customer review responses.
- **Customers**: Browse cross-border catalog in their preferred currency (USD, EUR, GBP, JPY, CAD), create multi-vendor single-checkout carts, track fulfillment progress, and post verified reviews.

### C. Zero-Pill & Anti-Slop Design Constitution
- Strictly complies with the Universal Frontend Design Constitution:
  - Clean unboxed metadata separated by typographic dots (`·`).
  - Strict 60-30-10 color discipline: 60% clean canvas (`#09090B` dark or `#FAFAFA` light), 30% structural surface, 10% high-intent action accent.
  - Tabular numerals (`tabular-nums`) for currency, pricing, SKUs, and stock.
  - Smooth 150ms settling micro-interactions without layout thrashing.
