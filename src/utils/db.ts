// src/utils/db.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string || 'mongodb+srv://groupbse1:FzwpRVurXm6wW7Jr@pepebackend.y9kzbxy.mongodb.net/?retryWrites=true&w=majority&appName=Pepebackend';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable belum di-set.');
}

/**
 * Fungsi untuk koneksi ke MongoDB Atlas (singleton pattern)
 */
export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  return mongoose.connect(MONGODB_URI, {
    dbName: 'Pepebackend', // gunakan huruf besar P sesuai di Atlas
  });
}
