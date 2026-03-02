const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendRegistrationEmail = async (customerData) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: customerData.email,
      subject: 'Welcome to A Jewel Studio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to A Jewel Studio!</h2>
          <p>Dear ${customerData.firstName} ${customerData.lastName},</p>
          <p>Thank you for registering with A Jewel Studio. We are delighted to have you as part of our family.</p>
          <p><strong>Account Type:</strong> ${customerData.customerType}</p>
          <p><strong>Mobile:</strong> ${customerData.mobile}</p>
          <p>You can now browse our exclusive collection and place orders through WhatsApp.</p>
          <p>If you have any questions, feel free to reach out to us.</p>
          <p>Best regards,<br>A Jewel Studio Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Registration email sent');
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw error;
  }
};

exports.sendOrderConfirmationEmail = async (orderData) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: orderData.customerEmail,
      subject: `Order Confirmation - ${orderData.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmed!</h2>
          <p>Dear ${orderData.customerName},</p>
          <p>Your order has been confirmed and is now in production.</p>
          <p><strong>Order ID:</strong> ${orderData.orderId}</p>
          <p><strong>Product:</strong> ${orderData.productName}</p>
          <p><strong>Amount Paid:</strong> ₹${orderData.amount}</p>
          <p><strong>Expected Ready Date:</strong> ${orderData.readyDate}</p>
          ${orderData.collectionStore ? `<p><strong>Collection Store:</strong> ${orderData.collectionStore.storeName}, ${orderData.collectionStore.city}</p>` : ''}
          <p>We will notify you once your order is ready for collection.</p>
          <p>Best regards,<br>A Jewel Studio Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent');
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw error;
  }
};

exports.sendOrderReadyEmail = async (orderData) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: orderData.customerEmail,
      subject: `Your Order is Ready - ${orderData.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your Order is Ready!</h2>
          <p>Dear ${orderData.customerName},</p>
          <p>Great news! Your order is now ready for collection.</p>
          <p><strong>Order ID:</strong> ${orderData.orderId}</p>
          <p><strong>Product:</strong> ${orderData.productName}</p>
          ${orderData.collectionStore ? `
            <p><strong>Collection Store:</strong></p>
            <p>${orderData.collectionStore.storeName}<br>
            ${orderData.collectionStore.address}<br>
            ${orderData.collectionStore.city}, ${orderData.collectionStore.state} - ${orderData.collectionStore.pincode}<br>
            Phone: ${orderData.collectionStore.phone}</p>
          ` : ''}
          <p>Please visit the store during business hours to collect your order.</p>
          <p>Best regards,<br>A Jewel Studio Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Order ready email sent');
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw error;
  }
};

exports.sendAppointmentEmail = async (appointmentData) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: appointmentData.customerEmail,
      subject: 'Appointment Confirmed - A Jewel Studio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Appointment Confirmed</h2>
          <p>Dear ${appointmentData.customerName},</p>
          <p>Your appointment has been confirmed.</p>
          <p><strong>Date:</strong> ${appointmentData.date}</p>
          <p><strong>Time:</strong> ${appointmentData.time}</p>
          <p><strong>Service:</strong> ${appointmentData.type}</p>
          <p>We look forward to seeing you!</p>
          <p>Best regards,<br>A Jewel Studio Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Appointment email sent');
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw error;
  }
};

exports.sendAppointmentRescheduledEmail = async (appointmentData) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: appointmentData.customerEmail,
      subject: 'Appointment Rescheduled - A Jewel Studio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Appointment Rescheduled</h2>
          <p>Dear ${appointmentData.customerName},</p>
          <p>Your appointment has been rescheduled.</p>
          <p><strong>Previous Date:</strong> ${appointmentData.oldDate} at ${appointmentData.oldTime}</p>
          <p>Our team will contact you shortly to confirm a new date and time.</p>
          <p>We apologize for any inconvenience.</p>
          <p>Best regards,<br>A Jewel Studio Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Reschedule email sent');
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw error;
  }
};

exports.sendBirthdayEmail = async (customerData) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: customerData.email,
      subject: 'Happy Birthday from A Jewel Studio! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Happy Birthday ${customerData.firstName}! 🎉</h2>
          <p>Wishing you a wonderful birthday filled with joy and happiness!</p>
          <p>As a special gift, enjoy <strong>15% OFF</strong> on all products.</p>
          <p><strong>Use code:</strong> BDAY15</p>
          <p>Valid for 7 days.</p>
          <p>Best wishes,<br>A Jewel Studio Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Birthday email sent');
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw error;
  }
};

exports.sendAnniversaryEmail = async (customerData) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: customerData.email,
      subject: 'Happy Anniversary from A Jewel Studio! 💍',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Happy Anniversary ${customerData.firstName}! 💍</h2>
          <p>Wishing you a beautiful anniversary celebration!</p>
          <p>Celebrate with <strong>20% OFF</strong> on all products.</p>
          <p><strong>Use code:</strong> ANNIV20</p>
          <p>Valid for 7 days.</p>
          <p>Best wishes,<br>A Jewel Studio Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Anniversary email sent');
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw error;
  }
};
