const express = require('express');
const jobRouter = express.Router();
const {
  getAllJobs,
  getAllJobsAdmin,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  closeJob,
  reopenJob
} = require('../controllers/jobController');
const { applyToJob, getApplicationsForJob } = require('../controllers/jobApplicationController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public Channels Pipelines
jobRouter.get('/', getAllJobs);
jobRouter.get('/admin/all', protectAdmin, getAllJobsAdmin);
jobRouter.get('/:id', getJobById);
jobRouter.post('/:id/apply', applyToJob);

// Admin Command Locked Pipelines
jobRouter.post('/', protectAdmin, createJob);
jobRouter.put('/:id', protectAdmin, updateJob);
jobRouter.delete('/:id', protectAdmin, deleteJob);
jobRouter.patch('/:id/close', protectAdmin, closeJob);
jobRouter.patch('/:id/reopen', protectAdmin, reopenJob);
jobRouter.get('/:id/applications', protectAdmin, getApplicationsForJob);

module.exports = jobRouter;
