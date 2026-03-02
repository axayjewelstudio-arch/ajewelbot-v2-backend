const orderService = require('../services/orderService');

// ✅ Create order and initiate payment
exports.createOrder = async (req, res) => {
  try {
    const { customerPhone, customerData } = req.body;
    
    const result = await orderService.processPayment(customerPhone, customerData);
    
    res.json({
      success: true,
      orderId: result.orderId,
      razorpayOrderId: result.razorpayOrderId,
      paymentLink: result.paymentLink,
      amount: result.amount,
      readyDate: result.readyDate,
      partnerStore: result.partnerStore
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentData } = req.body;
    
    const result = await orderService.confirmPayment(orderId, paymentData);
    
    res.json({
      success: true,
      orderId: result.orderId,
      paymentId: result.paymentId,
      status: result.status
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Mark order as ready
exports.markOrderReady = async (req, res) => {
  try {
    const { orderId, customerData } = req.body;
    
    await orderService.markOrderReady(orderId, customerData);
    
    res.json({
      success: true,
      message: 'Order marked as ready and notification sent'
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
