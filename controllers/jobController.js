const mongoose = require('mongoose');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');

// @desc    Get all currently open jobs (Public)
// @route   GET /api/jobs
const getAllJobs = async (req, res) => {
  try {
    const { department, employmentType } = req.query;
    let query = { isOpen: true };

    if (department) query.department = department;
    if (employmentType) query.employmentType = employmentType;

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ message: 'Job Listing Fetch Error', error: error.message });
  }
};

// @desc    Get every job regardless of open/closed status (Admin Protected)
// @route   GET /api/jobs/admin/all
const getAllJobsAdmin = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ message: 'Job Listing Fetch Error', error: error.message });
  }
};

// @desc    Get a single job by its Mongo ID or URL slug (Public)
// @route   GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };

    const job = await Job.findOne(query);

    if (!job) {
      return res.status(404).json({ message: 'Target job posting registry entry not found.' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ message: 'Job Fetch Error', error: error.message });
  }
};

// @desc    Instantiate a new job posting (Admin Protected)
// @route   POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { title, department, location, employmentType, description, responsibilities, requirements, deadline } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Mandatory creation parameter elements missing.' });
    }

    const newJob = await Job.create({
      title,
      department,
      location,
      employmentType,
      description,
      responsibilities,
      requirements,
      deadline
    });

    res.status(201).json({ success: true, data: newJob });
  } catch (error) {
    res.status(500).json({ message: 'Job Creation Crash Layer', error: error.message });
  }
};

// @desc    Modify an existing job posting (Admin Protected)
// @route   PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Target job posting registry entry not found.' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ message: 'Job Patch Error', error: error.message });
  }
};

// @desc    Purge a job posting entirely out of database clusters (Admin Protected)
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Target job asset registry mismatch.' });
    }

    // Cascade cleanup: purge any applications tied to this now-deleted posting
    await JobApplication.deleteMany({ job: job._id });

    res.status(200).json({ success: true, message: 'Job posting and linked applications purged successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Destruction Sequence Error', error: error.message });
  }
};

// @desc    Close a job posting to new applications (Admin Protected)
// @route   PATCH /api/jobs/:id/close
const closeJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { isOpen: false },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Target job posting registry entry not found.' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ message: 'Job Closure Error', error: error.message });
  }
};

// @desc    Reopen a previously closed job posting (Admin Protected)
// @route   PATCH /api/jobs/:id/reopen
const reopenJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { isOpen: true },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Target job posting registry entry not found.' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ message: 'Job Reopen Error', error: error.message });
  }
};

module.exports = {
  getAllJobs,
  getAllJobsAdmin,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  closeJob,
  reopenJob
};
