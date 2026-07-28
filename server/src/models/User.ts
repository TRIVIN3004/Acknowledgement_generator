import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'member';
  department?: string;
  college?: string;
  phone?: string;
  skills?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'active';
  memberId?: string;
  avatarUrl?: string;
  defaultSignature?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  department: { type: String, default: 'Software Engineering' },
  college: { type: String, default: 'Institute of Technology' },
  phone: { type: String, default: '+1 (555) 019-2834' },
  skills: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'active'], default: 'approved' },
  memberId: { type: String },
  avatarUrl: { type: String },
  defaultSignature: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
