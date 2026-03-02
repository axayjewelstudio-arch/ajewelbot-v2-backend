const googleSheetsService = require('./googleSheetsService');
const emailService = require('./emailService');

// ✅ Available time slots
const TIME_SLOTS = [
  '10:00 AM',
  '12:00 PM',
  '2:00 PM',
  '4:00 PM'
];

// ✅ Get available dates (next 30 days, excluding Sundays)
exports.getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip Sundays
    if (date.getDay() !== 0) {
      dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
    }
  }
  
  return dates;
};

// ✅ Get available time slots
exports.getAvailableTimeSlots = () => {
  return TIME_SLOTS;
};

// ✅ Book appointment
exports.bookAppointment = async (appointmentData) => {
  try {
    const result = await googleSheetsService.createAppointment({
      customerName: appointmentData.customerName,
      customerEmail: appointmentData.customerEmail,
      customerPhone: appointmentData.customerPhone,
      storeId: appointmentData.storeId || '',
      storeName: appointmentData.storeName || '',
      appointmentDate: appointmentData.date,
      appointmentTime: appointmentData.time,
      serviceType: appointmentData.serviceType || 'Customisation Consultation',
      productCategory: appointmentData.productCategory || '',
      notes: appointmentData.notes || ''
    });
    
    console.log('✅ Appointment booked:', result.appointmentId);
    return {
      success: true,
      appointmentId: result.appointmentId,
      date: appointmentData.date,
      time: appointmentData.time
    };
  } catch (error) {
    console.error('❌ Appointment booking error:', error.message);
    throw error;
  }
};

// ✅ Confirm appointment (by team)
exports.confirmAppointment = async (appointmentId, appointmentData) => {
  try {
    // Send confirmation email
    await emailService.sendAppointmentEmail({
      customerName: appointmentData.customerName,
      customerEmail: appointmentData.customerEmail,
      date: appointmentData.date,
      time: appointmentData.time,
      type: appointmentData.type || 'Customisation Consultation'
    });
    
    console.log('✅ Appointment confirmed:', appointmentId);
    return { success: true };
  } catch (error) {
    console.error('❌ Appointment confirmation error:', error.message);
    throw error;
  }
};

// ✅ Reschedule appointment
exports.rescheduleAppointment = async (appointmentId, oldData, newData) => {
  try {
    // Send reschedule email
    await emailService.sendAppointmentRescheduledEmail({
      customerName: oldData.customerName,
      customerEmail: oldData.customerEmail,
      oldDate: oldData.date,
      oldTime: oldData.time
    });
    
    console.log('✅ Appointment rescheduled:', appointmentId);
    return { success: true };
  } catch (error) {
    console.error('❌ Appointment reschedule error:', error.message);
    throw error;
  }
};
