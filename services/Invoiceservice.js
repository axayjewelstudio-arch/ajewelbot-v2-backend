/**
 * invoiceService.js
 * A Jewel Studio — PDF Invoice Generator
 * Place in: ajewelbot-v2-backend/services/invoiceService.js
 *
 * Generates a professional PDF invoice using pdfkit.
 * Stores PDF buffer in memory (Map) with a UUID token.
 * Exposes: generateInvoice(orderData) → { token, buffer, filename }
 *
 * Install: npm install pdfkit uuid
 */

const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');

// In-memory store: token → { buffer, filename, createdAt }
// Invoices auto-expire after 24 hours (cleaned up on next access)
const invoiceStore = new Map();
const INVOICE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Colours (RGB)
const GOLD   = [201, 168, 76];
const DARK   = [26, 26, 26];
const GREY   = [100, 100, 100];
const LGREY  = [240, 240, 240];
const WHITE  = [255, 255, 255];
const GREEN  = [39, 174, 96];

/**
 * Generate a PDF invoice and store it in memory.
 * @param {Object} orderData
 * @param {string} orderData.order_ref       e.g. "AJS-6655-1709812345"
 * @param {string} orderData.customer_name   e.g. "Priya Shah"
 * @param {string} orderData.customer_phone  e.g. "917600056655"
 * @param {string} orderData.customer_email  e.g. "priya@gmail.com"
 * @param {string} orderData.customer_address e.g. "45, Park Street, Ahmedabad 380006"
 * @param {Array}  orderData.items           [{ name, qty, price }]
 * @param {number} orderData.subtotal        e.g. 2250
 * @param {number} orderData.discount        e.g. 0
 * @param {number} orderData.gst_rate        e.g. 3 (percent, default 3%)
 * @param {number} orderData.total           e.g. 2317
 * @param {string} orderData.payment_method  e.g. "Razorpay (UPI)"
 * @param {string} orderData.payment_id      e.g. "pay_OAqvZnxgBWWHVF"
 * @param {string} orderData.invoice_date    e.g. "2026-03-08" (auto if not provided)
 * @returns {{ token: string, buffer: Buffer, filename: string }}
 */
async function generateInvoice(orderData) {
  const {
    order_ref      = 'AJS-XXXX',
    customer_name  = 'Valued Customer',
    customer_phone = '',
    customer_email = '',
    customer_address = '',
    items          = [],
    subtotal       = 0,
    discount       = 0,
    gst_rate       = 3,
    total          = 0,
    payment_method = 'Online Payment',
    payment_id     = '',
    invoice_date   = new Date().toISOString().slice(0, 10),
  } = orderData;

  // Clean up expired invoices
  _cleanExpired();

  return new Promise((resolve, reject) => {
    try {
      const doc    = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data',  chunk => chunks.push(chunk));
      doc.on('end',   () => {
        const buffer  = Buffer.concat(chunks);
        const token   = uuidv4();
        const filename = `AJewelStudio_Invoice_${order_ref}.pdf`;

        invoiceStore.set(token, {
          buffer,
          filename,
          createdAt: Date.now(),
        });

        resolve({ token, buffer, filename });
      });
      doc.on('error', reject);

      const PW = doc.page.width;  // 595
      const M  = 50;              // margin

      // ── HEADER ─────────────────────────────────────────────────────────
      // Gold banner
      doc.rect(0, 0, PW, 90).fill(_rgb(GOLD));

      // Brand name
      doc.font('Helvetica-Bold')
         .fontSize(22)
         .fillColor(_rgb(WHITE))
         .text('A JEWEL STUDIO', M, 24, { width: PW - M * 2 });

      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(_rgb(WHITE))
         .text('Luxury Handcrafted Jewellery  |  ajewelstudio.com', M, 52);

      doc.font('Helvetica')
         .fontSize(8)
         .fillColor(_rgb(WHITE))
         .text(`+91 81413 56990  |  ajewelstudio@gmail.com`, M, 64);

      // TAX INVOICE label (right side)
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .fillColor(_rgb(WHITE))
         .text('TAX INVOICE', PW - M - 100, 30, { width: 100, align: 'right' });

      doc.font('Helvetica')
         .fontSize(8)
         .fillColor(_rgb(WHITE))
         .text(`Date: ${_fmtDate(invoice_date)}`, PW - M - 100, 48, { width: 100, align: 'right' });

      doc.font('Helvetica')
         .fontSize(8)
         .fillColor(_rgb(WHITE))
         .text(`Order: ${order_ref}`, PW - M - 100, 60, { width: 100, align: 'right' });

      // ── BILLED TO & PAYMENT INFO ────────────────────────────────────────
      let Y = 110;

      // Left block: Bill To
      doc.font('Helvetica-Bold').fontSize(9).fillColor(_rgb(GOLD))
         .text('BILLED TO', M, Y);

      doc.font('Helvetica-Bold').fontSize(10).fillColor(_rgb(DARK))
         .text(customer_name, M, Y + 14);

      doc.font('Helvetica').fontSize(8.5).fillColor(_rgb(GREY));
      let yOff = Y + 28;
      if (customer_phone) { doc.text(`📱 ${_fmtPhone(customer_phone)}`, M, yOff); yOff += 13; }
      if (customer_email) { doc.text(`✉  ${customer_email}`, M, yOff); yOff += 13; }
      if (customer_address) {
        doc.text(`📍 ${customer_address}`, M, yOff, { width: 220 });
        yOff += 26;
      }

      // Right block: Payment Info
      const RX = PW / 2 + 10;
      doc.font('Helvetica-Bold').fontSize(9).fillColor(_rgb(GOLD))
         .text('PAYMENT DETAILS', RX, Y);

      const payRows = [
        ['Method',     payment_method],
        ['Payment ID', payment_id || '—'],
        ['Status',     '✅ PAID'],
      ];
      payRows.forEach(([label, val], i) => {
        doc.font('Helvetica-Bold').fontSize(8).fillColor(_rgb(GREY))
           .text(label + ':', RX, Y + 14 + i * 14, { width: 80 });
        doc.font('Helvetica').fontSize(8).fillColor(_rgb(DARK))
           .text(val, RX + 85, Y + 14 + i * 14, { width: 160 });
      });

      // ── DIVIDER ─────────────────────────────────────────────────────────
      Y = Math.max(yOff, Y + 80) + 10;
      doc.moveTo(M, Y).lineTo(PW - M, Y).strokeColor(_rgb(GOLD)).lineWidth(1).stroke();
      Y += 10;

      // ── ITEMS TABLE ─────────────────────────────────────────────────────
      // Header
      const cols = { sr: M, desc: M + 28, qty: PW - 180, rate: PW - 140, amt: PW - 80 };
      doc.rect(M, Y, PW - M * 2, 18).fill(_rgb(GOLD));

      doc.font('Helvetica-Bold').fontSize(8).fillColor(_rgb(WHITE));
      doc.text('#',         cols.sr,   Y + 4, { width: 20 });
      doc.text('Description', cols.desc, Y + 4, { width: 200 });
      doc.text('Qty',       cols.qty,  Y + 4, { width: 35, align: 'center' });
      doc.text('Rate (₹)',  cols.rate, Y + 4, { width: 55, align: 'right' });
      doc.text('Amt (₹)',   cols.amt,  Y + 4, { width: 55, align: 'right' });

      Y += 18;

      // Rows
      const displayItems = items.length > 0 ? items : [
        { name: 'Jewellery Item', qty: 1, price: subtotal }
      ];

      displayItems.forEach((item, idx) => {
        const bg = idx % 2 === 0 ? WHITE : LGREY;
        doc.rect(M, Y, PW - M * 2, 18).fill(_rgb(bg));

        doc.font('Helvetica').fontSize(8).fillColor(_rgb(DARK));
        doc.text(String(idx + 1), cols.sr,  Y + 4, { width: 20 });
        doc.text(item.name || 'Item', cols.desc, Y + 4, { width: 200 });
        doc.text(String(item.qty || 1), cols.qty, Y + 4, { width: 35, align: 'center' });
        doc.text(_fmt(item.price || 0), cols.rate, Y + 4, { width: 55, align: 'right' });
        doc.text(_fmt((item.price || 0) * (item.qty || 1)), cols.amt, Y + 4, { width: 55, align: 'right' });

        Y += 18;
      });

      // Bottom border of table
      doc.moveTo(M, Y).lineTo(PW - M, Y).strokeColor(_rgb(GOLD)).lineWidth(0.5).stroke();
      Y += 12;

      // ── TOTALS ──────────────────────────────────────────────────────────
      const TX = PW - M - 200;
      const totals = [
        ['Subtotal', subtotal],
        discount > 0 ? ['Discount', -discount] : null,
        [`GST @ ${gst_rate}%`, Math.round((subtotal - discount) * gst_rate / 100)],
      ].filter(Boolean);

      totals.forEach(([label, val]) => {
        doc.font('Helvetica').fontSize(9).fillColor(_rgb(GREY))
           .text(label + ':', TX, Y, { width: 100, align: 'right' });
        doc.font('Helvetica').fontSize(9).fillColor(_rgb(DARK))
           .text((val < 0 ? '- ' : '') + '₹' + _fmt(Math.abs(val)), TX + 105, Y, { width: 85, align: 'right' });
        Y += 16;
      });

      // Total box
      Y += 4;
      doc.rect(TX, Y, 190, 24).fill(_rgb(GOLD));
      doc.font('Helvetica-Bold').fontSize(11).fillColor(_rgb(WHITE))
         .text('TOTAL', TX, Y + 6, { width: 95, align: 'right' });
      doc.font('Helvetica-Bold').fontSize(11).fillColor(_rgb(WHITE))
         .text(`₹${_fmt(total)}`, TX + 100, Y + 6, { width: 85, align: 'right' });

      Y += 36;

      // ── AMOUNT IN WORDS ─────────────────────────────────────────────────
      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(_rgb(GREY))
         .text(`Amount in words: ${_inWords(total)} Rupees Only`, M, Y);
      Y += 20;

      // ── TERMS ──────────────────────────────────────────────────────────
      doc.moveTo(M, Y).lineTo(PW - M, Y).strokeColor(_rgb(LGREY)).lineWidth(0.5).stroke();
      Y += 10;

      doc.font('Helvetica-Bold').fontSize(8).fillColor(_rgb(GOLD)).text('Terms & Conditions', M, Y);
      Y += 12;

      const terms = [
        '• All jewellery is handcrafted. Minor variations in appearance are natural and not defects.',
        '• Returns accepted within 7 days of delivery in original condition. Custom orders are non-refundable.',
        '• This is a computer-generated invoice and does not require a physical signature.',
        '• For queries: ajewelstudio@gmail.com  |  +91 81413 56990  |  wa.me/918141356990',
      ];
      doc.font('Helvetica').fontSize(7.5).fillColor(_rgb(GREY));
      terms.forEach(t => { doc.text(t, M, Y, { width: PW - M * 2 }); Y += 12; });

      // ── FOOTER ─────────────────────────────────────────────────────────
      const FY = doc.page.height - 40;
      doc.rect(0, FY, PW, 40).fill(_rgb(GOLD));
      doc.font('Helvetica').fontSize(8).fillColor(_rgb(WHITE))
         .text('Thank you for shopping with A Jewel Studio 💛  |  ajewelstudio.com', M, FY + 8, {
           width: PW - M * 2, align: 'center'
         });
      doc.font('Helvetica').fontSize(7).fillColor(_rgb(WHITE))
         .text('This invoice was generated automatically. Keep it for your records.', M, FY + 22, {
           width: PW - M * 2, align: 'center'
         });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Retrieve a stored invoice by token.
 * Returns { buffer, filename } or null if not found / expired.
 */
function getInvoice(token) {
  const entry = invoiceStore.get(token);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > INVOICE_TTL_MS) {
    invoiceStore.delete(token);
    return null;
  }
  return { buffer: entry.buffer, filename: entry.filename };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function _rgb([r, g, b]) { return { r, g, b }; }

function _fmt(n) {
  return Number(n).toLocaleString('en-IN');
}

function _fmtPhone(p) {
  const s = p.replace(/^\+?91/, '').replace(/\D/g, '');
  return s.length === 10 ? `+91 ${s.slice(0, 5)} ${s.slice(5)}` : p;
}

function _fmtDate(d) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return d; }
}

function _cleanExpired() {
  const now = Date.now();
  for (const [k, v] of invoiceStore.entries()) {
    if (now - v.createdAt > INVOICE_TTL_MS) invoiceStore.delete(k);
  }
}

// Very basic number-to-words for Indian amounts
function _inWords(n) {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
                 'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
                 'Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

  function hw(num) {
    if (num === 0) return '';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' ' + ones[num%10] : '');
    return ones[Math.floor(num/100)] + ' Hundred' + (num%100 ? ' ' + hw(num%100) : '');
  }

  if (n === 0) return 'Zero';
  let result = '';
  const cr  = Math.floor(n / 10000000); n %= 10000000;
  const lac = Math.floor(n / 100000);   n %= 100000;
  const th  = Math.floor(n / 1000);     n %= 1000;

  if (cr)  result += hw(cr) + ' Crore ';
  if (lac) result += hw(lac) + ' Lakh ';
  if (th)  result += hw(th) + ' Thousand ';
  if (n)   result += hw(n);
  return result.trim();
}

module.exports = { generateInvoice, getInvoice };