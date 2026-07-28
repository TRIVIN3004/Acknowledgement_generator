import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  category: string;
  technologyStack: string[];
  leadId?: string;
  leadName?: string;
  deadline: string;
  status: 'planning' | 'in_progress' | 'completed' | 'archived';
  timeline: {
    assignedAt?: Date;
    acceptedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
  };
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Enterprise Web Application' },
  technologyStack: [{ type: String }],
  leadId: { type: String },
  leadName: { type: String, default: 'Unassigned' },
  deadline: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['planning', 'in_progress', 'completed', 'archived'], 
    default: 'planning' 
  },
  timeline: {
    assignedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
