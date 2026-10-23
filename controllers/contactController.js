const { sendMail, escapeHtml } = require('../config/mailer');

// @desc    Send a message from the public contact form to the clinic's inbox
// @route   POST /api/contact
const sendContactMessage = async (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({ message: 'Missing required contact form fields.' });
    }

    const receiver = process.env.CONTACT_RECEIVER_EMAIL;
    if (!receiver) {
      return res.status(500).json({ message: 'Contact inbox is not configured yet. Please try again later.' });
    }

    await sendMail('Contact form', {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: receiver,
      replyTo: email,
      subject: `[Nova Website] ${subject || 'New contact form message'}`,
      text: `From: ${fullName} <${email}>\n\n${message}`,
      html: `
        <p><strong>From:</strong> ${escapeHtml(fullName)} (${escapeHtml(email)})</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject || 'New contact form message')}</p>
        <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      `
    });

    res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send your message. Please try again later.', error: error.message });
  }
};

module.exports = { sendContactMessage };
