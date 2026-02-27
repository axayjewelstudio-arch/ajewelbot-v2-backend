const shopifyService = require('../services/shopifyService');
const googleSheetsService = require('../services/googleSheetsService');

exports.handleFormSubmission = async (req, res) => {
  try {
    const formData = req.body;
    
    // Add timestamp and mobile log
    const timestamp = new Date().toISOString();
    const mobileLog = formData.mobile || formData.whatsapp;
    
    const enrichedData = {
      ...formData,
      timestamp,
      mobileLog
    };

    // Create customer in Shopify
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
      note: `Gender: ${formData.gender || 'N/A'}
Age Group: ${formData.ageGroup || 'N/A'}
DOB: ${formData.dateOfBirth || 'N/A'}
Anniversary: ${formData.weddingAnniversary || 'N/A'}
Referral: ${formData.referralCode || 'N/A'}`,
      addresses: [
        {
          address1: formData.businessAddress || '',
          city: formData.city || '',
          province: formData.state || '',
          zip: formData.pincode || '',
          country: formData.country || 'India'
        }
      ],
      metafields: [
        {
          namespace: 'custom',
          key: 'customer_type',
          value: formData.customerType,
          type: 'single_line_text_field'
        },
        {
          namespace: 'custom',
          key: 'business_name',
          value: formData.businessName || '',
          type: 'single_line_text_field'
        },
        {
          namespace: 'custom',
          key: 'gst_number',
          value: formData.gstNumber || '',
          type: 'single_line_text_field'
        }
      ]
    };

    const shopifyCustomer = await shopifyService.createCustomer(customerData);
    enrichedData.shopifyCustomerId = shopifyCustomer.id;

    // Save to Google Sheets
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
