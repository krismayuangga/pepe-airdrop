// src/models/AdminLog.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminLog extends Document {
  type: string; // e.g. 'login', 'claim', 'task', 'referral', etc
  message: string;
  walletAddress?: string;
  admin?: string;
  createdAt: Date;
}

const AdminLogSchema = new Schema<IAdminLog>({
  type: { type: String, required: true },
  message: { type: String, required: true },
  walletAddress: { type: String },
  admin: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const AdminLog = mongoose.models.AdminLog || mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);
export { AdminLog };
