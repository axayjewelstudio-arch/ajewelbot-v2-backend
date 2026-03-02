const { logger } = require('./logger');

// In-memory session storage (use Redis in production)
const sessions = new Map();

// Session timeout (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Create or update session
exports.setSession = (phone, data) => {
  try {
    sessions.set(phone, {
      ...data,
      lastActivity: Date.now()
    });
    
    logger.info('Session updated', { phone });
    return true;
  } catch (error) {
    logger.error('Set session error', { error: error.message });
    return false;
  }
};

// Get session
exports.getSession = (phone) => {
  try {
    const session = sessions.get(phone);
    
    if (!session) {
      return null;
    }
    
    // Check if session expired
    if (Date.now() - session.lastActivity > SESSION_TIMEOUT) {
      sessions.delete(phone);
      logger.info('Session expired', { phone });
      return null;
    }
    
    // Update last activity
    session.lastActivity = Date.now();
    sessions.set(phone, session);
    
    return session;
  } catch (error) {
    logger.error('Get session error', { error: error.message });
    return null;
  }
};

// Clear session
exports.clearSession = (phone) => {
  try {
    sessions.delete(phone);
    logger.info('Session cleared', { phone });
    return true;
  } catch (error) {
    logger.error('Clear session error', { error: error.message });
    return false;
  }
};

// Clean expired sessions (run periodically)
exports.cleanExpiredSessions = () => {
  try {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [phone, session] of sessions.entries()) {
      if (now - session.lastActivity > SESSION_TIMEOUT) {
        sessions.delete(phone);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info('Expired sessions cleaned', { count: cleaned });
    }
    
    return cleaned;
  } catch (error) {
    logger.error('Clean sessions error', { error: error.message });
    return 0;
  }
};

// Auto-clean every 10 minutes
setInterval(() => {
  exports.cleanExpiredSessions();
}, 10 * 60 * 1000);
