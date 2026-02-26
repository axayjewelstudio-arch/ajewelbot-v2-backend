const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

exports.appendFormData = async (data) => {
  try {
    const values = [[
      data.timestamp,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.customerType,
      data.shopifyCustomerId
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:G',  // Removed sheet name - will use first sheet
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
