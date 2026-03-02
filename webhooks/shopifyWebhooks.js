const { sendTrackingUpdate } = require('../services/orderTrackingService');
const { sendDigitalFileEmail } = require('../services/emailService');
const { logAnalytics } = require('../services/analyticsService');
const { logger } = require('../utils/logger');

// Handle order creation webhook
exports.handleOrderWebhook = async (orderData, eventType) => {
  try {
    const { id, name, customer, line_items, total_price, tags } = orderData;
    
    logger.info('Order webhook received', { orderNumber: name, eventType });
    
    // Log analytics
    await logAnalytics('order_created', {
      orderNumber: name,
      total: total_price,
      customerType: tags
    });
    
    // If B2B and paid, send digital files
    if (eventType === 'paid' && tags && tags.includes('B2B')) {
      const downloadLinks = line_items.map(item => ({
        name: item.title,
        url: `https://a-jewel-studio-3.myshopify.com/downloads/${item.id}`
      }));
      
      await sendDigitalFileEmail(customer.email, {
        customerName: customer.first_name,
        orderNumber: name,
        downloadLinks
      });
      
      logger.info('Digital files sent', { orderNumber: name });
    }
    
    return true;
    
  } catch (error) {
    logger.error('Order webhook error', { error: error.message });
    throw error;
  }
};

// Handle shipping/fulfillment webhook
exports.handleShippingWebhook = async (fulfillmentData) => {
  try {
    const { order_id, status, tracking_number, tracking_url } = fulfillmentData;
    
    logger.info('Shipping webhook received', { orderId: order_id, status });
    
    // Get customer phone from order
    const SHOPIFY_STORE = process.env.SHOPIFY_SHOP_DOMAIN;
    const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
    const axios = require('axios');
    
    const orderResponse = await axios.get(
      `https://${SHOPIFY_STORE}/admin/api/2024-01/orders/${order_id}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
        }
      }
    );
    
    const order = orderResponse.data.order;
    const customerPhone = order.customer.phone;
    
    if (customerPhone) {
      await sendTrackingUpdate(customerPhone, {
        orderNumber: order.name,
        status,
        trackingNumber: tracking_number,
        trackingUrl: tracking_url
      });
    }
    
    return true;
    
  } catch (error) {
    logger.error('Shipping webhook error', { error: error.message });
    throw error;
  }
};
