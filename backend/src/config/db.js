import mongoose from 'mongoose';

/**
 * Connect to MongoDB database.
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ratelim';
  
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    // Graceful exit on startup database connection failure
    process.exit(1);
  }
};
