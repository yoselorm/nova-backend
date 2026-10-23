const nodemailer = require('nodemailer');

let transporter = null;

// Lazily built so a missing/blank EMAIL_PASSWORD during local development
// doesn't crash the server on boot — it only fails when someone actually submits the form.
const getTransporter = () => {
  if (transporter) return transporter;

  // EMAIL_DEBUG=true prints the full SMTP conversation with the mail server (credentials are masked)
  const debug = process.env.EMAIL_DEBUG === 'true';

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    logger: debug,
    debug
  });

  return transporter;
};

// Every outgoing email goes through here so each attempt leaves a trail in the server logs
const sendMail = async (label, options) => {
  const started = Date.now();
  console.log(`[MAIL] ${label}: sending "${options.subject}" from ${options.from} to ${options.to}`);

  try {
    const info = await getTransporter().sendMail(options);
    const elapsed = Date.now() - started;
    console.log(`[MAIL] ${label}: accepted by mail server in ${elapsed}ms — ${info.response}`);
    console.log(`[MAIL] ${label}: accepted=${JSON.stringify(info.accepted)} rejected=${JSON.stringify(info.rejected)} messageId=${info.messageId}`);
    return info;
  } catch (error) {
    const elapsed = Date.now() - started;
    console.error(`[MAIL] ${label}: FAILED after ${elapsed}ms — ${error.code || 'ERROR'}${error.responseCode ? ` ${error.responseCode}` : ''}: ${error.response || error.message}`);
    throw error;
  }
};

// Visitor-typed text is dropped into email HTML, so neutralise any markup first
const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

module.exports = { getTransporter, sendMail, escapeHtml };
