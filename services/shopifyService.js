const axios = require('axios');

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || 'a-jewel-studio-3.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const shopifyAPI = axios.create({
  baseURL: `https://${SHOPIFY_STORE}/admin/api/2024-01`,
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    'Content-Type': 'application/json'
  }
});

exports.createOrUpdateCustomer = async (formData) => {
  try {
    const customerData = {
      customer: {
        first_name: formData.firstName || '',
        last_name: formData.lastName || '',
        email: formData.email || '',
        phone: formData.mobile || '',
        tags: [
          formData.customerType || 'Retail',
          formData.sourceOfReferral || '',
          'join-us-registration'
        ].filter(Boolean).join(', '),
        note: `Account Type: ${formData.customerType || 'Retail'}\nBusiness: ${formData.businessName || 'N/A'}\nGST: ${formData.gstNumber || 'N/A'}`,
        send_email_invite: true,
        accepts_marketing: formData.consentMarketing === 'yes',
        sms_marketing_consent: {
          state: formData.consentWhatsApp === 'yes' ? 'subscribed' : 'unsubscribed',
          opt_in_level: 'single_opt_in',
          consent_updated_at: new Date().toISOString()
        },
        addresses: [
          {
            address1: `${formData.houseNo || ''} ${formData.building || ''}`.trim(),
            address2: `${formData.street || ''} ${formData.area || ''}`.trim(),
            city: formData.city || '',
            province: formData.state || '',
            zip: formData.pincode || '',
            country: formData.country || 'India'
          }
        ]
      }
    };
    
    const response = await shopifyAPI.post('/customers.json', customerData);
    console.log('✅ Shopify customer created');
    return response.data.customer;
    
  } catch (error) {
    console.error('❌ Shopify API error:', error.response?.data || error.message);
    throw new Error('Failed to create Shopify customer');
  }
};
