const axios = require('axios');

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const shopifyAPI = axios.create({
  baseURL: `https://${SHOPIFY_STORE}/admin/api/2024-01`,
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    'Content-Type': 'application/json'
  }
});

exports.createCustomer = async (customerData) => {
  try {
    const response = await shopifyAPI.post('/customers.json', {
      customer: customerData
    });
    return response.data.customer;
  } catch (error) {
    console.error('Shopify create customer error:', error.response?.data || error.message);
    throw error;
  }
};

exports.addCustomerAddress = async (addressData) => {
  try {
    const customerId = addressData.customer_id;
    const response = await shopifyAPI.post(`/customers/${customerId}/addresses.json`, {
      address: addressData.address
    });
    return response.data.customer_address;
  } catch (error) {
    console.error('Shopify add address error:', error.response?.data || error.message);
    throw error;
  }
};

exports.addCustomerMetafields = async (metafields) => {
  try {
    const promises = metafields.map(async (metafield) => {
      const customerId = metafield.customer_id;
      return shopifyAPI.post(`/customers/${customerId}/metafields.json`, {
        metafield: {
          namespace: metafield.namespace,
          key: metafield.key,
          value: metafield.value,
          type: metafield.type
        }
      });
    });
    
    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error('Shopify add metafields error:', error.response?.data || error.message);
    throw error;
  }
};
