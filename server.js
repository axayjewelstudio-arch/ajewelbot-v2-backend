// server.js - AJewelBot v2 Backend - 70 Features
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { appendFormData } = require('./services/googleSheetsService');
const { createShopifyCustomer, getShopifyCustomer } = require('./services/shopifyService');
const { handleOrderWebhook, handleShippingWebhook } = require('./webhooks/shopifyWebhooks');
const { handlePaymentWebhook } = require('./webhooks/razorpayWebhooks');
const { logAnalytics } = require('./services/analyticsService');
const { errorHandler } = require('./utils/errorHandler');
const { logger } = require('./utils/logger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'running', 
    service: 'AJewelBot v2 Backend',
    version: '2.0.0',
    features: 70,
    timestamp: new Date().toISOString()
  });
});

// ==================== FORM SUBMISSION ====================

app.post('/form-submit', async (req, res) => {
  try {
    logger.info('Form submission received', { body: req.body });
    
    const formData = req.body;
    
    // Validate required fields
    if (!formData.firstName || !formData.mobile) {
      return res.status(400).json({
        status: 'error',
        message: 'First name and mobile are required'
      });
    }

    // Create Shopify customer
    const shopifyResult = await createShopifyCustomer(formData);
    
    if (shopifyResult.success) {
      // Log to Google Sheets (B:AO, A already has WhatsApp number)
      await appendFormData(formData);
      
      // Log analytics
      await logAnalytics('customer_registration', {
        customerType: formData.customerType,
        source: 'form_submission'
      });
      
      logger.info('Customer created successfully', { 
        customerId: shopifyResult.customerId 
      });
      
      res.json({
        status: 'success',
        message: 'Registration successful! You can now close this page and return to WhatsApp.',
        customerId: shopifyResult.customerId
      });
    } else {
      throw new Error(shopifyResult.error || 'Failed to create customer');
    }
    
  } catch (error) {
    logger.error('Form submission error', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  }
});

// ==================== SHOPIFY WEBHOOKS ====================

app.post('/webhooks/shopify/orders/create', async (req, res) => {
  try {
    await handleOrderWebhook(req.body, 'created');
    res.status(200).send('OK');
  } catch (error) {
    logger.error('Order webhook error', { error: error.message });
    res.status(500).send('Error');
  }
});

app.post('/webhooks/shopify/orders/paid', async (req, res) => {
  try {
    await handleOrderWebhook(req.body, 'paid');
    res.status(200).send('OK');
  } catch (error) {
    logger.error('Payment webhook error', { error: error.message });
    res.status(500).send('Error');
  }
});

app.post('/webhooks/shopify/fulfillments/update', async (req, res) => {
  try {
    await handleShippingWebhook(req.body);
    res.status(200).send('OK');
  } catch (error) {
    logger.error('Shipping webhook error', { error: error.message });
    res.status(500).send('Error');
  }
});

// ==================== RAZORPAY WEBHOOKS ====================

app.post('/webhooks/razorpay', async (req, res) => {
  try {
    await handlePaymentWebhook(req.body);
    res.status(200).send('OK');
  } catch (error) {
    logger.error('Razorpay webhook error', { error: error.message });
    res.status(500).send('Error');
  }
});

// ==================== CUSTOMER API ====================

app.get('/api/customer/:phone', async (req, res) => {
  try {
    const customer = await getShopifyCustomer(req.params.phone);
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ANALYTICS API ====================

app.get('/api/analytics', async (req, res) => {
  try {
    const { getAnalytics } = require('./services/analyticsService');
    const analytics = await getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Backend server running on port ${PORT}`);
  console.log(`✅ AJewelBot v2 Backend - Port ${PORT}`);
  console.log(`✅ 70 Features Active`);
  console.log(`✅ Google Sheets: Column A (WhatsApp) + B:AO (Form Data)`);
});
