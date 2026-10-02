const Appointment = require('../models/Appointment');

// Clinic accepts booked appointments Monday (1) through Friday (5); walk-ins are welcome every day
const ALLOWED_APPOINTMENT_DAYS = [1, 2, 3, 4, 5];

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