const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  subsidiary: {
    type: String,
    required: [true, 'Subsidiary routing field is mandatory'],
    enum: ['surgery', 'fertility', 'pharmacy', 'wellness', 'gynecology']
  },
  date: {
    type: Date,
    required: [true, 'Preferred schedule date field is mandatory']
  },
  timeSlot: {
    type: String,
    default: ''
  },
  fullName: {
    type: String,
    required: [true, 'Patient full legal name is mandatory'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Patient communication email is mandatory'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Contact phone matrix string is mandatory'],
    trim: true
  },
  // Older bookings predate these patient-profile fields, so they're enforced in the controller instead of here
  dateOfBirth: {
    type: Date
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  patientStatus: {
    type: String,
    enum: ['new', 'existing', ''],
    default: ''
  },
  // Shown to patients and staff as "Reason for appointment"
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  trackingId: {
    type: String,
    unique: true,
    default: () => `NVH-${Math.floor(100000 + Math.random() * 900000)}`
  }
}, {
  timestamps: true // Automatically appends createdAt and updatedAt logs
});

module.exports = mongoose.model('Appointment', AppointmentSchema);