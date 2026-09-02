const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title parameter is mandatory'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  department: {
    type: String,
    required: [true, 'Department routing field is mandatory'],
    trim: true,
    default: 'General'
  },
  location: {
    type: String,
    required: [true, 'Job location field is mandatory'],
    trim: true,
    default: 'Accra, Ghana'
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time'
  },
  description: {
    type: String,
    required: [true, 'Job description payload cannot be empty']
  },
  responsibilities: {
    type: String,
    default: ''
  },
  requirements: {
    type: String,
    default: ''
  },
  deadline: {
    type: Date
  },
  isOpen: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

JobSchema.pre('save', async function () {
  if (!this.isModified('title')) return;

  this.slug = `${this.title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
});

module.exports = mongoose.model('Job', JobSchema);
