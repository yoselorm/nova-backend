const express = require('express');
const contactRouter = express.Router();
const { sendContactMessage } = require('../controllers/contactController');

// Public channel — anyone can submit the contact form
contactRouter.post('/', sendContactMessage);

module.exports = contactRouter;
