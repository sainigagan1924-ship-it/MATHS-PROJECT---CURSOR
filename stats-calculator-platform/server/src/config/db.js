import mongoose from 'mongoose';

/**
 * Connects to MongoDB using MONGODB_URI from environment.
 */
export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[db] MONGODB_URI not set — saved calculations disabled.');
    return null;
  }
  await mongoose.connect(uri);
  console.log('[db] MongoDB connected');
  return mongoose.connection;
}
