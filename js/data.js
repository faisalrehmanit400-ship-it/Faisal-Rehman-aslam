/**
 * OmniTrade Global Marketplace - Static Catalog & Demo Dataset
 * High-fidelity, self-contained data for Live Server and offline testing.
 */

window.OMNITRADE_DATA = {
  currencies: {
    USD: { code: 'USD', symbol: '$', rate: 1.000, name: 'US Dollar' },
    EUR: { code: 'EUR', symbol: '€', rate: 0.920, name: 'Euro' },
    GBP: { code: 'GBP', symbol: '£', rate: 0.790, name: 'British Pound' },
    JPY: { code: 'JPY', symbol: '¥', rate: 154.5, name: 'Japanese Yen' },
    CAD: { code: 'CAD', symbol: 'CA$', rate: 1.360, name: 'Canadian Dollar' }
  },

  categories: [
    { id: 'all', name: 'All Curations', slug: 'all' },
    { id: 'cat_elec', name: 'Electronics & Audio', slug: 'electronics' },
    { id: 'cat_horology', name: 'Watches & Precision', slug: 'watches' },
    { id: 'cat_beauty', name: 'Beauty & Apothecary', slug: 'beauty' },
    { id: 'cat_home', name: 'Living & Interior', slug: 'home' }
  ],

  sellers: [
    {
      id: 'sel_01',
      name: 'AcousticLab Tokyo',
      country: 'Japan',
      countryCode: 'JPN',
      rating: 4.96,
      reviewsCount: 428,
      salesCount: '1,420+ fulfilled',
      specialty: 'Acoustic engineering & reference sound',
      established: 2018
    },
    {
      id: 'sel_02',
      name: 'Kronos Werkstatt',
      country: 'Germany',
      countryCode: 'DEU',
      rating: 4.92,
      reviewsCount: 312,
      salesCount: '890+ fulfilled',
      specialty: 'Glashütte precision mechanical horology',
      established: 2015
    },
    {
      id: 'sel_03',
      name: 'Atelier Botanica Paris',
      country: 'France',
      countryCode: 'FRA',
      rating: 4.88,
      reviewsCount: 590,
      salesCount: '2,800+ fulfilled',
      specialty: 'Cold-pressed bioactive botanical elixirs',
      established: 2020
    }
  ],

  products: [
    {
      id: 'prd_01',
      title: 'AcousticLab Studio Master H1 Wireless Headphones',
      category_id: 'cat_elec',
      category_name: 'Electronics & Audio',
      brand: 'AcousticLab',
      sku: 'ACL-H1-BLK',
      price: 389.00,
      compare_at_price: 449.00,
      stock: 48,
      origin: 'Tokyo, Japan',
      seller_id: 'sel_01',
      seller_name: 'AcousticLab Tokyo',
      rating: 4.95,
      reviews_count: 184,
      image: './assets/images/headphones.jpg',
      short_description: 'Reference-grade 45mm planar magnetic drivers with active hybrid isolation and 40h lossless battery.',
      description: 'Engineered for audio engineers and discerning listeners. Features beryllium-coated diaphragms, replaceable lambskin memory foam ear pads, Bluetooth 5.4 with LDAC lossless playback, and zero-fatigue ergonomic suspension.',
      specs: {
        'Driver Type': '45mm Planar Magnetic',
        'Frequency Response': '5Hz – 48,000Hz',
        'Battery Life': '40 hours (ANC Active)',
        'Connectivity': 'Bluetooth 5.4, 3.5mm Analog, USB-C Lossless',
        'Weight': '340 grams'
      },
      variants: [
        { id: 'v1', name: 'Matte Carbon Black', price: 389.00, stock: 28 },
        { id: 'v2', name: 'Silver Anodized Aluminum', price: 389.00, stock: 20 }
      ],
      is_featured: true
    },
    {
      id: 'prd_02',
      title: 'Kronos Automatik Calibre 41 Field Watch',
      category_id: 'cat_horology',
      category_name: 'Watches & Precision',
      brand: 'Kronos Werkstatt',
      sku: 'KW-CAL41-TI',
      price: 840.00,
      compare_at_price: 950.00,
      stock: 22,
      origin: 'Glashütte, Germany',
      seller_id: 'sel_02',
      seller_name: 'Kronos Werkstatt',
      rating: 4.92,
      reviews_count: 96,
      image: './assets/images/watch.jpg',
      short_description: 'Grade 5 aerospace titanium case, mechanical automatic caliber with 68h power reserve, and Italian cordovan leather strap.',
      description: 'Hand-finished in Glashütte. Engineered to withstand high-altitude pressure drops and 200m water submersion. Features double-domed anti-reflective sapphire crystal, screw-down crown, and Super-LumiNova BGW9 indices for maximum clarity.',
      specs: {
        'Case Material': 'Grade 5 Aerospace Titanium',
        'Case Diameter': '41mm (11.8mm thickness)',
        'Movement': 'Kronos K-808 Automatic (28,800 bph)',
        'Water Resistance': '20 ATM / 200 Meters',
        'Crystal': 'Double-Domed AR Sapphire'
      },
      variants: [
        { id: 'v3', name: 'Basalt Black Dial / Cordovan', price: 840.00, stock: 14 },
        { id: 'v4', name: 'Arctic White Dial / Steel Mesh', price: 890.00, stock: 8 }
      ],
      is_featured: true
    },
    {
      id: 'prd_03',
      title: 'Sérum Éclat Botanique Bio-Renewal Elixir',
      category_id: 'cat_beauty',
      category_name: 'Beauty & Apothecary',
      brand: 'Atelier Botanica',
      sku: 'ABP-SER-50',
      price: 78.00,
      compare_at_price: 92.00,
      stock: 115,
      origin: 'Provence, France',
      seller_id: 'sel_03',
      seller_name: 'Atelier Botanica Paris',
      rating: 4.89,
      reviews_count: 214,
      image: './assets/images/serum.jpg',
      short_description: 'Concentrated olive squalane with cold-pressed rosehip seed extract, sea buckthorn, and phyto-bakuchiol.',
      description: 'Formulated in small batches in Grasse. Packed with cold-pressed botanical lipids to restore skin barrier density and cellular elasticity. 100% certified organic, fragrance-free, and packaged in UV-protective frosted amber glass.',
      specs: {
        'Volume': '50ml / 1.7 fl oz',
        'Key Actives': '1% Phyto-Bakuchiol, Rosehip CO2, Squalane',
        'Skin Compatibility': 'All skin types, sensitive barrier friendly',
        'Certification': 'Ecocert Cosmos Organic Certified'
      },
      variants: [
        { id: 'v5', name: '30ml Travel Pipette', price: 78.00, stock: 65 },
        { id: 'v6', name: '60ml Studio Apothecary', price: 125.00, stock: 50 }
      ],
      is_featured: true
    },
    {
      id: 'prd_04',
      title: 'AcousticLab Solid State Desktop Headphone DAC/Amp',
      category_id: 'cat_elec',
      category_name: 'Electronics & Audio',
      brand: 'AcousticLab',
      sku: 'ACL-DAC-PRO',
      price: 499.00,
      compare_at_price: 560.00,
      stock: 31,
      origin: 'Tokyo, Japan',
      seller_id: 'sel_01',
      seller_name: 'AcousticLab Tokyo',
      rating: 4.88,
      reviews_count: 45,
      image: './assets/images/hero.jpg',
      short_description: 'Dual ESS Sabre ES9038Q2M converter architecture with discrete Class-A balanced output stage.',
      description: 'Delivers pure, neutral, uncolored acoustic amplification up to 2.4W into 32 ohms. Supports full MQA hardware decoding, 32-bit/768kHz PCM, and native DSD512.',
      specs: {
        'DAC Chipset': 'Dual ESS Sabre ES9038Q2M',
        'Output Power': '2400mW @ 32Ω Balanced',
        'THD+N': '< 0.00015%',
        'Inputs': 'USB-C, Optical, Coaxial, Bluetooth 5.4'
      },
      variants: [
        { id: 'v7', name: 'Monolithic Slate Black', price: 499.00, stock: 31 }
      ],
      is_featured: false
    }
  ],

  demoOrders: [
    {
      id: 'ord_1042',
      order_number: 'OT-2026-8941',
      customer: 'Marcus Vance',
      status: 'shipped',
      currency: 'USD',
      total: 435.12,
      date: '2026-09-26',
      tracking: 'DHL-GLOBAL-982140',
      carrier: 'DHL Express International',
      items: [
        {
          title: 'AcousticLab Studio Master H1 Wireless Headphones',
          variant: 'Matte Carbon Black',
          qty: 1,
          price: 389.00,
          image: './assets/images/headphones.jpg'
        }
      ]
    }
  ]
};
