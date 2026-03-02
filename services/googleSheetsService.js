const { google } = require('googleapis');

const SPREADSHEET_ID = '1w-4Zi65AqsQZFJIr1GLrDrW9BJNez8Wtr-dTL8oBLbs';

const getGoogleSheetsAuth = () => {
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
};

const getSheets = async () => {
  const auth = getGoogleSheetsAuth();
  return google.sheets({ version: 'v4', auth });
};

// ═══════════════════════════════════════════════════════════
// REGISTRATIONS SHEET (Existing - Updated)
// ═══════════════════════════════════════════════════════════

const findRowByWhatsApp = async (whatsappNumber) => {
  try {
    const sheets = await getSheets();
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Registrations!A:A'
    });
    
    const rows = result.data.values || [];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === whatsappNumber) {
        return i + 1;
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error finding row:', error.message);
    return null;
  }
};

const updateExistingRow = async (rowNumber, formData) => {
  try {
    const sheets = await getSheets();
    const rowData = [
      formData.gender || '',
      formData.mobile || '',
      formData.whatsapp || formData.mobile || '',
      formData.dob || '',
      formData.anniversary || '',
      formData.ageGroup || '',
      formData.sourceOfReferral || '',
      formData.houseNo || '',
      formData.building || '',
      formData.street || '',
      formData.area || '',
      formData.country || 'IN',
      formData.state || '',
      formData.city || '',
      formData.pincode || '',
      formData.landmark || '',
      formData.delHouseNo || '',
      formData.delBuilding || '',
      formData.delStreet || '',
      formData.delArea || '',
      formData.delCountry || '',
      formData.delCity || '',
      formData.delPincode || '',
      formData.delLandmark || '',
      formData.customerType || 'Retail',
      formData.businessName || '',
      formData.businessCategory || '',
      formData.businessMobile || '',
      formData.businessEmail || '',
      formData.businessAddress || '',
      formData.businessArea || '',
      formData.businessCity || '',
      formData.businessState || '',
      formData.businessPincode || '',
      formData.gstNumber || '',
      formData.consentMarketing || 'no',
      formData.consentWhatsApp || 'no',
      formData.consentTerms || 'no',
      formData.referralCode || '',
      `${formData.firstName || ''} ${formData.lastName || ''} - ${formData.mobile || ''}`.trim()
    ];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Registrations!B${rowNumber}:AO${rowNumber}`,
      valueInputOption: 'RAW',
      resource: { values: [rowData] }
    });
    
    console.log(`✅ Updated row ${rowNumber}`);
    return { success: true, rowNumber, action: 'updated' };
  } catch (error) {
    console.error('❌ Error updating row:', error.message);
    throw error;
  }
};

const createNewRow = async (formData) => {
  try {
    const sheets = await getSheets();
    const rowData = [
      formData.whatsapp || formData.mobile || '',
      formData.gender || '',
      formData.mobile || '',
      formData.whatsapp || formData.mobile || '',
      formData.dob || '',
      formData.anniversary || '',
      formData.ageGroup || '',
      formData.sourceOfReferral || '',
      formData.houseNo || '',
      formData.building || '',
      formData.street || '',
      formData.area || '',
      formData.country || 'IN',
      formData.state || '',
      formData.city || '',
      formData.pincode || '',
      formData.landmark || '',
      formData.delHouseNo || '',
      formData.delBuilding || '',
      formData.delStreet || '',
      formData.delArea || '',
      formData.delCountry || '',
      formData.delCity || '',
      formData.delPincode || '',
      formData.delLandmark || '',
      formData.customerType || 'Retail',
      formData.businessName || '',
      formData.businessCategory || '',
      formData.businessMobile || '',
      formData.businessEmail || '',
      formData.businessAddress || '',
      formData.businessArea || '',
      formData.businessCity || '',
      formData.businessState || '',
      formData.businessPincode || '',
      formData.gstNumber || '',
      formData.consentMarketing || 'no',
      formData.consentWhatsApp || 'no',
      formData.consentTerms || 'no',
      formData.referralCode || '',
      `${formData.firstName || ''} ${formData.lastName || ''} - ${formData.mobile || ''}`.trim()
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Registrations!A:AO',
      valueInputOption: 'RAW',
      resource: { values: [rowData] }
    });
    
    console.log('✅ Created new row');
    return { success: true, action: 'created' };
  } catch (error) {
    console.error('❌ Error creating row:', error.message);
    throw error;
  }
};

exports.appendFormData = async (formData) => {
  try {
    const whatsappNumber = formData.whatsapp || formData.mobile;
    if (!whatsappNumber) {
      throw new Error('WhatsApp or Mobile number required');
    }
    
    console.log(`🔍 Checking for WhatsApp number: ${whatsappNumber}`);
    const rowNumber = await findRowByWhatsApp(whatsappNumber);
    
    if (rowNumber) {
      console.log(`✅ Match found at row ${rowNumber} - Updating...`);
      return await updateExistingRow(rowNumber, formData);
    } else {
      console.log('❌ No match found - Creating new row...');
      return await createNewRow(formData);
    }
  } catch (error) {
    console.error('❌ Google Sheets error:', error.message);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════
// ORDERS SHEET (NEW)
// ═══════════════════════════════════════════════════════════

exports.createOrder = async (orderData) => {
  try {
    const sheets = await getSheets();
    const row = [
      orderData.orderId || '',
      orderData.shopifyOrderId || '',
      new Date().toISOString(),
      orderData.storeId || '',
      orderData.storeName || '',
      orderData.customerName || '',
      orderData.customerEmail || '',
      orderData.customerPhone || '',
      orderData.productSKU || '',
      orderData.productName || '',
      orderData.quantity || 1,
      orderData.unitPrice || 0,
      orderData.totalAmount || 0,
      orderData.commissionAmount || 0,
      orderData.paymentStatus || 'Pending',
      orderData.fulfillmentStatus || 'Pending',
      orderData.trackingNumber || '',
      orderData.deliveryDate || '',
      orderData.notes || ''
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A:S',
      valueInputOption: 'RAW',
      resource: { values: [row] }
    });
    
    console.log('✅ Order created in sheet');
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating order:', error.message);
    throw error;
  }
};

exports.updateOrderStatus = async (orderId, status, fulfillmentStatus) => {
  try {
    const sheets = await getSheets();
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A:A'
    });
    
    const rows = result.data.values || [];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === orderId) {
        const rowNumber = i + 1;
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Orders!O${rowNumber}:P${rowNumber}`,
          valueInputOption: 'RAW',
          resource: { values: [[status, fulfillmentStatus]] }
        });
        console.log(`✅ Order ${orderId} status updated`);
        return { success: true };
      }
    }
    return { success: false, message: 'Order not found' };
  } catch (error) {
    console.error('❌ Error updating order:', error.message);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════
// APPOINTMENTS SHEET (NEW)
// ═══════════════════════════════════════════════════════════

exports.createAppointment = async (appointmentData) => {
  try {
    const sheets = await getSheets();
    const appointmentId = `APT${Date.now()}`;
    const row = [
      appointmentId,
      appointmentData.customerName || '',
      appointmentData.customerEmail || '',
      appointmentData.customerPhone || '',
      appointmentData.storeId || '',
      appointmentData.storeName || '',
      appointmentData.appointmentDate || '',
      appointmentData.appointmentTime || '',
      appointmentData.serviceType || 'Consultation',
      appointmentData.productCategory || '',
      'Scheduled',
      appointmentData.assignedStaff || '',
      appointmentData.notes || '',
      'No',
      '',
      new Date().toISOString(),
      'No',
      'No'
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Appointments!A:R',
      valueInputOption: 'RAW',
      resource: { values: [row] }
    });
    
    console.log('✅ Appointment created');
    return { success: true, appointmentId };
  } catch (error) {
    console.error('❌ Error creating appointment:', error.message);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════
// PARTNER STORES SHEET (NEW)
// ═══════════════════════════════════════════════════════════

exports.getPartnerStoreByCity = async (city) => {
  try {
    const sheets = await getSheets();
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Partner Stores!A:R'
    });
    
    const rows = result.data.values || [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][6]?.toLowerCase() === city.toLowerCase() && rows[i][11] === 'Active') {
        return {
          storeId: rows[i][0],
          storeName: rows[i][1],
          ownerName: rows[i][2],
          email: rows[i][3],
          phone: rows[i][4],
          address: rows[i][5],
          city: rows[i][6],
          state: rows[i][7],
          pincode: rows[i][8]
        };
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching partner store:', error.message);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// STOCK ALERTS SHEET (NEW)
// ═══════════════════════════════════════════════════════════

exports.createStockAlert = async (alertData) => {
  try {
    const sheets = await getSheets();
    const alertId = `ALERT${Date.now()}`;
    const row = [
      alertId,
      alertData.productSKU || '',
      alertData.productName || '',
      alertData.category || '',
      alertData.currentStock || 0,
      alertData.minimumStockLevel || 0,
      alertData.storeId || '',
      alertData.storeName || '',
      new Date().toISOString(),
      alertData.alertType || 'Low Stock',
      alertData.reorderQuantity || 0,
      alertData.supplierName || '',
      alertData.supplierContact || '',
      alertData.expectedRestockDate || '',
      'Pending',
      alertData.priority || 'Medium',
      alertData.notes || '',
      new Date().toISOString()
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Stock Alerts!A:R',
      valueInputOption: 'RAW',
      resource: { values: [row] }
    });
    
    console.log('✅ Stock alert created');
    return { success: true, alertId };
  } catch (error) {
    console.error('❌ Error creating stock alert:', error.message);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════
// REFUNDS SHEET (NEW)
// ═══════════════════════════════════════════════════════════

exports.createRefund = async (refundData) => {
  try {
    const sheets = await getSheets();
    const refundId = `REF${Date.now()}`;
    const row = [
      refundId,
      refundData.orderId || '',
      refundData.shopifyOrderId || '',
      new Date().toISOString(),
      refundData.storeId || '',
      refundData.storeName || '',
      refundData.customerName || '',
      refundData.customerEmail || '',
      refundData.productSKU || '',
      refundData.productName || '',
      refundData.originalAmount || 0,
      refundData.refundAmount || 0,
      refundData.refundReason || '',
      refundData.refundType || 'Full',
      refundData.paymentMethod || '',
      'Initiated',
      refundData.processedBy || '',
      '',
      'No',
      refundData.notes || ''
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Refunds!A:T',
      valueInputOption: 'RAW',
      resource: { values: [row] }
    });
    
    console.log('✅ Refund created');
    return { success: true, refundId };
  } catch (error) {
    console.error('❌ Error creating refund:', error.message);
    throw error;
  }
};
