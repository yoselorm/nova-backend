const express = require('express');
const appointmentRouter = express.Router();
const {
  createAppointment,
  updateAppointment,
  getAllAppointments
} = require('../controllers/appointmentController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public channel entry pipeline
appointmentRouter.post('/', createAppointment);

// Admin channel entry pipelines (Later we lock these down with protect middleware)
appointmentRouter.get('/',protectAdmin, getAllAppointments);
appointmentRouter.put('/:id', protectAdmin, updateAppointment);

module.exports = appointmentRouter;