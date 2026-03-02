const express = require('express');
const cors = require('cors');
require('dotenv').config();

const formRoutes = require('./routes/formRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'AJewelBot v3 API is running',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    features: [
      'Customer Registration',
      'Product Catalog',
      'Cart Management',
      'Order Processing',
      'Razorpay Integration',
      'Appointments',
      'Email Notifications',
      'Google Sheets Integration (6 sheets, 134 columns)'
    ]
  });
});

// Routes
app.use('/api', formRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/appointments', appointmentRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ AJewelBot v3 Backend running on port ${PORT}`);
  console.log(`📊 Google Sheets: 6 sheets (134 columns)`);
  console.log(`🛍️ Shopify: ${process.env.SHOPIFY_STORE}`);
  console.log(`💳 Razorpay: Configured`);
  console.log(`📧 Email: ${process.env.EMAIL_USER}`);
  console.log(`✅ All routes active`);
});
