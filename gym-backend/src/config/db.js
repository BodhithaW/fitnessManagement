const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set. Please check your .env file.');
    }
    
    console.log(`Attempting to connect to MongoDB...`);
    console.log(`URI: ${mongoUri}`);
    
    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Please check:');
    console.error('1. .env file exists and contains MONGO_URI');
    console.error('2. MongoDB Atlas cluster is running');
    console.error('3. Connection string is correct');
    console.error('4. Username/password are correct');
    process.exit(1);
  }
};

module.exports = connectDB;
