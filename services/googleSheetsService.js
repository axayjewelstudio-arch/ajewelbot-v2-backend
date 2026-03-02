const { google } = require('googleapis');

const SPREADSHEET_ID = '1w-4Zi65AqsQZFJIr1GLrDrW9BJNez8Wtr-dTL8oBLbs';
const SHEET_NAME = 'Registrations';

const getGoogleSheetsAuth = () => {
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
};

// ✅ Find row by WhatsApp number in Column A
const findRowByWhatsApp = async (whatsappNumber) => {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`
    });
    
    const rows = result.data.values || [];
    
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === whatsappNumber) {
        return i + 1; // Row number (1-indexed)
      }
    }
    
    return null; // Not found
  } catch (error) {
    console.error('❌ Error finding row:', error.message);
    return null;
  }
};

// ✅ Update existing row (B:AO)
const updateExistingRow = async (rowNumber, formData) => {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const rowData = [
      formData.gender || '',                    // B
      formData.mobile || '',                    // C
      formData.whatsapp || formData.mobile || '', // D
      formData.dob || '',                       // E
      formData.anniversary || '',               // F
      formData.ageGroup || '',                  // G
      formData.sourceOfReferral || '',          // H
      formData.houseNo || '',                   // I
      formData.building || '',                  // J
      formData.street || '',                    // K
      formData.area || '',                      // L
      formData.country || 'IN',                 // M
      formData.state || '',                     // N
      formData.city || '',                      // O
      formData.pincode || '',                   // P
      formData.landmark || '',                  // Q
      formData.delHouseNo || '',                // R
      formData.delBuilding || '',               // S
      formData.delStreet || '',                 // T
      formData.delArea || '',                   // U
      formData.delCountry || '',                // V
      formData.delCity || '',                   // W
      formData.delPincode || '',                // X
      formData.delLandmark || '',               // Y
      formData.customerType || 'Retail',        // Z
      formData.businessName || '',              // AA
      formData.businessCategory || '',          // AB
      formData.businessMobile || '',            // AC
      formData.businessEmail || '',             // AD
      formData.businessAddress || '',           // AE
      formData.businessArea || '',              // AF
      formData.businessCity || '',              // AG
      formData.businessState || '',             // AH
      formData.businessPincode || '',           // AI
      formData.gstNumber || '',                 // AJ
      formData.consentMarketing || 'no',        // AK
      formData.consentWhatsApp || 'no',         // AL
      formData.consentTerms || 'no',            // AM
      formData.referralCode || '',              // AN
      `${formData.firstName || ''} ${formData.lastName || ''} - ${formData.mobile || ''}`.trim() // AO
    ];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!B${rowNumber}:AO${rowNumber}`,
      valueInputOption: 'RAW',
      resource: {
        values: [rowData]
      }
    });
    
    console.log(`✅ Updated row ${rowNumber} with form data`);
    return { success: true, rowNumber, action: 'updated' };
  } catch (error) {
    console.error('❌ Error updating row:', error.message);
    throw error;
  }
};

// ✅ Create new row (A:AO)
const createNewRow = async (formData) => {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const rowData = [
      formData.whatsapp || formData.mobile || '', // A - WhatsApp Number
      formData.gender || '',                    // B
      formData.mobile || '',                    // C
      formData.whatsapp || formData.mobile || '', // D
      formData.dob || '',                       // E
      formData.anniversary || '',               // F
      formData.ageGroup || '',                  // G
      formData.sourceOfReferral || '',          // H
      formData.houseNo || '',                   // I
      formData.building || '',                  // J
      formData.street || '',                    // K
      formData.area || '',                      // L
      formData.country || 'IN',                 // M
      formData.state || '',                     // N
      formData.city || '',                      // O
      formData.pincode || '',                   // P
      formData.landmark || '',                  // Q
      formData.delHouseNo || '',                // R
      formData.delBuilding || '',               // S
      formData.delStreet || '',                 // T
      formData.delArea || '',                   // U
      formData.delCountry || '',                // V
      formData.delCity || '',                   // W
      formData.delPincode || '',                // X
      formData.delLandmark || '',               // Y
      formData.customerType || 'Retail',        // Z
      formData.businessName || '',              // AA
      formData.businessCategory || '',          // AB
      formData.businessMobile || '',            // AC
      formData.businessEmail || '',             // AD
      formData.businessAddress || '',           // AE
      formData.businessArea || '',              // AF
      formData.businessCity || '',              // AG
      formData.businessState || '',             // AH
      formData.businessPincode || '',           // AI
      formData.gstNumber || '',                 // AJ
      formData.consentMarketing || 'no',        // AK
      formData.consentWhatsApp || 'no',         // AL
      formData.consentTerms || 'no',            // AM
      formData.referralCode || '',              // AN
      `${formData.firstName || ''} ${formData.lastName || ''} - ${formData.mobile || ''}`.trim() // AO
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:AO`,
      valueInputOption: 'RAW',
      resource: {
        values: [rowData]
      }
    });
    
    console.log('✅ Created new row with form data');
    return { success: true, action: 'created' };
  } catch (error) {
    console.error('❌ Error creating row:', error.message);
    throw error;
  }
};

// ✅ Main function: Match & Update or Create
exports.appendFormData = async (formData) => {
  try {
    const whatsappNumber = formData.whatsapp || formData.mobile;
    
    if (!whatsappNumber) {
      throw new Error('WhatsApp or Mobile number required');
    }
    
    console.log(`🔍 Checking for WhatsApp number: ${whatsappNumber}`);
    
    // Find row in Column A
    const rowNumber = await findRowByWhatsApp(whatsappNumber);
    
    if (rowNumber) {
      // Match found - Update existing row
      console.log(`✅ Match found at row ${rowNumber} - Updating...`);
      return await updateExistingRow(rowNumber, formData);
    } else {
      // No match - Create new row
      console.log('❌ No match found - Creating new row...');
      return await createNewRow(formData);
    }
  } catch (error) {
    console.error('❌ Google Sheets error:', error.message);
    throw error;
  }
};
