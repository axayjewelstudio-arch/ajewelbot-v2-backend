const express = require('express');
const cors = require('cors');
require('dotenv').config();

const formRoutes = require('./routes/formRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'AJewelBot v2 API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api', formRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ AJewelBot v2 Backend running on port ${PORT}`);
  console.log(`📊 Google Sheets: Connected`);
  console.log(`🛍️ Shopify: ${process.env.SHOPIFY_STORE}`);
});
