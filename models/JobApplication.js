const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Applicant full legal name is mandatory'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Applicant communication email is mandatory'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Applicant contact phone is mandatory'],
    trim: true
  },
  coverLetter: {
    type: String,
    default: ''
  },
  resume: {
    type: String,
    required: [true, 'Resume asset payload is mandatory']
  },
  resumeName: {
    type: String,
    default: ''
  },
  resumeType: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
