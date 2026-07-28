import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  title: string;
  category: string;
  department: string;
  responsibilities: string[];
  requiredSkills: string[];
  description: string;
  createdAt: Date;
}

const RoleSchema: Schema = new Schema({
  title: { type: String, required: true, unique: true },
  category: { type: String, default: 'Engineering' },
  department: { type: String, default: 'Software Development' },
  responsibilities: [{ type: String }],
  requiredSkills: [{ type: String }],
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
