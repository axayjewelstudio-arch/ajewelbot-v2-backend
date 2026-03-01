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
      
      verified_email: true,
      accepts_marketing: formData.consentMarketing === 'yes',
      sms_marketing_consent: {
        state: formData.consentWhatsApp === 'yes' ? 'subscribed' : 'unsubscribed',
        opt_in_level: 'single_opt_in',
        consent_updated_at: new Date().toISOString()
      },
      
      // ✅ ADDRESS PROPER FIELD MEIN
      addresses: [{
        address1: formData.businessAddress || '',
        address2: formData.businessArea || '',
        city: formData.city || formData.businessCity || '',
        province: formData.state || formData.businessState || '',
        zip: formData.pincode || formData.businessPincode || '',
        country: formData.country || 'India',
        phone: formData.mobile
      }],
      
      // ✅ METAFIELDS MEIN EXTRA DATA
      metafields: [
        {
          namespace: 'custom',
          key: 'gender',
          value: formData.gender || '',
          type: 'single_line_text_field'
        },
        {
          namespace: 'custom',
          key: 'date_of_birth',
          value: formData.dateOfBirth || '',
          type: 'single_line_text_field'
        },
        {
          namespace: 'custom',
          key: 'wedding_anniversary',
          value: formData.weddingAnniversary || '',
          type: 'single_line_text_field'
        },
        {
          namespace: 'custom',
          key: 'age_group',
          value: formData.ageGroup || '',
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
        },
        {
          namespace: 'custom',
          key: 'referral_code',
          value: formData.referralCode || '',
          type: 'single_line_text_field'
        }
      ]
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
