// src/models/Referral.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  referrer: string; // wallet address
  referred: string; // wallet address
  createdAt: Date;
}

const ReferralSchema = new Schema<IReferral>({
  referrer: { type: String, required: true },
  referred: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

ReferralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

export default mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);
