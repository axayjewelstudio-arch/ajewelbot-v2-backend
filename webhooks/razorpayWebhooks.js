const { sendDigitalFileEmail } = require('../services/emailService');
const { logger } = require('../utils/logger');
const axios = require('axios');

// Handle Razorpay payment webhook
exports.handlePaymentWebhook = async (webhookData) => {
  try {
    const { event, payload } = webhookData;
    
    logger.info('Razorpay webhook received', { event });
    
    if (event === 'payment_link.paid') {
      const paymentLink = payload.payment_link.entity;
      const customerPhone = paymentLink.customer.contact;
      const customerEmail = paymentLink.customer.email;
      const amount = paymentLink.amount / 100;
      
      // Send WhatsApp confirmation
      const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
      const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
      
      const message = `✅ *Payment Successful!*\n\n` +
                     `Amount Paid: ₹${amount}\n\n` +
                     `Thank you for doing Business with A Jewel Studio! 💎\n\n` +
                     `Your Design Files have been sent to your registered Email ID.`;
      
      await axios.post(
        `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: customerPhone,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      logger.info('Payment confirmation sent', { customerPhone });
    }
    
    if (event === 'payment_link.cancelled' || event === 'payment_link.expired') {
      const paymentLink = payload.payment_link.entity;
      const customerPhone = paymentLink.customer.contact;
      
      const message = `❌ Your Payment was not successful.\n\n` +
                     `Please try again or contact us for assistance.`;
      
      const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
      const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
      
      await axios.post(
        `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: customerPhone,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      logger.info('Payment failure notification sent', { customerPhone });
    }
    
    return true;
    
  } catch (error) {
    logger.error('Razorpay webhook error', { error: error.message });
    throw error;
  }
};
