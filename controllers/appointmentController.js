const Appointment = require('../models/Appointment');
const { getTransporter, escapeHtml } = require('../config/mailer');

// Clinic accepts booked appointments Monday (1) through Friday (5); walk-ins are welcome every day
const ALLOWED_APPOINTMENT_DAYS = [1, 2, 3, 4, 5];

const SERVICE_LABELS = {
  wellness: 'Wellness Check',
  gynecology: 'Gynecology Consultation',
  fertility: 'Fertility Consultation',
  surgery: 'Surgery Centre',
  pharmacy: 'Nova Pharmacy'
};

const PATIENT_STATUS_LABELS = {
  new: 'New Patient',
  existing: 'Existing Patient'
};

// Dates arrive as plain YYYY-MM-DD and are stored at UTC midnight, so format in UTC to avoid an off-by-one day
const formatDate = (value) => new Date(value).toLocaleDateString('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
});

// Lets the front desk see new bookings in the shared inbox without opening the admin panel.
// Field order and card layout follow the format the clinic staff asked for.
const notifyClinicOfAppointment = async (appointment) => {
  const receiver = process.env.CONTACT_RECEIVER_EMAIL;
  if (!receiver) return;

  const service = SERVICE_LABELS[appointment.subsidiary] || appointment.subsidiary;
  const preferredDate = formatDate(appointment.date);
  const appointmentLine = `${preferredDate} — ${appointment.timeSlot || 'time to be assigned'}`;

  // [label, plain value, optional link href]
  const rows = [
    ['Full Name', appointment.fullName],
    ['Contact Number', appointment.phone, `tel:${appointment.phone}`],
    ['Date Of Birth', appointment.dateOfBirth ? formatDate(appointment.dateOfBirth) : '—'],
    ['Appointment', appointmentLine],
    ['Service', service],
    ['Email', appointment.email, `mailto:${appointment.email}`],
    ['Address', appointment.address || '—'],
    ['Reason For Appointment', appointment.notes || '—'],
    ['Patient Status', PATIENT_STATUS_LABELS[appointment.patientStatus] || '—']
  ];

  const rowHtml = rows.map(([label, value, href], index) => {
    const safeValue = escapeHtml(value).replace(/\n/g, '<br/>');
    const content = href
      ? `<a href="${escapeHtml(href)}" style="color:#1a56db;">${safeValue}</a>`
      : safeValue;
    const divider = index < rows.length - 1 ? 'border-bottom:1px solid #e5e7eb;' : '';
    return `
      <tr><td style="padding:18px 0;${divider}">
        <div style="font-weight:bold;font-size:14px;color:#111827;margin-bottom:8px;">${label}</div>
        <div style="font-size:14px;line-height:1.6;color:#374151;">${content}</div>
      </td></tr>`;
  }).join('');

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: receiver,
    replyTo: appointment.email,
    subject: `[Nova Booking] ${appointment.fullName} — ${service}, ${preferredDate}`,
    text: [
      `Tracking ID: ${appointment.trackingId}`,
      ...rows.map(([label, value]) => `${label}: ${value}`)
    ].join('\n\n'),
    html: `
      <div style="background:#eceef1;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #d1d5db;">
          <tr><td style="padding:28px 30px 8px;">
            <div style="font-size:12px;color:#6b7280;">New appointment request · ${escapeHtml(appointment.trackingId)}</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowHtml}</table>
          </td></tr>
        </table>
        <p style="max-width:600px;margin:14px auto 0;font-size:12px;color:#6b7280;text-align:center;">
          Assign a time slot and confirm this booking from the admin panel.
        </p>
      </div>
    `
  });
};

const createAppointment = async (req, res) => {
  try {
    const { subsidiary, date, timeSlot, fullName, email, phone, dateOfBirth, address, patientStatus, notes } = req.body;

    // Fast fail guard
    if (!subsidiary || !date || !timeSlot || !fullName || !email || !phone || !dateOfBirth || !address || !notes) {
      return res.status(400).json({ message: 'Missing required validation data parameters.' });
    }

    if (!PATIENT_STATUS_LABELS[patientStatus]) {
      return res.status(400).json({ message: 'Please tell us whether you are a new or existing patient.' });
    }

    const requestedDay = new Date(date).getUTCDay();
    if (!ALLOWED_APPOINTMENT_DAYS.includes(requestedDay)) {
      return res.status(400).json({ message: 'Appointments are only available Monday through Friday.' });
    }

    const appointment = await Appointment.create({
      subsidiary,
      date,
      timeSlot,
      fullName,
      email,
      phone,
      dateOfBirth,
      address,
      patientStatus,
      notes
    });

    // The booking is already saved, so a mail outage shouldn't turn it into an error for the patient
    try {
      await notifyClinicOfAppointment(appointment);
    } catch (mailError) {
      console.error('Appointment email notification failed:', mailError.message);
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server Pipeline Error', error: error.message });
  }
};

// @desc    Get all appointments (Admin Controlled)
// @route   GET /api/appointments
const getAllAppointments = async (req, res) => {
  try {
    // Later we can add sorting/filtering parameters here
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ message: 'Server Pipeline Error', error: error.message });
  }
};

// @desc    Update an appointment's status and/or time slot (Admin Controlled)
//          Patients choose a preferred time when booking; the hospital can
//          move it to another slot here.
// @route   PUT /api/appointments/:id
const updateAppointment = async (req, res) => {
  try {
    const { status, timeSlot } = req.body;
    const updates = {};

    if (status !== undefined) {
      if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid operational status parameter.' });
      }
      updates.status = status;
    }

    if (timeSlot !== undefined) {
      updates.timeSlot = timeSlot;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Nothing to update.' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Target profile log registry entry not found.' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server Pipeline Error', error: error.message });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  updateAppointment
};