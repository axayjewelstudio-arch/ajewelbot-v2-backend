exports.logger = {
  info: (message, data) => {
    console.log(`ℹ️ [INFO] ${message}`, data || '');
  },
  error: (message, data) => {
    console.error(`❌ [ERROR] ${message}`, data || '');
  },
  warn: (message, data) => {
    console.warn(`⚠️ [WARN] ${message}`, data || '');
  },
  success: (message, data) => {
    console.log(`✅ [SUCCESS] ${message}`, data || '');
  }
};
