const { google } = require('googleapis');

const SPREADSHEET_ID = '1w-4Zi65AqsQZFJIr1GLrDrW9BJNez8Wtr-dTL8oBLbs';
const SHEET_NAME = 'Registrations';

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
      // Get all data from Column A to C
      getRows: async () => {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${SHEET_NAME}!A:C`
        });
        return response.data.values || [];
      },
      
      // Append new row
      appendRow: async (values) => {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${SHEET_NAME}!A:AQ`,
          valueInputOption: 'RAW',
          resource: { values: [values] }
        });
      },
      
      // Update existing row
      updateRow: async (rowNumber, values) => {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${SHEET_NAME}!A${rowNumber}:AQ${rowNumber}`,
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

// ✅ PROBLEM 1 & 2: Find customer by mobile
const findCustomerByMobile = async (sheet, mobile) => {
  try {
    const rows = await sheet.getRows();
    
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === mobile) {
        return {
          exists: true,
          rowNumber: i + 1,
          firstName: rows[i][1] || '',
          lastName: rows[i][2] || '',
          hasFormData: !!(rows[i][1] || rows[i][2]) // Check if B or C has data
        };
      }
    }
    
    return { exists: false };
  } catch (error) {
    console.error('Error finding customer:', error);
    return { exists: false };
  }
};

const appendFormData = async (formData) => {
  try {
    const sheet = await getGoogleSheet();
    const mobile = formData.mobile || '';

    // ✅ PROBLEM 1 & 2: Check if customer exists
    const customer = await findCustomerByMobile(sheet, mobile);

    // ✅ PROBLEM 3: Updated column mapping A to AQ (with B & C for names)
    const rowData = [
      mobile,                                   // A - Mobile Number
      formData.firstName || '',                 // B - First Name ✅ NEW
      formData.lastName || '',                  // C - Last Name ✅ NEW
      formData.gender || '',                    // D - Gender (was B)
      formData.mobile || '',                    // E - Mobile (was C)
      formData.whatsapp || formData.mobile || '', // F - Whatsapp (was D)
      formData.dob || '',                       // G - Dob (was E)
      formData.anniversary || '',               // H - Anniversary (was F)
      formData.ageGroup || '',                  // I - Age_group (was G)
      formData.sourceOfReferral || '',          // J - Referral_source (was H)
      formData.houseNo || '',                   // K - House_no (was I)
      formData.building || '',                  // L - Building (was J)
      formData.street || '',                    // M - Street (was K)
      formData.area || '',                      // N - Area (was L)
      formData.country || '',                   // O - Country (was M)
      formData.state || '',                     // P - State (was N)
      formData.city || '',                      // Q - City (was O)
      formData.pincode || '',                   // R - Pincode (was P)
      formData.landmark || '',                  // S - Landmark (was Q)
      formData.delHouseNo || '',                // T - Del_house_no (was R)
      formData.delBuilding || '',               // U - Del_building (was S)
      formData.delStreet || '',                 // V - Del_street (was T)
      formData.delArea || '',                   // W - Del_area (was U)
      formData.delCountry || '',                // X - Delivery_country (was V)
      formData.delCity || '',                   // Y - Delivery_city (was W)
      formData.delPincode || '',                // Z - Delivery_pincode (was X)
      formData.delLandmark || '',               // AA - Del_landmark (was Y)
      formData.customerType || '',              // AB - Customer_type (was Z)
      formData.businessName || '',              // AC - Business_name (was AA)
      formData.businessCategory || '',          // AD - Business_category (was AB)
      formData.businessMobile || '',            // AE - Business_mobile (was AC)
      formData.businessEmail || '',             // AF - Business_email (was AD)
      formData.businessAddress || '',           // AG - Business_address (was AE)
      formData.businessArea || '',              // AH - Business_area (was AF)
      formData.businessCity || '',              // AI - Business_city (was AG)
      formData.businessState || '',             // AJ - Business_state (was AH)
      formData.businessPincode || '',           // AK - Business_pincode (was AI)
      formData.gstNumber || '',                 // AL - Gst_number (was AJ)
      formData.consentMarketing || '',          // AM - Consent_marketing (was AK)
      formData.consentWhatsApp || '',           // AN - Consent_whatsapp (was AL)
      formData.consentTerms || '',              // AO - Consent_terms (was AM)
      formData.referralCode || '',              // AP - Referral_code (was AN)
      `${formData.firstName || ''} ${formData.lastName || ''} - ${formData.mobile || ''}`.trim() // AQ - Note (was AO)
    ];

    if (customer.exists) {
      // ✅ PROBLEM 1: Update same row (not new row)
      if (customer.hasFormData) {
        // ✅ PROBLEM 2: Already registered - reject
        console.log(`⚠️ Customer already registered: ${customer.firstName} ${customer.lastName}`);
        return {
          success: false,
          alreadyRegistered: true,
          customerName: `${customer.firstName} ${customer.lastName}`.trim(),
          message: 'Customer already registered'
        };
      } else {
        // Number exists but no form data - update same row
        await sheet.updateRow(customer.rowNumber, rowData);
        console.log(`✅ Updated row ${customer.rowNumber} for: ${formData.firstName} ${formData.lastName}`);
        return { success: true };
      }
    } else {
      // New customer - append new row
      await sheet.appendRow(rowData);
      console.log(`✅ New registration: ${formData.firstName} ${formData.lastName}`);
      return { success: true };
    }

  } catch (error) {
    console.error('❌ Google Sheets error:', error);
    throw error;
  }
};

module.exports = { appendFormData };
