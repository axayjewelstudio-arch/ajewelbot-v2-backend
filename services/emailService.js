const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ✅ Registration Welcome Email
exports.sendRegistrationEmail = async (customerData) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: customerData.email,
      subject: 'Welcome to A Jewel Studio! 💎',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to A Jewel Studio, ${customerData.firstName}!</h2>
          <p>Thank you for registering with us. We are delighted to have you as part of our family.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Account Details:</h3>
            <p><strong>Name:</strong> ${customerData.firstName} ${customerData.lastName}</p>
            <p><strong>Email:</strong> ${customerData.email}</p>
            <p><strong>Mobile:</strong> ${customerData.mobile}</p>
            <p><strong>Account Type:</strong> ${customerData.customerType || 'Retail'}</p>
          </div>
          <p>You can now browse our exclusive collections and place orders directly via WhatsApp.</p>
          <p style="margin-top: 30px;">
            <a href="https://wa.me/918141356990" style="background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Shopping on WhatsApp
            </a>
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            A Jewel Studio<br>
            Email: ajewelstudio@google.com<br>
            WhatsApp: +91 81413 56990
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Registration email sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

// ✅ Order Confirmation Email
exports.sendOrderConfirmationEmail = async (orderData) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: orderData.customerEmail,
      subject: `Order Confirmed - #${orderData.orderId} 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your Order is Confirmed!</h2>
          <p>Dear ${orderData.customerName},</p>
          <p>Thank you for your order. Your payment has been received successfully.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details:</h3>
            <p><strong>Order ID:</strong> #${orderData.orderId}</p>
            <p><strong>Item:</strong> ${orderData.productName}</p>
            <p><strong>Amount Paid:</strong> ₹${orderData.amount}</p>
            <p><strong>Expected Ready Date:</strong> ${orderData.readyDate}</p>
            ${orderData.collectionStore ? `
              <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
              <h4>Collection Store:</h4>
              <p><strong>${orderData.collectionStore.name}</strong><br>
              ${orderData.collectionStore.address}<br>
              Contact: ${orderData.collectionStore.contact}</p>
            ` : ''}
          </div>
          <p>You will receive a notification once your order is ready for collection.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            A Jewel Studio<br>
            Email: ajewelstudio@google.com<br>
            WhatsApp: +91 81413 56990
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

// ✅ Order Ready Email
exports.sendOrderReadyEmail = async (orderData) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: orderData.customerEmail,
      subject: `Your Order is Ready! - #${orderData.orderId} ✨`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Good News! Your Order is Ready 🎉</h2>
          <p>Dear ${orderData.customerName},</p>
          <p>Your order is now ready for collection at your nearest A Jewel Studio partner store.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details:</h3>
            <p><strong>Order ID:</strong> #${orderData.orderId}</p>
            <p><strong>Item:</strong> ${orderData.productName}</p>
            <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
            <h4>Collection Store:</h4>
            <p><strong>${orderData.collectionStore.name}</strong><br>
            ${orderData.collectionStore.address}<br>
            Contact: ${orderData.collectionStore.contact}</p>
          </div>
          <p><strong>Important:</strong> Please carry this email when you visit the store.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            A Jewel Studio<br>
            Email: ajewelstudio@google.com<br>
            WhatsApp: +91 81413 56990
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Order ready email sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

// ✅ Appointment Confirmation Email
exports.sendAppointmentEmail = async (appointmentData) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: appointmentData.customerEmail,
      subject: 'Appointment Confirmed - A Jewel Studio 📅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your Appointment is Confirmed!</h2>
          <p>Dear ${appointmentData.customerName},</p>
          <p>Your appointment with our design team has been confirmed.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Appointment Details:</h3>
            <p><strong>Date:</strong> ${appointmentData.date}</p>
            <p><strong>Time:</strong> ${appointmentData.time}</p>
            <p><strong>Type:</strong> ${appointmentData.type}</p>
          </div>
          <p>Our design team looks forward to speaking with you.</p>
          <p><strong>Note:</strong> Should you need to reschedule, please inform us at least 24 hours in advance.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            A Jewel Studio<br>
            Email: ajewelstudio@google.com<br>
            WhatsApp: +91 81413 56990
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Appointment email sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

// ✅ Appointment Rescheduled Email
exports.sendAppointmentRescheduledEmail = async (appointmentData) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: appointmentData.customerEmail,
      subject: 'Appointment Rescheduled - A Jewel Studio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b6b;">Appointment Rescheduled</h2>
          <p>Dear ${appointmentData.customerName},</p>
          <p>We regret to inform you that your appointment scheduled for <strong>${appointmentData.oldDate}</strong> at <strong>${appointmentData.oldTime}</strong> requires rescheduling due to unavoidable circumstances.</p>
          <p>We sincerely apologise for the inconvenience.</p>
          <p>Please reply to this email or contact us on WhatsApp to select a new preferred time.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            A Jewel Studio<br>
            Email: ajewelstudio@google.com<br>
            WhatsApp: +91 81413 56990
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Reschedule email sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

// ✅ Stock Alert Email
exports.sendStockAlertEmail = async (customerEmail, productName) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `${productName} is Back in Stock! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Good News!</h2>
          <p><strong>${productName}</strong> is now back in stock!</p>
          <p>Order now before it's gone again.</p>
          <p style="margin-top: 30px;">
            <a href="https://wa.me/918141356990" style="background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Order on WhatsApp
            </a>
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            A Jewel Studio<br>
            Email: ajewelstudio@google.com
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Stock alert email sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};
