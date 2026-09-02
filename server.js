const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRoutes');
const appointmentRouter = require('./routes/appointmentRoutes');
const blogRouter = require('./routes/blogRoutes');
const jobRouter = require('./routes/jobRoutes');
const applicationRouter = require('./routes/applicationRoutes');
const contactRouter = require('./routes/contactRoutes');



// Load environmental parameters
dotenv.config();

// Initialize DB Connection
connectDB();

const app = express();

app.use(cookieParser());

// Security Configurations
app.use(cors({
  origin: 'https://nova-disconfig.vercel.app',
  credentials: true
}));
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ limit: '12mb', extended: true }));
// Mounting API Array Route Branches
app.use('/api/appointments',appointmentRouter);
app.use('/api/auth', authRouter);
app.use('/api/blogs',blogRouter); // Blog routes for public and admin channels
app.use('/api/jobs', jobRouter); // Careers job postings + public application intake
app.use('/api/applications', applicationRouter); // Admin-only applicant registry management
app.use('/api/contact', contactRouter); // Public contact form submissions

// Server Telemetry Log Monitor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[PORTAL] Nova Core Server matrix operational on port ${PORT}`);
});