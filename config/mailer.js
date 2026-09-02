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

module.exports = { getTransporter };
