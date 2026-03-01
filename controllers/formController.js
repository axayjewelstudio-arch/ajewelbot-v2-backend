const { createCustomer, addCustomerAddress, addCustomerMetafields } = require('../services/shopifyService');
const { appendFormData } = require('../services/googleSheetsService');

exports.handleFormSubmission = async (formData) => {
  try {
    // Prepare customer data
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
      email_marketing_consent: {
        state: formData.consentMarketing === 'yes' ? 'subscribed' : 'unsubscribed',
        opt_in_level: 'single_opt_in',
        consent_updated_at: new Date().toISOString()
      },
      sms_marketing_consent: {
        state: formData.consentWhatsApp === 'yes' ? 'subscribed' : 'unsubscribed',
        opt_in_level: 'single_opt_in',
        consent_updated_at: new Date().toISOString()
      }
    };

    // Create customer in Shopify
    console.log('Creating Shopify customer...');
    const customer = await createCustomer(customerData);
    const customerId = customer.id;

    // Add primary address
    if (formData.houseNo || formData.city) {
      const addressData = {
        first_name: formData.firstName || '',
        last_name: formData.lastName || '',
        address1: [formData.houseNo, formData.building, formData.street].filter(Boolean).join(', '),
        address2: formData.area || '',
        city: formData.city || '',
        province: formData.state || '',
        zip: formData.pincode || '',
        country: formData.country || 'India',
        phone: formData.mobile || ''
      };
      await addCustomerAddress(customerId, addressData);
      console.log('Primary address added');
    }

    // Add delivery address if different
    if (formData.delHouseNo || formData.delCity) {
      const deliveryAddress = {
        first_name: formData.firstName || '',
        last_name: formData.lastName || '',
        address1: [formData.delHouseNo, formData.delBuilding, formData.delStreet].filter(Boolean).join(', '),
        address2: formData.delArea || '',
        city: formData.delCity || '',
        province: formData.delState || '',
        zip: formData.delPincode || '',
        country: formData.delCountry || 'India',
        phone: formData.mobile || ''
      };
      await addCustomerAddress(customerId, deliveryAddress);
      console.log('Delivery address added');
    }

    // Add business address if wholesale
    if (formData.customerType === 'Wholesale' && (formData.businessAddress || formData.businessCity)) {
      const businessAddress = {
        first_name: formData.businessName || formData.firstName || '',
        last_name: 'Business',
        company: formData.businessName || '',
        address1: formData.businessAddress || '',
        address2: formData.businessArea || '',
        city: formData.businessCity || '',
        province: formData.businessState || '',
        zip: formData.businessPincode || '',
        country: 'India',
        phone: formData.businessMobile || formData.mobile || ''
      };
      await addCustomerAddress(customerId, businessAddress);
      console.log('Business address added');
    }

    // Prepare metafields
    const metafields = [];
    const metafieldMapping = {
      gender: 'gender',
      dob: 'date_of_birth',
      anniversary: 'wedding_anniversary',
      ageGroup: 'age_group',
      businessName: 'business_name',
      businessCategory: 'business_category',
      gstNumber: 'gst_number',
      referralCode: 'referral_code'
    };

    for (const [dataKey, metafieldKey] of Object.entries(metafieldMapping)) {
      if (formData[dataKey]) {
        metafields.push({
          namespace: 'custom',
          key: metafieldKey,
          value: formData[dataKey],
          type: 'single_line_text_field'
        });
      }
    }

    // Add metafields
    if (metafields.length > 0) {
      await addCustomerMetafields(customerId, metafields);
      console.log(`Added ${metafields.length} metafields`);
    }

    // Prepare data for Google Sheets
    formData.mobileLog = `${formData.firstName || ''} ${formData.lastName || ''} - ${formData.mobile || ''}`.trim();

    // Log to Google Sheets
    await appendFormData(formData);
    console.log('Data logged to Google Sheets');

    return {
      success: true,
      message: 'Registration successful!',
      customerId: customerId
    };

  } catch (error) {
    console.error('Form submission error:', error);
    return {
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    };
  }
};
