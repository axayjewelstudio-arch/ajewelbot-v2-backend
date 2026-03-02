const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'axayjewelstudio@gmail.com',
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send digital file delivery email (B2B)
exports.sendDigitalFileEmail = async (customerEmail, orderData) => {
  try {
    const { customerName, orderNumber, downloadLinks } = orderData;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: `Your Design Files - Order #${orderNumber}`,
      html: `
        <h2>Thank you for your purchase, ${customerName}! 💎</h2>
        <p>Your digital design files are ready for download:</p>
        <ul>
          ${downloadLinks.map(link => `<li><a href="${link.url}">${link.name}</a></li>`).join('')}
        </ul>
        <p><strong>Note:</strong> Download links are valid for 30 days.</p>
        <p>Thank you for doing business with A Jewel Studio!</p>
        <p>Best regards,<br>A Jewel Studio Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    logger.info('Digital file email sent', { orderNumber });
    return true;
    
  } catch (error) {
    logger.error('Send email error', { error: error.message });
    throw error;
  }
};

// Send order confirmation email
exports.sendOrderConfirmationEmail = async (customerEmail, orderData) => {
  try {
    const { customerName, orderNumber, items, total } = orderData;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: `Order Confirmation - #${orderNumber}`,
      html: `
        <h2>Order Confirmed! 🎉</h2>
        <p>Hello ${customerName},</p>
        <p>Thank you for your order!</p>
        <h3>Order #${orderNumber}</h3>
        <p><strong>Items:</strong></p>
        <ul>
          ${items.map(item => `<li>${item.name} x ${item.quantity} - ₹${item.price}</li>`).join('')}
        </ul>
        <p><strong>Total: ₹${total}</strong></p>
        <p>We will contact you shortly with further details.</p>
        <p>Best regards,<br>A Jewel Studio</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    logger.info('Order confirmation email sent', { orderNumber });
    return true;
    
  } catch (error) {
    logger.error('Send email error', { error: error.message });
    throw error;
  }
};
