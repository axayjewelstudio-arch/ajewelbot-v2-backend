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
      appendRow: async (sheetName, values) => {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${sheetName}!A:Z`,
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
      
      updateRow: async (sheetName, rowIndex, values) => {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!B${rowIndex}:AQ${rowIndex}`,
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

// ==================== SHEET 1: REGISTRATIONS ====================

const appendFormData = async (formData) => {
  try {
    const sheet = await getGoogleSheet();
    
    // Check if phone exists in Column A
    const existingRow = await sheet.findRowByPhone(formData.mobile);
    
    // Data for columns B to AQ
    const rowData = [
      formData.firstName || '',                 // B - First Name
      formData.lastName || '',                  // C - Last Name
      formData.gender || '',                    // D - Gender
      formData.mobile || '',                    // E - Mobile
      formData.mobile || '',                    // F - Whatsapp
      formData.dob || '',                       // G - Dob
      formData.anniversary || '',               // H - Anniversary
      formData.ageGroup || '',                  // I - Age_group
      formData.sourceOfReferral || '',          // J - Referral_source
      formData.houseNo || '',                   // K - House_no
      formData.building || '',                  // L - Building
      formData.street || '',                    // M - Street
      formData.area || '',                      // N - Area
      formData.country || 'IN',                 // O - Country
      formData.state || '',                     // P - State
      formData.city || '',                      // Q - City
      formData.pincode || '',                   // R - Pincode
      formData.landmark || '',                  // S - Landmark
      formData.delHouseNo || '',                // T - Del_house_no
      formData.delBuilding || '',               // U - Del_building
      formData.delStreet || '',                 // V - Del_street
      formData.delArea || '',                   // W - Del_area
      formData.delCountry || '',                // X - Delivery_country
      formData.delCity || '',                   // Y - Delivery_city
      formData.delPincode || '',                // Z - Delivery_pincode
      formData.delLandmark || '',               // AA - Del_landmark
      formData.customerType || 'Retail',        // AB - Customer_type
      formData.businessName || '',              // AC - Business_name
      formData.businessCategory || '',          // AD - Business_category
      formData.businessMobile || '',            // AE - Business_mobile
      formData.businessEmail || '',             // AF - Business_email
      formData.businessAddress || '',           // AG - Business_address
      formData.businessArea || '',              // AH - Business_area
      formData.businessCity || '',              // AI - Business_city
      formData.businessState || '',             // AJ - Business_state
      formData.businessPincode || '',           // AK - Business_pincode
      formData.gstNumber || '',                 // AL - Gst_number
      formData.consentMarketing || 'no',        // AM - Consent_marketing
      formData.consentWhatsApp || 'no',         // AN - Consent_whatsapp
      formData.consentTerms || 'no',            // AO - Consent_terms
      formData.referralCode || '',              // AP - Referral_code
      `${formData.firstName || ''} ${formData.lastName || ''} - ${new Date().toISOString()}`.trim() // AQ - Note
    ];
    
    if (existingRow) {
      await sheet.updateRow('Registrations', existingRow, rowData);
      logger.info('Registrations sheet updated (B:AQ)', { row: existingRow });
    } else {
      const fullRow = [formData.mobile, ...rowData];
      await sheet.appendRow('Registrations', fullRow);
      logger.info('Registrations sheet new row (A:AQ)');
    }
    
    return true;
  } catch (error) {
    logger.error('Registrations sheet error', { error: error.message });
    throw error;
  }
};

// ==================== SHEET 2: PARTNER STORES ====================

const addPartnerStore = async (storeData) => {
  try {
    const sheet = await getGoogleSheet();
    
    const rowData = [
      storeData.storeId || '',                  // A - Store ID
      storeData.storeName || '',                // B - Store Name
      storeData.ownerName || '',                // C - Owner Name
      storeData.email || '',                    // D - Email
      storeData.phone || '',                    // E - Phone
      storeData.address || '',                  // F - Address
      storeData.city || '',                     // G - City
      storeData.state || '',                    // H - State
      storeData.pincode || '',                  // I - Pincode
      storeData.gstNumber || '',                // J - GST Number
      storeData.commission || '15%',            // K - Commission %
      storeData.status || 'Active',             // L - Status
      new Date().toISOString().split('T')[0],   // M - Onboarding Date
      '',                                       // N - Last Order Date
      0,                                        // O - Total Orders
      0,                                        // P - Total Revenue
      0,                                        // Q - Outstanding Balance
      storeData.notes || ''                     // R - Notes
    ];
    
    await sheet.appendRow('Partner Stores', rowData);
    logger.info('Partner store added', { storeId: storeData.storeId });
    
    return true;
  } catch (error) {
    logger.error('Partner store error', { error: error.message });
    throw error;
  }
};

// ==================== SHEET 3: ORDERS ====================

const logOrder = async (orderData) => {
  try {
    const sheet = await getGoogleSheet();
    
    const rowData = [
      orderData.orderId || '',                  // A - Order ID
      orderData.shopifyOrderId || '',           // B - Shopify Order ID
      new Date().toISOString().split('T')[0],   // C - Order Date
      orderData.storeId || '',                  // D - Store ID
      orderData.storeName || '',                // E - Store Name
      orderData.customerName || '',             // F - Customer Name
      orderData.customerEmail || '',            // G - Customer Email
      orderData.customerPhone || '',            // H - Customer Phone
      orderData.productSku || '',               // I - Product SKU
      orderData.productName || '',              // J - Product Name
      orderData.quantity || 1,                  // K - Quantity
      orderData.unitPrice || 0,                 // L - Unit Price
      orderData.totalAmount || 0,               // M - Total Amount
      orderData.commissionAmount || 0,          // N - Commission Amount
      orderData.paymentStatus || 'Pending',     // O - Payment Status
      orderData.fulfillmentStatus || 'Pending', // P - Fulfillment Status
      orderData.trackingNumber || '',           // Q - Tracking Number
      orderData.deliveryDate || '',             // R - Delivery Date
      orderData.notes || ''                     // S - Notes
    ];
    
    await sheet.appendRow('Orders', rowData);
    logger.info('Order logged', { orderId: orderData.orderId });
    
    return true;
  } catch (error) {
    logger.error('Order log error', { error: error.message });
    throw error;
  }
};

// ==================== SHEET 4: APPOINTMENTS ====================

const logAppointment = async (appointmentData) => {
  try {
    const sheet = await getGoogleSheet();
    
    const rowData = [
      appointmentData.appointmentId || `APT${Date.now()}`, // A - Appointment ID
      appointmentData.customerName || '',       // B - Customer Name
      appointmentData.customerEmail || '',      // C - Customer Email
      appointmentData.customerPhone || '',      // D - Customer Phone
      appointmentData.storeId || '',            // E - Store ID
      appointmentData.storeName || 'A Jewel Studio', // F - Store Name
      appointmentData.appointmentDate || '',    // G - Appointment Date
      appointmentData.appointmentTime || '',    // H - Appointment Time
      appointmentData.serviceType || 'Consultation', // I - Service Type
      appointmentData.productCategory || '',    // J - Product Category
      appointmentData.status || 'Scheduled',    // K - Status
      appointmentData.assignedStaff || '',      // L - Assigned Staff
      appointmentData.notes || '',              // M - Notes
      appointmentData.followUpRequired || 'No', // N - Follow-up Required
      appointmentData.followUpDate || '',       // O - Follow-up Date
      new Date().toISOString().split('T')[0],   // P - Created Date
      'Yes',                                    // Q - Confirmation Sent
      'No'                                      // R - Reminder Sent
    ];
    
    await sheet.appendRow('Appointments', rowData);
    logger.info('Appointment logged', { appointmentId: appointmentData.appointmentId });
    
    return true;
  } catch (error) {
    logger.error('Appointment log error', { error: error.message });
    throw error;
  }
};

// ==================== SHEET 5: STOCK ALERTS ====================

const logStockAlert = async (alertData) => {
  try {
    const sheet = await getGoogleSheet();
    
    const rowData = [
      alertData.alertId || `ALT${Date.now()}`,  // A - Alert ID
      alertData.productSku || '',               // B - Product SKU
      alertData.productName || '',              // C - Product Name
      alertData.category || '',                 // D - Category
      alertData.currentStock || 0,              // E - Current Stock
      alertData.minimumStockLevel || 5,         // F - Minimum Stock Level
      alertData.storeId || '',                  // G - Store ID
      alertData.storeName || '',                // H - Store Name
      new Date().toISOString().split('T')[0],   // I - Alert Date
      alertData.alertType || 'Low Stock',       // J - Alert Type
      alertData.reorderQuantity || 10,          // K - Reorder Quantity
      alertData.supplierName || '',             // L - Supplier Name
      alertData.supplierContact || '',          // M - Supplier Contact
      alertData.expectedRestockDate || '',      // N - Expected Restock Date
      alertData.status || 'Pending',            // O - Status
      alertData.priority || 'Medium',           // P - Priority
      alertData.notes || '',                    // Q - Notes
      new Date().toISOString()                  // R - Last Updated
    ];
    
    await sheet.appendRow('Stock Alerts', rowData);
    logger.info('Stock alert logged', { alertId: alertData.alertId });
    
    return true;
  } catch (error) {
    logger.error('Stock alert error', { error: error.message });
    throw error;
  }
};

// ==================== SHEET 6: REFUNDS ====================

const logRefund = async (refundData) => {
  try {
    const sheet = await getGoogleSheet();
    
    const rowData = [
      refundData.refundId || `REF${Date.now()}`, // A - Refund ID
      refundData.orderId || '',                 // B - Order ID
      refundData.shopifyOrderId || '',          // C - Shopify Order ID
      new Date().toISOString().split('T')[0],   // D - Refund Date
      refundData.storeId || '',                 // E - Store ID
      refundData.storeName || '',               // F - Store Name
      refundData.customerName || '',            // G - Customer Name
      refundData.customerEmail || '',           // H - Customer Email
      refundData.productSku || '',              // I - Product SKU
      refundData.productName || '',             // J - Product Name
      refundData.originalAmount || 0,           // K - Original Amount
      refundData.refundAmount || 0,             // L - Refund Amount
      refundData.refundReason || '',            // M - Refund Reason
      refundData.refundType || 'Full',          // N - Refund Type
      refundData.paymentMethod || '',           // O - Payment Method
      refundData.refundStatus || 'Initiated',   // P - Refund Status
      refundData.processedBy || 'System',       // Q - Processed By
      new Date().toISOString().split('T')[0],   // R - Processed Date
      refundData.commissionAdjusted || 'No',    // S - Commission Adjusted
      refundData.notes || ''                    // T - Notes
    ];
    
    await sheet.appendRow('Refunds', rowData);
    logger.info('Refund logged', { refundId: refundData.refundId });
    
    return true;
  } catch (error) {
    logger.error('Refund log error', { error: error.message });
    throw error;
  }
};

module.exports = { 
  appendFormData,
  addPartnerStore,
  logOrder,
  logAppointment,
  logStockAlert,
  logRefund
};
