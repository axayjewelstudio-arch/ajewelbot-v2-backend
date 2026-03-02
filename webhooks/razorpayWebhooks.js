const orderService = require('../services/orderService');

exports.handlePaymentWebhook = async (paymentData) => {
  try {
    const eventType = paymentData.event;
    const payload = paymentData.payload;
    const payment = payload.payment;
    
    console.log(`💳 Razorpay webhook: ${eventType}`);
    
    if (eventType === 'payment.captured' || payment.status === 'captured') {
      const orderId = payment.notes.order_id;
      
      await orderService.confirmPayment(orderId, {
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
        razorpaySignature: 'webhook',
        customerPhone: payment.contact,
        customerName: payment.notes.customer_name,
        customerEmail: payment.email,
        amount: payment.amount / 100
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Razorpay webhook error:', error.message);
    throw error;
  }
};
