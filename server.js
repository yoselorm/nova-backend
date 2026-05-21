const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRoutes');
const appointmentRouter = require('./routes/appointmentRoutes');
const blogRouter = require('./routes/blogRoutes');



// Load environmental parameters
dotenv.config();

// Initialize DB Connection
connectDB();

const app = express();

app.use(cookieParser());

// Security Configurations
app.use(cors({
  origin: 'http://localhost:3000', // Your Vite React Frontend URI development origin
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Mounting API Array Route Branches
app.use('/api/appointments',appointmentRouter);
app.use('/api/auth', authRouter);
app.use('/api/blogs',blogRouter); // Blog routes for public and admin channels

// Server Telemetry Log Monitor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[PORTAL] Nova Core Server matrix operational on port ${PORT}`);
});