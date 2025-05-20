import mongoose, { Schema, Document } from 'mongoose';

export interface IBroadcast extends Document {
  message: string;
  createdAt: Date;
}

const BroadcastSchema = new Schema<IBroadcast>({
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Broadcast || mongoose.model<IBroadcast>('Broadcast', BroadcastSchema);
