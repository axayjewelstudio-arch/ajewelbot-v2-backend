const { google } = require('googleapis');

const SPREADSHEET_ID = '1w-4Zi65AqsQZFJIr1GLrDrW9BJNez8Wtr-dTL8oBLbs';
const SHEET_NAME = 'Registrations';
const RANGE = 'B:AO';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

exports.appendFormData = async (formData) => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    
    // ✅ Updated row mapping matching new sheet headers (B:AO)
    const row = [
      formData.gender || '',              // B - Gender
      formData.mobile || '',              // C - Mobile
      formData.whatsapp || '',            // D - Whatsapp
      formData.dob || '',                 // E - Dob
      formData.anniversary || '',         // F - Anniversary
      formData.ageGroup || '',            // G - Age_group
      formData.sourceOfReferral || '',    // H - Referral_source
      formData.houseNo || '',             // I - House_no
      formData.building || '',            // J - Building
      formData.street || '',              // K - Street
      formData.area || '',                // L - Area
      formData.country || '',             // M - Country
      formData.state || '',               // N - State
      formData.city || '',                // O - City
      formData.pincode || '',             // P - Pincode
      formData.landmark || '',            // Q - Landmark
      formData.delHouseNo || '',          // R - Del_house_no
      formData.delBuilding || '',         // S - Del_building
      formData.delStreet || '',           // T - Del_street
      formData.delArea || '',             // U - Del_area
      formData.delCountry || '',          // V - Delivery_country
      formData.delCity || '',             // W - Delivery_city
      formData.delPincode || '',          // X - Delivery_pincode
      formData.delLandmark || '',         // Y - Del_landmark
      formData.customerType || '',        // Z - Customer_type
      formData.businessName || '',        // AA - Business_name
      formData.businessCategory || '',    // AB - Business_category
      formData.businessMobile || '',      // AC - Business_mobile
      formData.businessEmail || '',       // AD - Business_email
      formData.businessAddress || '',     // AE - Business_address
      formData.businessArea || '',        // AF - Business_area
      formData.businessCity || '',        // AG - Business_city
      formData.businessState || '',       // AH - Business_state
      formData.businessPincode || '',     // AI - Business_pincode
      formData.gstNumber || '',           // AJ - Gst_number
      formData.consentMarketing || '',    // AK - Consent_marketing
      formData.consentWhatsApp || '',     // AL - Consent_whatsapp
      formData.consentTerms || '',        // AM - Consent_terms
      formData.referralCode || '',        // AN - Referral_code
      formData.mobileLog || ''            // AO - Note
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!${RANGE}`,
      valueInputOption: 'RAW',
      resource: {
        values: [row]
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Google Sheets error:', error.message);
    throw error;
  }
};
