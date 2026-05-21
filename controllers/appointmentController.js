const Appointment = require('../models/Appointment');


const createAppointment = async (req, res) => {
  try {
    const { subsidiary, date, timeSlot, fullName, email, phone, notes } = req.body;

    // Fast fail guard
    if (!subsidiary || !date || !timeSlot || !fullName || !email || !phone) {
      return res.status(400).json({ message: 'Missing required validation data parameters.' });
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

// @desc    Update appointment status (Admin Controlled)
// @route   PUT /api/appointments/:id
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid operational status parameter.' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
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
  updateAppointmentStatus
};