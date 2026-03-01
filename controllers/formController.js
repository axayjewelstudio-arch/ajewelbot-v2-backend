const shopifyService = require('../services/shopifyService');
const googleSheetsService = require('../services/googleSheetsService');

exports.handleFormSubmission = async (req, res) => {
  try {
    const formData = req.body;
    
    const timestamp = new Date().toISOString();
    const mobileLog = formData.mobile || formData.whatsapp;
    
    const enrichedData = {
      ...formData,
      timestamp,
      mobileLog
    };

    const customerData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.mobile,
      tags: [
        formData.customerType,
        formData.sourceOfReferral,
        'join-us-registration'
      ].filter(Boolean).join(', '),
      
      password: formData.password,
      password_confirmation: formData.password,
      accepts_marketing: formData.consentMarketing === 'yes',
      sms_marketing_consent: {
        state: formData.consentWhatsApp === 'yes' ? 'subscribed' : 'unsubscribed',
        opt_in_level: 'single_opt_in',
        consent_updated_at: new Date().toISOString()
      }
    };

    const shopifyCustomer = await shopifyService.createCustomer(customerData);
    enrichedData.shopifyCustomerId = shopifyCustomer.id;

    await googleSheetsService.appendFormData(enrichedData);

    res.json({
      success: true,
      message: 'Registration successful!',
      customerId: shopifyCustomer.id
    });

  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};
