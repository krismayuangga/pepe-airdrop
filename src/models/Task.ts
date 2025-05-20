import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  id: string; // unique task id (e.g. 'twitter-follow')
  title: string;
  description: string;
  points: number;
  type: string; // e.g. 'follow', 'share', 'custom'
  url?: string; // opsional, link tugas
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema<ITask>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true, default: 0 },
  type: { type: String, required: false, default: 'custom' },
  url: { type: String },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
