import mongoose from "mongoose";
const globalDb = globalThis as typeof globalThis & {
  mongo?: {
    connection: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};
const cache = (globalDb.mongo ||= { connection: null, promise: null });
export async function connectDB() {
  if (cache.connection) return cache.connection;
  if (!process.env.MONGODB_URI)
    throw new Error("Database is not configured. Set MONGODB_URI.");
  cache.promise ||= mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    bufferCommands: false,
  });
  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
}
