const express = require('express');
const applicationRouter = express.Router();
const {
  getAllApplications,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/jobApplicationController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Admin Command Locked Pipelines (all applicant records are private)
applicationRouter.get('/', protectAdmin, getAllApplications);
applicationRouter.put('/:id/status', protectAdmin, updateApplicationStatus);
applicationRouter.delete('/:id', protectAdmin, deleteApplication);

module.exports = applicationRouter;
