const googleSheetsService = require('../services/googleSheetsService');
const emailService = require('../services/emailService');

exports.handleOrderWebhook = async (orderData, eventType) => {
  try {
    console.log(`📦 Shopify order webhook: ${eventType}`);
    
    if (eventType === 'created') {
      await googleSheetsService.createOrder({
        orderId: `SHOP${orderData.id}`,
        shopifyOrderId: orderData.name,
        customerName: `${orderData.customer.first_name} ${orderData.customer.last_name}`,
        customerEmail: orderData.customer.email,
        customerPhone: orderData.customer.phone,
        productName: orderData.line_items.map(i => i.title).join(', '),
        totalAmount: parseFloat(orderData.total_price),
        paymentStatus: orderData.financial_status,
        fulfillmentStatus: orderData.fulfillment_status || 'Pending'
      });
    }
    
    if (eventType === 'paid') {
      await emailService.sendOrderConfirmationEmail({
        orderId: orderData.name,
        customerName: `${orderData.customer.first_name} ${orderData.customer.last_name}`,
        customerEmail: orderData.customer.email,
        productName: orderData.line_items.map(i => i.title).join(', '),
        amount: parseFloat(orderData.total_price),
        readyDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Order webhook error:', error.message);
    throw error;
  }
};

exports.handleShippingWebhook = async (fulfillmentData) => {
  try {
    console.log('📦 Shopify shipping webhook');
    return { success: true };
  } catch (error) {
    console.error('❌ Shipping webhook error:', error.message);
    throw error;
  }
};
