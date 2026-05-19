const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dsa_mastery';
    console.log(`Connecting to MongoDB at: ${connUri}...`);
    
    // Set 2 seconds connection timeout for instant fallback detection
    await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 2000
    });
    
    isConnected = true;
    console.log('======================================');
    console.log('🟢 MongoDB Connected Successfully!');
    console.log('======================================');
  } catch (error) {
    console.log('\n=====================================================================');
    console.log('⚠️ Local MongoDB service not detected on port 27017.');
    console.log('⚡ Activating Built-in JSON Database Simulator for zero-setup execution!');
    console.log('=====================================================================\n');
    isConnected = false;
  }
};

const getDbState = () => isConnected;

module.exports = { connectDB, getDbState };
