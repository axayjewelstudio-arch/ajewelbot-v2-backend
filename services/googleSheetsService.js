const { google } = require('googleapis');

const SPREADSHEET_ID = '1w-4Zi65AqsQZFJIr1GLrDrW9BJNez8Wtr-dTL8oBLbs';
const SHEET_NAME = 'Registrations';
const RANGE = 'B:AI';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

exports.appendFormData = async (formData) => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    
    const row = [
      formData.timestamp || '',
      formData.firstName || '',
      formData.lastName || '',
      formData.email || '',
      formData.mobile || '',
      formData.gender || '',
      formData.dob || '',
      formData.anniversary || '',
      formData.ageGroup || '',
      formData.customerType || '',
      formData.businessName || '',
      formData.businessCategory || '',
      formData.businessMobile || '',
      formData.businessEmail || '',
      formData.gstNumber || '',
      formData.houseNo || '',
      formData.building || '',
      formData.street || '',
      formData.area || '',
      formData.landmark || '',
      formData.city || '',
      formData.state || '',
      formData.country || '',
      formData.pincode || '',
      formData.businessAddress || '',
      formData.businessArea || '',
      formData.businessCity || '',
      formData.businessState || '',
      formData.businessPincode || '',
      formData.delHouseNo || '',
      formData.delBuilding || '',
      formData.delStreet || '',
      formData.delArea || '',
      formData.delLandmark || '',
      formData.delCity || '',
      formData.delState || '',
      formData.delCountry || '',
      formData.delPincode || '',
      formData.consentMarketing || '',
      formData.consentWhatsApp || '',
      formData.consentTerms || '',
      formData.sourceOfReferral || '',
      formData.referralCode || '',
      formData.shopifyCustomerId || '',
      formData.mobileLog || ''
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
