// src/models/UserCheckin.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserCheckin extends Document {
  walletAddress: string;
  lastCheckIn: string; // format ISO date string
  streak: number;
}

const UserCheckinSchema = new Schema<IUserCheckin>({
  walletAddress: { type: String, required: true, unique: true },
  lastCheckIn: { type: String, required: true },
  streak: { type: Number, required: true, default: 1 },
});

export default mongoose.models.UserCheckin || mongoose.model<IUserCheckin>('UserCheckin', UserCheckinSchema);
