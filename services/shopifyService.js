const axios = require('axios');
const { logger } = require('../utils/logger');

const SHOPIFY_STORE = process.env.SHOPIFY_SHOP_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const shopifyAPI = axios.create({
  baseURL: `https://${SHOPIFY_STORE}/admin/api/2024-01`,
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    'Content-Type': 'application/json'
  }
});

// ==================== HELPER FUNCTIONS ====================

// Generate unique referral code
const generateReferralCode = (customerName, customerId) => {
  const namePrefix = customerName.substring(0, 3).toUpperCase();
  const idSuffix = customerId.toString().slice(-4);
  return `${namePrefix}${idSuffix}`;
};

// Send referral link via WhatsApp
const sendReferralLink = async (customerPhone, referralCode, customerName) => {
  try {
    const referralUrl = `https://${SHOPIFY_STORE}/pages/join-us?ref=${referralCode}`;
    
    const message = `🎁 *Share & Earn with A Jewel Studio!*\n\n` +
                   `Hello ${customerName}! 💎\n\n` +
                   `Your unique referral code: *${referralCode}*\n\n` +
                   `Share this link with friends:\n${referralUrl}\n\n` +
                   `*Benefits:*\n` +
                   `✅ Your friend gets 10% OFF on first order\n` +
                   `✅ You get ₹500 credit when they order\n\n` +
                   `Start sharing now! 🚀`;
    
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to: customerPhone,
      type: 'text',
      text: { body: message }
    };
    
    await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    logger.info('Referral link sent', { customerPhone, referralCode });
    return true;
    
  } catch (error) {
    logger.error('Send referral error', { error: error.message });
    return false;
  }
};

// ==================== MAIN FUNCTIONS ====================

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

// Create Shopify customer (WITH REFERRAL SYSTEM)
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
        note: `Customer Type: ${formData.customerType}\nGender: ${formData.gender || 'N/A'}\nDOB: ${formData.dob || 'N/A'}\nAnniversary: ${formData.anniversary || 'N/A'}\nReferral Source: ${formData.sourceOfReferral || 'N/A'}\nReferred By: ${formData.referralCode || 'Direct'}${formData.customerType === 'B2B' ? `\nBusiness: ${formData.businessName}\nGST: ${formData.gstNumber}` : ''}`
      }
    };

    const response = await shopifyAPI.post('/customers.json', customerData);
    const customer = response.data.customer;
    
    // Generate unique referral code for this customer
    const referralCode = generateReferralCode(formData.firstName, customer.id);
    
    // Send referral link via WhatsApp (async - don't wait)
    sendReferralLink(formData.mobile, referralCode, formData.firstName).catch(err => {
      logger.error('Referral link send failed', { error: err.message });
    });
    
    logger.info('Customer created with referral', { 
      customerId: customer.id,
      referralCode: referralCode
    });
    
    return {
      success: true,
      customerId: customer.id,
      customer: customer,
      referralCode: referralCode
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

// Get customer referral code
exports.getCustomerReferralCode = async (customerId, customerName) => {
  try {
    const referralCode = generateReferralCode(customerName, customerId);
    return referralCode;
  } catch (error) {
    logger.error('Get referral code error', { error: error.message });
    throw error;
  }
};

// Send referral link to existing customer
exports.sendCustomerReferralLink = async (customerPhone, customerId, customerName) => {
  try {
    const referralCode = generateReferralCode(customerName, customerId);
    await sendReferralLink(customerPhone, referralCode, customerName);
    return { success: true, referralCode };
  } catch (error) {
    logger.error('Send customer referral error', { error: error.message });
    return { success: false, error: error.message };
  }
};
