const axios = require('axios');
const { logger } = require('../utils/logger');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// Send appointment confirmation
exports.sendAppointmentConfirmation = async (customerPhone, appointmentData) => {
  try {
    const { customerName, date, time, service } = appointmentData;
    
    const message = `✅ *Appointment Confirmed*\n\n` +
                   `Hello ${customerName}! 💎\n\n` +
                   `Your appointment has been confirmed:\n\n` +
                   `📅 Date: ${date}\n` +
                   `🕐 Time: ${time}\n` +
                   `💍 Service: ${service}\n\n` +
                   `We look forward to seeing you at A Jewel Studio!\n\n` +
                   `For any changes, please contact us.`;
    
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to: customerPhone,
      type: 'text',
      text: { body: message }
    };
    
    await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    logger.info('Appointment confirmation sent', { customerPhone });
    return true;
    
  } catch (error) {
    logger.error('Send appointment error', { error: error.message });
    throw error;
  }
};

// Send appointment reminder
exports.sendAppointmentReminder = async (customerPhone, appointmentData) => {
  try {
    const { customerName, date, time } = appointmentData;
    
    const message = `🔔 *Appointment Reminder*\n\n` +
                   `Hello ${customerName}!\n\n` +
                   `This is a reminder for your appointment:\n\n` +
                   `📅 Tomorrow at ${time}\n\n` +
                   `See you soon at A Jewel Studio! 💎`;
    
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to: customerPhone,
      type: 'text',
      text: { body: message }
    };
    
    await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    logger.info('Appointment reminder sent', { customerPhone });
    return true;
    
  } catch (error) {
    logger.error('Send reminder error', { error: error.message });
    throw error;
  }
};
