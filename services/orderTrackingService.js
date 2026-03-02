const googleSheetsService = require('./googleSheetsService');

exports.getOrderStatus = async (orderId) => {
  try {
    console.log(`🔍 Tracking order: ${orderId}`);
    return {
      success: true,
      orderId: orderId,
      status: 'In Production',
      message: 'Your order is being prepared'
    };
  } catch (error) {
    console.error('❌ Order tracking error:', error.message);
    throw error;
  }
};
