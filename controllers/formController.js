const shopifyService = require('../services/shopifyService');
const googleSheetsService = require('../services/googleSheetsService');

exports.handleFormSubmission = async (req, res) => {
  try {
    const formData = req.body;
    
    const timestamp = new Date().toISOString();
    const mobileLog = formData.mobile || formData.whatsapp || '';
    
    const enrichedData = {
      ...formData,
      timestamp,
      mobileLog
    };

    // ✅ STEP 1: Create Customer (Basic Info)
    const customerData = {
      first_name: formData.firstName || '',
      last_name: formData.lastName || '',
      email: formData.email || '',
      phone: formData.mobile || '',
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
      }
    };

    const shopifyCustomer = await shopifyService.createCustomer(customerData);
    const customerId = shopifyCustomer.id;
    enrichedData.shopifyCustomerId = customerId;

    // ✅ STEP 2: Add Address
    if (formData.houseNo || formData.businessAddress) {
      const addressData = {
        customer_id: customerId,
        address: {
          first_name: formData.firstName || '',
          last_name: formData.lastName || '',
          address1: formData.houseNo 
            ? `${formData.houseNo}, ${formData.building || ''}, ${formData.street || ''}`.trim()
            : formData.businessAddress || '',
          address2: formData.area || formData.businessArea || '',
          city: formData.city || formData.businessCity || '',
          province: formData.state || formData.businessState || '',
          zip: formData.pincode || formData.businessPincode || '',
          country: formData.country || 'India',
          phone: formData.mobile || ''
        }
      };
      
      await shopifyService.addCustomerAddress(addressData);
    }

    // ✅ STEP 3: Add Metafields
    const metafields = [];
    
    if (formData.gender) {
      metafields.push({
        customer_id: customerId,
        namespace: 'custom',
        key: 'gender',
        value: formData.gender,
        type: 'single_line_text_field'
      });
    }
    
    if (formData.dob) {
      metafields.push({
        customer_id: customerId,
        namespace: 'custom',
        key: 'date_of_birth',
        value: formData.dob,
        type: 'single_line_text_field'
      });
    }
    
    if (formData.anniversary) {
      metafields.push({
        customer_id: customerId,
        namespace: 'custom',
        key: 'wedding_anniversary',
        value: formData.anniversary,
        type: 'single_line_text_field'
      });
    }
    
    if (formData.ageGroup) {
      metafields.push({
        customer_id: customerId,
        namespace: 'custom',
        key: 'age_group',
        value: formData.ageGroup,
        type: 'single_line_text_field'
      });
    }
    
    if (formData.businessName) {
      metafields.push({
        customer_id: customerId,
        namespace: 'custom',
        key: 'business_name',
        value: formData.businessName,
        type: 'single_line_text_field'
      });
    }
    
    if (formData.gstNumber) {
      metafields.push({
        customer_id: customerId,
        namespace: 'custom',
        key: 'gst_number',
        value: formData.gstNumber,
        type: 'single_line_text_field'
      });
    }
    
    if (formData.referralCode) {
      metafields.push({
        customer_id: customerId,
        namespace: 'custom',
        key: 'referral_code',
        value: formData.referralCode,
        type: 'single_line_text_field'
      });
    }

    if (metafields.length > 0) {
      await shopifyService.addCustomerMetafields(metafields);
    }

    // ✅ STEP 4: Save to Google Sheets
    await googleSheetsService.appendFormData(enrichedData);

    res.json({
      success: true,
      message: 'Registration successful!',
      customerId: customerId
    });

  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  }
};
