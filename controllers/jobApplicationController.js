const mongoose = require('mongoose');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const { exceedsMaxMediaSize } = require('../utils/mediaValidation');

// @desc    Submit an application to a job posting (Public)
// @route   POST /api/jobs/:id/apply
const applyToJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, coverLetter, resume, resumeName, resumeType } = req.body;

    if (!fullName || !email || !phone || !resume) {
      return res.status(400).json({ message: 'Missing required application data parameters.' });
    }

    if (exceedsMaxMediaSize(resume)) {
      return res.status(400).json({ message: 'Resume asset payload exceeds maximum allowed size of 5MB.' });
    }

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const job = await Job.findOne(query);

    if (!job) {
      return res.status(404).json({ message: 'Target job posting registry entry not found.' });
    }

    if (!job.isOpen) {
      return res.status(400).json({ message: 'This position is no longer accepting applications.' });
    }

    const application = await JobApplication.create({
      job: job._id,
      fullName,
      email,
      phone,
      coverLetter,
      resume,
      resumeName,
      resumeType
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ message: 'Application Submission Crash Layer', error: error.message });
  }
};

// @desc    Get all applicants for a specific job (Admin Protected)
// @route   GET /api/jobs/:id/applications
const getApplicationsForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const job = await Job.findOne(query);

    if (!job) {
      return res.status(404).json({ message: 'Target job posting registry entry not found.' });
    }

    const applications = await JobApplication.find({ job: job._id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, job, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ message: 'Applicant Registry Fetch Error', error: error.message });
  }
};

// @desc    Get every application across every job posting (Admin Protected)
// @route   GET /api/applications
const getAllApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find().populate('job', 'title department location isOpen').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ message: 'Applicant Registry Fetch Error', error: error.message });
  }
};

// @desc    Update an applicant's review status (Admin Protected)
// @route   PUT /api/applications/:id/status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'reviewed', 'shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid operational status parameter.' });
    }

    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Target applicant registry entry not found.' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ message: 'Applicant Status Update Error', error: error.message });
  }
};

// @desc    Purge a single application entry (Admin Protected)
// @route   DELETE /api/applications/:id
const deleteApplication = async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Target applicant registry entry not found.' });
    }

    res.status(200).json({ success: true, message: 'Applicant record purged successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Destruction Sequence Error', error: error.message });
  }
};

module.exports = {
  applyToJob,
  getApplicationsForJob,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication
};
