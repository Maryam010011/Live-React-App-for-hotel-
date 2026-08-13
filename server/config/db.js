import mongoose from 'mongoose';
import dns from 'dns';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('MONGODB_URI not found in process.env. Running without MongoDB connection.');
    return;
  }

  // Ensure DNS SRV records resolve cleanly on Windows environments
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // Ignore if not permitted
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    isConnected = !!conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't exit process in serverless env so fallback mock handling works
  }
};
