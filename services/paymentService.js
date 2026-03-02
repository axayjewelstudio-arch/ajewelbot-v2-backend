const razorpayService = require('./razorpayService');

exports.processPayment = async (paymentData) => {
  try {
    return await razorpayService.createPaymentOrder(paymentData);
  } catch (error) {
    console.error('❌ Payment processing error:', error.message);
    throw error;
  }
};

exports.verifyPayment = async (verificationData) => {
  try {
    return razorpayService.verifyPaymentSignature(
      verificationData.razorpayOrderId,
      verificationData.razorpayPaymentId,
      verificationData.razorpaySignature
    );
  } catch (error) {
    console.error('❌ Payment verification error:', error.message);
    throw error;
  }
};
