const Razorpay = require('razorpay');
const { logger } = require('../utils/logger');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Generate payment link
exports.generatePaymentLink = async (orderData) => {
  try {
    const { amount, customerName, customerPhone, customerEmail, orderNumber } = orderData;
    
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      description: `A Jewel Studio - Order #${orderNumber}`,
      customer: {
        name: customerName,
        contact: customerPhone,
        email: customerEmail
      },
      notify: {
        sms: true,
        email: true,
        whatsapp: true
      },
      reminder_enable: true,
      callback_url: `${process.env.BACKEND_URL || 'https://ajewelbot-v2-backend.onrender.com'}/payment/callback`,
      callback_method: 'get'
    });
    
    logger.info('Payment link created', { orderNumber, linkId: paymentLink.id });
    
    return {
      success: true,
      paymentLink: paymentLink.short_url,
      paymentId: paymentLink.id
    };
    
  } catch (error) {
    logger.error('Payment link error', { error: error.message });
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify payment
exports.verifyPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    
    return {
      success: payment.status === 'captured',
      status: payment.status,
      amount: payment.amount / 100,
      method: payment.method
    };
    
  } catch (error) {
    logger.error('Payment verification error', { error: error.message });
    throw error;
  }
};
