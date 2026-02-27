const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

exports.appendFormData = async (data) => {
  try {
    const values = [[
      data.mobileLog || data.mobile,
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.gender || '',
      data.mobile || '',
      data.whatsapp || '',
      data.dateOfBirth || '',
      data.weddingAnniversary || '',
      data.ageGroup || '',
      data.sourceOfReferral || '',
      data.country || '',
      data.state || '',
      data.city || '',
      data.pincode || '',
      data.deliveryDifferent || '',
      data.deliveryCountry || '',
      data.deliveryState || '',
      data.deliveryCity || '',
      data.deliveryPincode || '',
      data.customerType || '',
      data.businessName || '',
      data.businessCategory || '',
      data.businessMobile || '',
      data.businessEmail || '',
      data.businessAddress || '',
      data.businessArea || '',
      data.businessCity || '',
      data.businessState || '',
      data.businessPincode || '',
      data.gstNumber || '',
      data.consentMarketing || '',
      data.consentWhatsApp || '',
      data.consentTerms || '',
      data.referralCode || ''
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Registrations!A:AI',
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
