const appointmentService = require('../services/appointmentService');

// ✅ Get available dates
exports.getAvailableDates = async (req, res) => {
  try {
    const dates = appointmentService.getAvailableDates();
    
    res.json({
      success: true,
      dates: dates
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get available time slots
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const slots = appointmentService.getAvailableTimeSlots();
    
    res.json({
      success: true,
      timeSlots: slots
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Book appointment
exports.bookAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    
    const result = await appointmentService.bookAppointment(appointmentData);
    
    res.json({
      success: true,
      appointmentId: result.appointmentId,
      date: result.date,
      time: result.time,
      message: 'Appointment request received. Our team will confirm shortly.'
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Confirm appointment
exports.confirmAppointment = async (req, res) => {
  try {
    const { appointmentId, appointmentData } = req.body;
    
    await appointmentService.confirmAppointment(appointmentId, appointmentData);
    
    res.json({
      success: true,
      message: 'Appointment confirmed and notification sent'
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId, oldData, newData } = req.body;
    
    await appointmentService.rescheduleAppointment(appointmentId, oldData, newData);
    
    res.json({
      success: true,
      message: 'Reschedule notification sent'
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
