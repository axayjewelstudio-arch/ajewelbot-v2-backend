const axios = require('axios');
const { logger } = require('../utils/logger');

const SHOPIFY_STORE = process.env.SHOPIFY_SHOP_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const shopifyAPI = axios.create({
  baseURL: `https://${SHOPIFY_STORE}/admin/api/2024-01`,
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    'Content-Type': 'application/json'
  }
});

// Get customer by phone
exports.getShopifyCustomer = async (phone) => {
  try {
    const response = await shopifyAPI.get(`/customers/search.json?query=phone:${phone}`);
    const customers = response.data.customers;
    return customers.length > 0 ? customers[0] : null;
  } catch (error) {
    logger.error('Get customer error', { error: error.message });
    throw error;
  }
};

// Create Shopify customer
exports.createShopifyCustomer = async (formData) => {
  try {
    const customerData = {
      customer: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.mobile,
        tags: formData.customerType || 'Retail',
        
        // Marketing consent
        accepts_marketing: formData.consentMarketing === 'yes',
        accepts_marketing_updated_at: new Date().toISOString(),
        
        // SMS consent
        sms_marketing_consent: {
          state: formData.consentWhatsApp === 'yes' ? 'subscribed' : 'unsubscribed',
          opt_in_level: 'single_opt_in',
          consent_updated_at: new Date().toISOString()
        },
        
        // Addresses
        addresses: [
          {
            address1: `${formData.houseNo || ''} ${formData.building || ''}`.trim(),
            address2: `${formData.street || ''} ${formData.area || ''}`.trim(),
            city: formData.city,
            province: formData.state,
            country: formData.country || 'IN',
            zip: formData.pincode,
            phone: formData.mobile
          }
        ],
        
        // Note with all details
        note: `Customer Type: ${formData.customerType}\nGender: ${formData.gender || 'N/A'}\nDOB: ${formData.dob || 'N/A'}\nAnniversary: ${formData.anniversary || 'N/A'}\nReferral: ${formData.sourceOfReferral || 'N/A'}${formData.customerType === 'B2B' ? `\nBusiness: ${formData.businessName}\nGST: ${formData.gstNumber}` : ''}`
      }
    };

    const response = await shopifyAPI.post('/customers.json', customerData);
    
    logger.info('Customer created', { customerId: response.data.customer.id });
    
    return {
      success: true,
      customerId: response.data.customer.id,
      customer: response.data.customer
    };
    
  } catch (error) {
    logger.error('Create customer error', { error: error.message });
    return {
      success: false,
      error: error.response?.data?.errors || error.message
    };
  }
};

// Get products
exports.getProducts = async (limit = 50) => {
  try {
    const response = await shopifyAPI.get(`/products.json?limit=${limit}`);
    return response.data.products;
  } catch (error) {
    logger.error('Get products error', { error: error.message });
    throw error;
  }
};

// Get collections
exports.getCollections = async () => {
  try {
    const response = await shopifyAPI.get('/custom_collections.json');
    return response.data.custom_collections;
  } catch (error) {
    logger.error('Get collections error', { error: error.message });
    throw error;
  }
};
