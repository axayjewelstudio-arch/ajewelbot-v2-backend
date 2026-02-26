const shopifyService = require('../services/shopifyService');
const googleSheetsService = require('../services/googleSheetsService');

exports.handleFormSubmission = async (req, res) => {
  try {
    const formData = req.body;
    
    // Step 1: Create/Update Shopify Customer
    const customer = await shopifyService.createOrUpdateCustomer({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      tags: formData.customerType || 'Retail',
      metafields: formData.metafields || []
    });

    // Step 2: Append to Google Sheets
    await googleSheetsService.appendFormData({
      ...formData,
      shopifyCustomerId: customer.id,
      timestamp: new Date().toISOString()
    });

    res.json({ 
      success: true, 
      customerId: customer.id,
      message: 'Form submitted successfully'
    });

  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
