const Appointment = require('../models/Appointment');
const { getTransporter, escapeHtml } = require('../config/mailer');

// Clinic accepts booked appointments Monday (1) through Friday (5); walk-ins are welcome every day
const ALLOWED_APPOINTMENT_DAYS = [1, 2, 3, 4, 5];

// Lets the front desk see new bookings in the shared inbox without opening the admin panel
const notifyClinicOfAppointment = async (appointment) => {
  const receiver = process.env.CONTACT_RECEIVER_EMAIL;
  if (!receiver) return;

  const preferredDate = new Date(appointment.date).toDateString();
  const rows = [
    ['Tracking ID', appointment.trackingId],
    ['Name', appointment.fullName],
    ['Email', appointment.email],
    ['Phone', appointment.phone],
    ['Service', appointment.subsidiary],
    ['Preferred date', preferredDate],
    ['Notes', appointment.notes || 'None']
  ];

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: receiver,
    replyTo: appointment.email,
    subject: `[Nova Booking] ${appointment.fullName} — ${appointment.subsidiary}, ${preferredDate}`,
    text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
    html: `
      <p>A new appointment request was submitted on the website.</p>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows.map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${escapeHtml(value).replace(/\n/g, '<br/>')}</td></tr>`).join('')}
      </table>
      <p>Assign a time slot and confirm it from the admin panel.</p>
    `
  });
};

const createAppointment = async (req, res) => {
  try {
    const { subsidiary, date, timeSlot, fullName, email, phone, notes } = req.body;

    // Fast fail guard
    if (!subsidiary || !date || !fullName || !email || !phone) {
      return res.status(400).json({ message: 'Missing required validation data parameters.' });
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
//          The public booking form no longer collects a time — the hospital
//          assigns it here once the request comes in.
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