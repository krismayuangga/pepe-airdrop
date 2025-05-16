// src/models/UserClaim.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserClaim extends Document {
  walletAddress: string;
  claimed: boolean;
  claimedAt?: Date;
}

const UserClaimSchema = new Schema<IUserClaim>({
  walletAddress: { type: String, required: true, unique: true },
  claimed: { type: Boolean, required: true, default: false },
  claimedAt: { type: Date },
});

export default mongoose.models.UserClaim || mongoose.model<IUserClaim>('UserClaim', UserClaimSchema);
