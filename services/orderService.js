const googleSheetsService = require('./googleSheetsService');
const emailService = require('./emailService');
const razorpayService = require('./razorpayService');
const cartService = require('./cartService');

const calculateReadyDate = () => {
  const today = new Date();
  let workingDays = 0;
  let currentDate = new Date(today);
  
  while (workingDays < 15) {
    currentDate.setDate(currentDate.getDate() + 1);
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0) {
      workingDays++;
    }
  }
  
  return currentDate.toISOString().split('T')[0];
};

exports.createOrder = async (orderData) => {
  try {
    const orderId = `AJS${Date.now()}`;
    const readyDate = calculateReadyDate();
    
    const partnerStore = await googleSheetsService.getPartnerStoreByCity(orderData.customerCity);
    
    const order = {
      orderId: orderId,
      shopifyOrderId: orderData.shopifyOrderId || '',
      storeId: partnerStore?.storeId || '',
      storeName: partnerStore?.storeName || '',
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      productSKU: orderData.productSKU,
      productName: orderData.productName,
      quantity: orderData.quantity || 1,
      unitPrice: orderData.unitPrice,
      totalAmount: orderData.totalAmount,
      commissionAmount: partnerStore ? (orderData.totalAmount * (parseFloat(partnerStore.commission) / 100)) : 0,
      paymentStatus: 'Pending',
      fulfillmentStatus: 'Pending',
      trackingNumber: '',
      deliveryDate: readyDate,
      notes: orderData.notes || ''
    };
    
    await googleSheetsService.createOrder(order);
    
    console.log('✅ Order created:', orderId);
    return {
      success: true,
      orderId: orderId,
      readyDate: readyDate,
      partnerStore: partnerStore
    };
  } catch (error) {
    console.error('❌ Order creation error:', error.message);
    throw error;
  }
};

exports.processPayment = async (customerPhone, customerData) => {
  try {
    const cart = cartService.getCart(customerPhone);
    
    if (!cart.items.length) {
      throw new Error('Cart is empty');
    }
    
    const orderResult = await exports.createOrder({
      customerName: customerData.customerName,
      customerEmail: customerData.customerEmail,
      customerPhone: customerPhone,
      customerCity: customerData.customerCity,
      productSKU: cart.items.map(i => i.sku).join(', '),
      productName: cart.items.map(i => i.title).join(', '),
      quantity: cart.items.reduce((sum, i) => sum + i.quantity, 0),
      unitPrice: cart.total / cart.items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: cart.total
    });
    
    const razorpayOrder = await razorpayService.createPaymentOrder({
      amount: cart.total,
      orderId: orderResult.orderId,
      customerName: customerData.customerName,
      customerPhone: customerPhone,
      customerEmail: customerData.customerEmail
    });
    
    const paymentLink = razorpayService.generatePaymentLink(
      razorpayOrder.razorpayOrderId,
      cart.total,
      {
        orderId: orderResult.orderId,
        customerName: customerData.customerName,
        customerEmail: customerData.customerEmail,
        customerPhone: customerPhone
      }
    );
    
    return {
      success: true,
      orderId: orderResult.orderId,
      razorpayOrderId: razorpayOrder.razorpayOrderId,
      paymentLink: paymentLink.checkoutUrl,
      amount: cart.total,
      readyDate: orderResult.readyDate,
      partnerStore: orderResult.partnerStore
    };
  } catch (error) {
    console.error('❌ Payment processing error:', error.message);
    throw error;
  }
};

exports.confirmPayment = async (orderId, paymentData) => {
  try {
    const isValid = razorpayService.verifyPaymentSignature(
      paymentData.razorpayOrderId,
      paymentData.razorpayPaymentId,
      paymentData.razorpaySignature
    );
    
    if (!isValid) {
      throw new Error('Invalid payment signature');
    }
    
    await googleSheetsService.updateOrderStatus(orderId, 'Paid', 'In Production');
    
    cartService.clearCart(paymentData.customerPhone);
    
    await emailService.sendOrderConfirmationEmail({
      orderId: orderId,
      customerName: paymentData.customerName,
      customerEmail: paymentData.customerEmail,
      productName: paymentData.productName,
      amount: paymentData.amount,
      readyDate: paymentData.readyDate,
      collectionStore: paymentData.partnerStore
    });
    
    console.log('✅ Payment confirmed for order:', orderId);
    return {
      success: true,
      orderId: orderId,
      paymentId: paymentData.razorpayPaymentId,
      status: 'Confirmed'
    };
  } catch (error) {
    console.error('❌ Payment confirmation error:', error.message);
    throw error;
  }
};

exports.markOrderReady = async (orderId, customerData) => {
  try {
    await googleSheetsService.updateOrderStatus(orderId, 'Paid', 'Ready');
    
    await emailService.sendOrderReadyEmail({
      orderId: orderId,
      customerName: customerData.customerName,
      customerEmail: customerData.customerEmail,
      productName: customerData.productName,
      collectionStore: customerData.partnerStore
    });
    
    console.log('✅ Order marked as ready:', orderId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error marking order ready:', error.message);
    throw error;
  }
};
