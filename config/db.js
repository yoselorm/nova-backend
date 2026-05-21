const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[SYSTEM] MongoDB Cluster connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[CRITICAL] MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;