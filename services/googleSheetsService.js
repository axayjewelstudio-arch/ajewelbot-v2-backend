const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

exports.appendFormData = async (data) => {
  try {
    const values = [[
      data.mobileLog || data.mobile,           // A - Mobile Number (Log)
      data.firstName || '',                     // B - First Name
      data.lastName || '',                      // C - Last Name
      data.email || '',                         // D - Email
      data.gender || '',                        // E - Gender
      data.mobile || '',                        // F - Mobile
      data.whatsapp || '',                      // G - WhatsApp
      data.dateOfBirth || '',                   // H - Date of Birth
      data.weddingAnniversary || '',            // I - Wedding Anniversary
      data.ageGroup || '',                      // J - Age Group
      data.sourceOfReferral || '',              // K - Source of Referral
      data.country || '',                       // L - Country
      data.state || '',                         // M - State
      data.city || '',                          // N - City
      data.pincode || '',                       // O - Pincode
      data.deliveryDifferent || '',             // P - Delivery Different
      data.deliveryCountry || '',               // Q - Delivery Country
      data.deliveryState || '',                 // R - Delivery State
      data.deliveryCity || '',                  // S - Delivery City
      data.deliveryPincode || '',               // T - Delivery Pincode
      data.customerType || '',                  // U - Customer Type
      data.businessName || '',                  // V - Business Name
      data.businessCategory || '',              // W - Business Category
      data.businessMobile || '',                // X - Business Mobile
      data.businessEmail || '',                 // Y - Business Email
      data.businessAddress || '',               // Z - Business Address
      data.businessArea || '',                  // AA - Business Area
      data.businessCity || '',                  // AB - Business City
      data.businessState || '',                 // AC - Business State
      data.businessPincode || '',               // AD - Business Pincode
      data.gstNumber || '',                     // AE - GST Number
      data.consentMarketing || '',              // AF - Consent Marketing
      data.consentWhatsApp || '',               // AG - Consent WhatsApp
      data.consentTerms || '',                  // AH - Consent Terms
      data.referralCode || ''                   // AI - Referral Code
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Registrations!A:AI',  // ✅ Updated range
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });

    console.log('✅ Data added to Google Sheet');
    return true;
  } catch (error) {
    console.error('Google Sheets Error:', error.message);
    throw new Error(`Google Sheets error: ${error.message}`);
  }
};
