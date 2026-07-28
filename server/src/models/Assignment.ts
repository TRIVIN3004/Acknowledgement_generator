import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  projectId: string;
  roleId: string;
  memberId: string;
  assignedBy: string;
  status: 'pending' | 'accepted' | 'rejected' | 'change_requested';
  changeNote?: string;
  assignedAt: Date;
  respondedAt?: Date;
}

const AssignmentSchema: Schema = new Schema({
  projectId: { type: String, required: true },
  roleId: { type: String, required: true },
  memberId: { type: String, required: true },
  assignedBy: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'change_requested'], 
    default: 'pending' 
  },
  changeNote: { type: String },
  assignedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date }
});

export default mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);
