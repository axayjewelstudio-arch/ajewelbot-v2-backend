const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ✅ Send Registration Welcome Email
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
    console.log('✅ Registration email sent to:', customerData.email);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

// ✅ Send Order Confirmation Email
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
          
          <p style="margin-top: 30px;">
            <a href="${orderData.invoiceUrl || '#'}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Download Invoice
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
    console.log('✅ Order confirmation email sent to:', orderData.customerEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

// ✅ Send Order Ready Email
exports.sendOrderReadyEmail = async (orderData) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: orderData.customerEmail,
      subject: `Your Order is Ready for Collection! - #${orderData.orderId} ✨`,
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
          
          <p><strong>Important:</strong> Please carry this email or your WhatsApp confirmation message when you visit the store.</p>
          
          <p style="margin-top: 30px;">
            <a href="${orderData.mapUrl || '#'}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
              View Store on Map
            </a>
            <a href="${orderData.invoiceUrl || '#'}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Download Invoice
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
    console.log('✅ Order ready email sent to:', orderData.customerEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

// ✅ Send Appointment Confirmation Email
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
          
          <p>Our design team looks forward to speaking with you. If you have any reference images or ideas, please share them before your appointment so we can prepare accordingly.</p>
          
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
    console.log('✅ Appointment email sent to:', appointmentData.customerEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

// Test email function
exports.sendTestEmail = async (toEmail) => {
  try {
    const mailOptions = {
      from: `"A Jewel Studio" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Test Email - A Jewel Studio',
      html: '<h1>Email setup successful! ✅</h1><p>Your email service is working correctly.</p>'
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    return { success: false, error: error.message };
  }
};
