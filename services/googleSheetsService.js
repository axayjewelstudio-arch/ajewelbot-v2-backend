const { google } = require('googleapis');
const { logger } = require('../utils/logger');

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
      },
      
      findRowByPhone: async (phone) => {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Registrations!A:A'
        });
        
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === phone);
        return rowIndex >= 0 ? rowIndex + 1 : null;
      },
      
      updateRow: async (rowIndex, values) => {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Registrations!B${rowIndex}:AO${rowIndex}`,
          valueInputOption: 'RAW',
          resource: { values: [values] }
        });
      }
    };
  } catch (error) {
    logger.error('Google Sheets error', { error: error.message });
    throw error;
  }
};

const appendFormData = async (formData) => {
  try {
    const sheet = await getGoogleSheet();
    
    // Check if phone exists in Column A (WhatsApp bot already logged it)
    const existingRow = await sheet.findRowByPhone(formData.mobile);
    
    // Data for columns B to AO (Column A already has WhatsApp number)
    const rowData = [
      formData.gender || '',                    // B - Gender
      formData.mobile || '',                    // C - Mobile
      formData.mobile || '',                    // D - Whatsapp
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
      `${formData.firstName || ''} ${formData.lastName || ''} - ${new Date().toISOString()}`.trim() // AO - Note
    ];
    
    if (existingRow) {
      // Update B:AO in existing row (A already has number from WhatsApp bot)
      await sheet.updateRow(existingRow, rowData);
      logger.info('Google Sheets updated (B:AO)', { row: existingRow });
    } else {
      // New row - Add phone in A, then data in B:AO
      const fullRow = [formData.mobile, ...rowData];
      await sheet.appendRow(fullRow);
      logger.info('Google Sheets new row (A:AO)');
    }
    
    return true;
  } catch (error) {
    logger.error('Google Sheets error', { error: error.message });
    throw error;
  }
};

module.exports = { appendFormData };
