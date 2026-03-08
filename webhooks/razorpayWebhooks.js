const crypto        = require('crypto');
const axios         = require('axios');
const orderService  = require('../services/orderService');
const { generateInvoice, getInvoice } = require('../services/invoiceService');
const emailService  = require('../services/emailService');

const WHATSAPP_BOT = process.env.WHATSAPP_BOT_URL || 'https://ajewel-whatsapp-bot.onrender.com';
const BACKEND_URL  = process.env.BACKEND_URL       || 'https://ajewelbot-v2-backend.onrender.com';
const RZP_SECRET   = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN WEBHOOK HANDLER  (called from server.js route)
// ─────────────────────────────────────────────────────────────────────────────

exports.handlePaymentWebhook = async (req, res) => {
  try {
    // 1. Verify Razorpay signature
    const signature = req.headers['x-razorpay-signature'] || '';
    const rawBody   = req.rawBody || '';

    if (RZP_SECRET && rawBody) {
      const expected = crypto
        .createHmac('sha256', RZP_SECRET)
        .update(rawBody)
        .digest('hex');

      if (signature !== expected) {
        console.error('❌ Razorpay: invalid signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const paymentData = req.body;
    const eventType   = paymentData.event;
    const payload     = paymentData.payload;
    const payment     = payload?.payment?.entity || payload?.payment || {};

    console.log(`💳 Razorpay webhook: ${eventType}`);

    // 2. Handle payment captured (success)
    if (eventType === 'payment.captured' || payment.status === 'captured') {
      await _handlePaymentCaptured(payment);
    }

    // 3. Handle payment failed (optional)
    if (eventType === 'payment.failed') {
      await _handlePaymentFailed(payment);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Razorpay webhook error:', error.message);
    // Always return 200 to Razorpay to prevent infinite retries
    return res.status(200).json({ received: true });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT SUCCESS HANDLER
// ─────────────────────────────────────────────────────────────────────────────

async function _handlePaymentCaptured(payment) {
  const {
    id:      payment_id,
    amount:  amount_paise,
    contact: raw_phone,
    email:   customer_email,
    method,
    notes = {},
  } = payment;

  const total         = Math.round((amount_paise || 0) / 100);
  const order_ref     = notes.order_ref    || notes.order_id || `AJS-${Date.now()}`;
  const customer_name = notes.customer_name || 'Valued Customer';
  const address       = notes.address      || '';
  const subtotal      = Number(notes.subtotal || total);
  const gst_rate      = Number(notes.gst_rate || 3);
  const items         = notes.items ? _safeParseJSON(notes.items) : [];

  // Clean phone → remove country code prefix for display, keep full for WhatsApp
  const phone_clean = (raw_phone || '').replace(/\D/g, '');
  const phone_wa    = phone_clean.startsWith('91') ? phone_clean : `91${phone_clean}`;

  const payment_method = _detectMethod(method);
  const amount_label   = `₹${total.toLocaleString('en-IN')}`;

  console.log(`✅ Payment captured: ${order_ref} | ${amount_label} | ${phone_clean.slice(-4)}`);

  // ── STEP 1: Confirm order in existing orderService ───────────────────────
  try {
    await orderService.confirmPayment(order_ref, {
      razorpayOrderId:   payment.order_id || '',
      razorpayPaymentId: payment_id,
      razorpaySignature: 'webhook',
      customerPhone:     raw_phone,
      customerName:      customer_name,
      customerEmail:     customer_email,
      amount:            total,
    });
    console.log(`✅ Order confirmed in system: ${order_ref}`);
  } catch (err) {
    console.error(`⚠️ orderService.confirmPayment error (continuing): ${err.message}`);
  }

  // ── STEP 2: Generate PDF Invoice ─────────────────────────────────────────
  let invoice_url = '';
  let invoiceBuffer = null;
  let invoiceFilename = `AJewelStudio_Invoice_${order_ref}.pdf`;

  try {
    const result = await generateInvoice({
      order_ref,
      customer_name,
      customer_phone:   phone_clean,
      customer_email:   customer_email || '',
      customer_address: address,
      items,
      subtotal,
      discount:    0,
      gst_rate,
      total,
      payment_method,
      payment_id,
      invoice_date: new Date().toISOString().slice(0, 10),
    });

    invoice_url     = `${BACKEND_URL}/invoice/${result.token}`;
    invoiceBuffer   = result.buffer;
    invoiceFilename = result.filename;
    console.log(`📄 Invoice generated: ${invoiceFilename} → ${invoice_url}`);
  } catch (err) {
    console.error(`⚠️ Invoice generation error (continuing): ${err.message}`);
  }

  // ── STEP 3: Send Email to Customer ───────────────────────────────────────
  if (customer_email) {
    try {
      await _sendInvoiceEmail({
        to:           customer_email,
        name:         customer_name.split(' ')[0],
        order_ref,
        amount_label,
        invoice_url,
        pdfBuffer:    invoiceBuffer,
        filename:     invoiceFilename,
      });
      console.log(`📧 Invoice email sent → ${customer_email.slice(0, 4)}***`);
    } catch (err) {
      console.error(`⚠️ Invoice email error (continuing): ${err.message}`);
    }
  } else {
    console.warn(`⚠️ No customer email for order ${order_ref}`);
  }

  // ── STEP 4: Send WhatsApp notification + PDF via bot ─────────────────────
  if (phone_wa) {
    try {
      await axios.post(
        `${WHATSAPP_BOT}/notify`,
        {
          phone:          phone_wa,
          event:          'payment_success',
          order_ref,
          name:           customer_name.split(' ')[0],
          amount:         amount_label,
          invoice_url,
          customer_email: customer_email || '',
        },
        { timeout: 12000 }
      );
      console.log(`💬 WhatsApp payment_success sent → ${phone_wa.slice(-4)}`);
    } catch (err) {
      console.error(`⚠️ WhatsApp notify error (continuing): ${err.message}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT FAILED HANDLER
// ─────────────────────────────────────────────────────────────────────────────

async function _handlePaymentFailed(payment) {
  const notes        = payment.notes || {};
  const order_ref    = notes.order_ref || notes.order_id || '';
  const raw_phone    = payment.contact || '';
  const phone_wa     = raw_phone.replace(/\D/g, '');
  const customer_name = notes.customer_name || 'Customer';

  console.log(`❌ Payment failed: ${order_ref}`);

  // Notify customer on WhatsApp
  if (phone_wa) {
    try {
      await axios.post(
        `${WHATSAPP_BOT}/notify`,
        {
          phone:     phone_wa.startsWith('91') ? phone_wa : `91${phone_wa}`,
          event:     'payment_failed',
          order_ref: order_ref || 'your order',
          name:      customer_name.split(' ')[0],
        },
        { timeout: 10000 }
      );
    } catch (err) {
      console.error(`⚠️ WhatsApp failed-notify error: ${err.message}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE DOWNLOAD ROUTE HANDLER  (GET /invoice/:token)
// ─────────────────────────────────────────────────────────────────────────────

exports.serveInvoice = (req, res) => {
  const { token } = req.params;
  const entry = getInvoice(token);

  if (!entry) {
    return res.status(404).json({ error: 'Invoice not found or expired (valid 24h only)' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${entry.filename}"`);
  res.setHeader('Content-Length', entry.buffer.length);
  res.setHeader('Cache-Control', 'private, max-age=86400');
  return res.send(entry.buffer);
};

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL HELPER
// ─────────────────────────────────────────────────────────────────────────────

async function _sendInvoiceEmail({ to, name, order_ref, amount_label, invoice_url, pdfBuffer, filename }) {
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    host:   'smtp.gmail.com',
    port:   587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f9f9f9;margin:0;padding:0}
  .wrap{max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
  .hdr{background:#C9A84C;padding:30px 24px;text-align:center}
  .hdr h1{color:#fff;margin:0;font-size:22px;letter-spacing:2px}
  .hdr p{color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px}
  .body{padding:30px 28px}
  .greeting{font-size:17px;color:#1a1a1a;font-weight:bold}
  .msg{color:#444;font-size:14px;line-height:1.7;margin:14px 0}
  .box{background:#FDF8F0;border:1px solid #C9A84C;border-radius:6px;padding:16px 20px;margin:18px 0}
  .label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px}
  .value{font-size:18px;font-weight:bold;color:#1a1a1a;margin-top:3px}
  .btn{display:inline-block;margin:20px 0;background:#C9A84C;color:#fff!important;text-decoration:none;padding:13px 30px;border-radius:5px;font-size:14px;font-weight:bold}
  .note{font-size:12px;color:#888;line-height:1.8;margin-top:10px}
  .ftr{background:#C9A84C;padding:16px 24px;text-align:center}
  .ftr p{color:rgba(255,255,255,0.9);font-size:12px;margin:0}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <h1>A JEWEL STUDIO</h1>
    <p>Luxury Handcrafted Jewellery</p>
  </div>
  <div class="body">
    <div class="greeting">Hello ${name} 🎉</div>
    <div class="msg">
      Thank you for your payment! Your order has been confirmed and our
      team will begin preparing it shortly.
    </div>
    <div class="box">
      <div class="label">Order Reference</div>
      <div class="value">${order_ref}</div>
      <div class="label" style="margin-top:12px">Amount Paid</div>
      <div class="value">${amount_label}</div>
      <div class="label" style="margin-top:12px">Status</div>
      <div class="value" style="color:#27AE60;font-size:15px">✅ PAID &amp; CONFIRMED</div>
    </div>
    <div class="msg">
      Your invoice is <strong>attached to this email</strong> as a PDF.
      You can also download it using the button below
      <em>(link valid for 24 hours)</em>:
    </div>
    <div style="text-align:center">
      <a class="btn" href="${invoice_url}">📄 Download Invoice</a>
    </div>
    <div class="note">
      📦 &nbsp;We'll notify you on WhatsApp when your order is dispatched<br>
      💬 &nbsp;Questions? WhatsApp us: <a href="https://wa.me/918141356990">wa.me/918141356990</a><br>
      📧 &nbsp;<a href="mailto:ajewelstudio@gmail.com">ajewelstudio@gmail.com</a>
      &nbsp;|&nbsp; 📞 +91 81413 56990
    </div>
  </div>
  <div class="ftr">
    <p>© 2026 A Jewel Studio &nbsp;|&nbsp; This is a system-generated invoice.</p>
  </div>
</div>
</body>
</html>`;

  const mailOptions = {
    from:    process.env.EMAIL_FROM || `A Jewel Studio <${process.env.EMAIL_USER}>`,
    to,
    subject: `✅ Payment Confirmed — Invoice for ${order_ref} | A Jewel Studio`,
    html,
  };

  // Attach PDF only if buffer available
  if (pdfBuffer) {
    mailOptions.attachments = [{
      filename,
      content:     pdfBuffer,
      contentType: 'application/pdf',
    }];
  }

  await transporter.sendMail(mailOptions);
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function _detectMethod(method) {
  const map = {
    upi:        'Razorpay (UPI)',
    card:       'Razorpay (Card)',
    netbanking: 'Razorpay (Net Banking)',
    wallet:     'Razorpay (Wallet)',
    emi:        'Razorpay (EMI)',
  };
  return map[method] || 'Razorpay';
}

function _safeParseJSON(str) {
  try { return JSON.parse(str); } catch { return []; }
}