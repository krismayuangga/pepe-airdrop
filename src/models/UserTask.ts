// src/models/UserTask.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserTask extends Document {
  walletAddress: string;
  taskId: string;
  completed: boolean;
  completedAt: Date;
}

const UserTaskSchema = new Schema<IUserTask>({
  walletAddress: { type: String, required: true },
  taskId: { type: String, required: true },
  completed: { type: Boolean, required: true, default: false },
  completedAt: { type: Date, default: Date.now },
});

UserTaskSchema.index({ walletAddress: 1, taskId: 1 }, { unique: true });

export default mongoose.models.UserTask || mongoose.model<IUserTask>('UserTask', UserTaskSchema);
