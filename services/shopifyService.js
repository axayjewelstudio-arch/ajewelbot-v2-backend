const axios = require('axios');

const SHOPIFY_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN;
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = '2024-01';

const shopifyAPI = axios.create({
  baseURL: `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': ACCESS_TOKEN
  }
});

// Create customer
exports.createCustomer = async (customerData) => {
  try {
    const response = await shopifyAPI.post('/customers.json', {
      customer: customerData
    });
    console.log('✅ Customer created:', response.data.customer.id);
    return response.data.customer;
  } catch (error) {
    console.error('Shopify create customer error:', error.response?.data || error.message);
    throw error;
  }
};

// Add customer address
exports.addCustomerAddress = async (customerId, addressData) => {
  try {
    // Extract numeric ID from GID if needed
    const numericId = typeof customerId === 'string' && customerId.includes('gid://')
      ? customerId.split('/').pop()
      : customerId;

    const response = await shopifyAPI.post(`/customers/${numericId}/addresses.json`, {
      address: addressData
    });
    console.log('✅ Address added for customer:', numericId);
    return response.data.customer_address;
  } catch (error) {
    console.error('Shopify add address error:', error.response?.data || error.message);
    throw error;
  }
};

// Add customer metafields
exports.addCustomerMetafields = async (customerId, metafields) => {
  try {
    // Extract numeric ID from GID if needed
    const numericId = typeof customerId === 'string' && customerId.includes('gid://')
      ? customerId.split('/').pop()
      : customerId;

    const promises = metafields.map(metafield =>
      shopifyAPI.post(`/customers/${numericId}/metafields.json`, {
        metafield: {
          ...metafield,
          owner_id: numericId,
          owner_resource: 'customer'
        }
      })
    );

    await Promise.all(promises);
    console.log('✅ Metafields added for customer:', numericId);
    return true;
  } catch (error) {
    console.error('Shopify add metafields error:', error.response?.data || error.message);
    throw error;
  }
};
