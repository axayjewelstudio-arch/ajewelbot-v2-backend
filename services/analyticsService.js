const { logger } = require('../utils/logger');

// In-memory analytics storage (use database in production)
const analytics = {
  registrations: [],
  orders: [],
  messages: [],
  conversions: []
};

// Log analytics event
exports.logAnalytics = async (eventType, data) => {
  try {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data
    };
    
    switch (eventType) {
      case 'customer_registration':
        analytics.registrations.push(event);
        break;
      case 'order_created':
        analytics.orders.push(event);
        break;
      case 'message_sent':
        analytics.messages.push(event);
        break;
      case 'conversion':
        analytics.conversions.push(event);
        break;
    }
    
    logger.info('Analytics logged', { eventType });
    return true;
    
  } catch (error) {
    logger.error('Analytics log error', { error: error.message });
    return false;
  }
};

// Get analytics summary
exports.getAnalytics = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const todayRegistrations = analytics.registrations.filter(
      e => e.timestamp.startsWith(today)
    ).length;
    
    const todayOrders = analytics.orders.filter(
      e => e.timestamp.startsWith(today)
    ).length;
    
    const todayMessages = analytics.messages.filter(
      e => e.timestamp.startsWith(today)
    ).length;
    
    return {
      today: {
        registrations: todayRegistrations,
        orders: todayOrders,
        messages: todayMessages
      },
      total: {
        registrations: analytics.registrations.length,
        orders: analytics.orders.length,
        messages: analytics.messages.length,
        conversions: analytics.conversions.length
      }
    };
    
  } catch (error) {
    logger.error('Get analytics error', { error: error.message });
    throw error;
  }
};
