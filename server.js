const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const formRoutes        = require('./routes/formRoutes');
const productRoutes     = require('./routes/productRoutes');
const cartRoutes        = require('./routes/cartRoutes');
const orderRoutes       = require('./routes/orderRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const razorpayWebhooks  = require('./webhooks/razorpayWebhooks');
const shopifyWebhooks   = require('./webhooks/shopifyWebhooks');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────────────────────
// RAW BODY CAPTURE — must be BEFORE express.json()
// Required for Razorpay HMAC signature verification
// ─────────────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/webhooks/razorpay')) {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      req.rawBody = data;
      try { req.body = JSON.parse(data); } catch { req.body = {}; }
      next();
    });
  } else {
    next();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status:    'AJewelBot v3 API is running',
    version:   '3.1.0',
    timestamp: new Date().toISOString(),
    features: [
      'Customer Registration',
      'Product Catalog',
      'Cart Management',
      'Order Processing',
      'Razorpay Integration',
      'PDF Invoice Generation',
      'Invoice Email (PDF Attachment)',
      'WhatsApp Invoice Notification',
      'Appointments',
      'Email Notifications',
      'Google Sheets Integration (6 sheets, 134 columns)',
    ],
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE DOWNLOAD ROUTE
// GET /invoice/:token → serves PDF (valid 24h after payment)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/invoice/:token', razorpayWebhooks.serveInvoice);

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.post('/webhooks/razorpay', razorpayWebhooks.handlePaymentWebhook);
app.use('/webhooks/shopify',   shopifyWebhooks);

// ─────────────────────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api',              formRoutes);
app.use('/api/products',     productRoutes);
app.use('/api/cart',         cartRoutes);
app.use('/api/orders',       orderRoutes);
app.use('/api/appointments', appointmentRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error:   process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ AJewelBot v3 Backend running on port ${PORT}`);
  console.log(`📊 Google Sheets: 6 sheets (134 columns)`);
  console.log(`🛍️  Shopify: ${process.env.SHOPIFY_STORE}`);
  console.log(`💳 Razorpay: Configured`);
  console.log(`📧 Email: ${process.env.EMAIL_USER}`);
  console.log(`📄 Invoice: PDF generation active`);
  console.log(`✅ All routes active`);
});