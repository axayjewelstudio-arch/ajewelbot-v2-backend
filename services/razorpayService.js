const Razorpay = require('razorpay');

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✅ Razorpay initialized');
} else {
  console.log('⚠️ Razorpay credentials not found - payment features disabled');
}

exports.createPaymentOrder = async (orderData) => {
  if (!razorpay) {
    throw new Error('Razorpay not configured');
  }
  
  try {
    const options = {
      amount: Math.round(orderData.amount * 100),
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

exports.verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  if (!razorpay) {
    throw new Error('Razorpay not configured');
  }
  
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

exports.generatePaymentLink = (razorpayOrderId, amount, customerData) => {
  if (!razorpay) {
    throw new Error('Razorpay not configured');
  }
  
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
