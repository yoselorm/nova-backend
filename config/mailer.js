const nodemailer = require('nodemailer');

let transporter = null;

// Lazily built so a missing/blank EMAIL_PASSWORD during local development
// doesn't crash the server on boot — it only fails when someone actually submits the form.
const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  return transporter;
};

// Visitor-typed text is dropped into email HTML, so neutralise any markup first
const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

module.exports = { getTransporter, escapeHtml };
