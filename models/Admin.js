const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Admin operational email is mandatory'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Security passcode parameter is mandatory'],
    minlength: [6, 'Passcode must be at least 6 characters']
  },
  role: {
    type: String,
    default: 'super-admin'
  }
}, {
  timestamps: true
});

// Built-in Hook: Automatically hash the password layer before saving
// AdminSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

AdminSchema.pre('save', async function () {
  // If the password hasn't been modified, just exit the execution function early
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // No next() callback required here! Mongoose handles the async resolution automatically.
});

// Helper Method: Match incoming password parameter against hashed storage
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);