const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ✅ Create payment order
exports.createPaymentOrder = async (orderData) => {
  try {
    const options = {
      amount: Math.round(orderData.amount * 100), // Amount in paise
      currency: 'INR',
      receipt: orderData.orderId,
      notes: {
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_email: orderData.customerEmail,
        order_id: orderData.orderId
      }
    };
    
    const razorpayOrder = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created:', razorpayOrder.id);
    
    return {
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt
    };
  } catch (error) {
    console.error('❌ Razorpay order creation error:', error.message);
    throw error;
  }
};

// ✅ Verify payment signature
exports.verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const crypto = require('crypto');
    const text = razorpayOrderId + '|' + razorpayPaymentId;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');
    
    return generated_signature === razorpaySignature;
  } catch (error) {
    console.error('❌ Signature verification error:', error.message);
    return false;
  }
};

// ✅ Fetch payment details
exports.getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        createdAt: new Date(payment.created_at * 1000).toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Error fetching payment:', error.message);
    throw error;
  }
};

// ✅ Create refund
exports.createRefund = async (paymentId, amount, notes = {}) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // Amount in paise
      notes: notes
    });
    
    console.log('✅ Refund created:', refund.id);
    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    };
  } catch (error) {
    console.error('❌ Refund creation error:', error.message);
    throw error;
  }
};

// ✅ Get refund status
exports.getRefundStatus = async (refundId) => {
  try {
    const refund = await razorpay.refunds.fetch(refundId);
    return {
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        createdAt: new Date(refund.created_at * 1000).toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Error fetching refund:', error.message);
    throw error;
  }
};

// ✅ Generate payment link
exports.generatePaymentLink = (razorpayOrderId, amount, customerData) => {
  const baseUrl = 'https://api.razorpay.com/v1/checkout/embedded';
  
  return {
    checkoutUrl: `${baseUrl}?key_id=${process.env.RAZORPAY_KEY_ID}&order_id=${razorpayOrderId}`,
    amount: amount,
    currency: 'INR',
    name: 'A Jewel Studio',
    description: `Order Payment - ${customerData.orderId}`,
    prefill: {
      name: customerData.customerName,
      email: customerData.customerEmail,
      contact: customerData.customerPhone
    }
  };
};
