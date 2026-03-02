const axios = require('axios');
const { logger } = require('../utils/logger');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// Send order tracking update
exports.sendTrackingUpdate = async (customerPhone, orderData) => {
  try {
    const { orderNumber, status, trackingUrl, trackingNumber } = orderData;
    
    let message = `📦 *Order Update*\n\n`;
    message += `Order #${orderNumber}\n`;
    message += `Status: ${status}\n\n`;
    
    if (trackingNumber) {
      message += `Tracking Number: ${trackingNumber}\n`;
    }
    
    if (status === 'shipped') {
      message += `Your order has been shipped! 🚚\n\n`;
    } else if (status === 'out_for_delivery') {
      message += `Your order is out for delivery! 📍\n\n`;
    } else if (status === 'delivered') {
      message += `Your order has been delivered! ✅\n\n`;
      message += `Thank you for shopping with A Jewel Studio! 💎`;
    }
    
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`;
    const headers = {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    if (trackingUrl) {
      // Send with tracking button
      const payload = {
        messaging_product: 'whatsapp',
        to: customerPhone,
        type: 'interactive',
        interactive: {
          type: 'cta_url',
          body: { text: message },
          action: {
            name: 'cta_url',
            parameters: {
              display_text: 'Track Order',
              url: trackingUrl
            }
          }
        }
      };
      
      await axios.post(url, payload, { headers });
    } else {
      // Send text message
      const payload = {
        messaging_product: 'whatsapp',
        to: customerPhone,
        type: 'text',
        text: { body: message }
      };
      
      await axios.post(url, payload, { headers });
    }
    
    logger.info('Tracking update sent', { orderNumber, status });
    return true;
    
  } catch (error) {
    logger.error('Send tracking error', { error: error.message });
    throw error;
  }
};

// Get order status
exports.getOrderStatus = async (orderNumber) => {
  try {
    const SHOPIFY_STORE = process.env.SHOPIFY_SHOP_DOMAIN;
    const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
    
    const response = await axios.get(
      `https://${SHOPIFY_STORE}/admin/api/2024-01/orders.json?name=${orderNumber}`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
        }
      }
    );
    
    const order = response.data.orders[0];
    
    if (!order) {
      return { found: false };
    }
    
    return {
      found: true,
      status: order.fulfillment_status || 'pending',
      financialStatus: order.financial_status,
      trackingNumber: order.fulfillments?.[0]?.tracking_number,
      trackingUrl: order.fulfillments?.[0]?.tracking_url,
      trackingCompany: order.fulfillments?.[0]?.tracking_company
    };
    
  } catch (error) {
    logger.error('Get order status error', { error: error.message });
    throw error;
  }
};
