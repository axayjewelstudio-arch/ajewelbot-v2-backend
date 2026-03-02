const shopifyService = require('../services/shopifyService');
const googleSheetsService = require('../services/googleSheetsService');

exports.handleFormSubmission = async (req, res) => {
  try {
    console.log('📥 Form submission received');
    const formData = req.body;
    
    console.log('📋 Form data:', JSON.stringify(formData, null, 2));
    
    // Step 1: Create Shopify customer
    console.log('🛍️ Creating Shopify customer...');
    const shopifyCustomer = await shopifyService.createOrUpdateCustomer(formData);
    console.log('✅ Shopify customer created:', shopifyCustomer.id);
    
    // Step 2: Save to Google Sheets
    console.log('📊 Saving to Google Sheets...');
    const sheetResult = await googleSheetsService.appendFormData(formData);
    console.log('✅ Google Sheets saved:', sheetResult.action);
    
    // Success response
    res.json({
      success: true,
      message: 'Registration successful',
      customerId: shopifyCustomer.id,
      sheetAction: sheetResult.action
    });
    
  } catch (error) {
    console.error('❌ Form submission error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  }
};
