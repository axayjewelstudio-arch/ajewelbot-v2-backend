const { google } = require('googleapis');

const getGoogleSheet = async () => {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    return {
      appendRow: async (values) => {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Registrations!A:AO',
          valueInputOption: 'RAW',
          resource: { values: [values] }
        });
      }
    };
  } catch (error) {
    console.error('Google Sheets connection error:', error);
    throw error;
  }
};

const appendFormData = async (formData) => {
  try {
    const sheet = await getGoogleSheet();
    
    // Exact column mapping B to AO
    const rowData = [
      '',                                       // A - WhatsApp Number (bot fills this)
      formData.gender || '',                    // B - Gender
      formData.mobile || '',                    // C - Mobile
      formData.whatsapp || formData.mobile || '', // D - Whatsapp
      formData.dob || '',                       // E - Dob
      formData.anniversary || '',               // F - Anniversary
      formData.ageGroup || '',                  // G - Age_group
      formData.sourceOfReferral || '',          // H - Referral_source
      formData.houseNo || '',                   // I - House_no
      formData.building || '',                  // J - Building
      formData.street || '',                    // K - Street
      formData.area || '',                      // L - Area
      formData.country || 'IN',                 // M - Country
      formData.state || '',                     // N - State
      formData.city || '',                      // O - City
      formData.pincode || '',                   // P - Pincode
      formData.landmark || '',                  // Q - Landmark
      formData.delHouseNo || '',                // R - Del_house_no
      formData.delBuilding || '',               // S - Del_building
      formData.delStreet || '',                 // T - Del_street
      formData.delArea || '',                   // U - Del_area
      formData.delCountry || '',                // V - Delivery_country
      formData.delCity || '',                   // W - Delivery_city
      formData.delPincode || '',                // X - Delivery_pincode
      formData.delLandmark || '',               // Y - Del_landmark
      formData.customerType || 'Retail',        // Z - Customer_type
      formData.businessName || '',              // AA - Business_name
      formData.businessCategory || '',          // AB - Business_category
      formData.businessMobile || '',            // AC - Business_mobile
      formData.businessEmail || '',             // AD - Business_email
      formData.businessAddress || '',           // AE - Business_address
      formData.businessArea || '',              // AF - Business_area
      formData.businessCity || '',              // AG - Business_city
      formData.businessState || '',             // AH - Business_state
      formData.businessPincode || '',           // AI - Business_pincode
      formData.gstNumber || '',                 // AJ - Gst_number
      formData.consentMarketing || 'no',        // AK - Consent_marketing
      formData.consentWhatsApp || 'no',         // AL - Consent_whatsapp
      formData.consentTerms || 'no',            // AM - Consent_terms
      formData.referralCode || '',              // AN - Referral_code
      `${formData.firstName || ''} ${formData.lastName || ''} - ${formData.mobile || ''}`.trim() // AO - Note
    ];
    
    await sheet.appendRow(rowData);
    console.log('✅ Form data appended to Google Sheet (B:AO)');
    return true;
  } catch (error) {
    console.error('❌ Google Sheets append error:', error);
    throw error;
  }
};

module.exports = { appendFormData };
