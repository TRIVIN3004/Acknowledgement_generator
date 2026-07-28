import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  performedBy: string;
  performedByName: string;
  performedByRole: string;
  targetType: string;
  targetId?: string;
  details: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  performedByName: { type: String, required: true },
  performedByRole: { type: String, required: true },
  targetType: { type: String, required: true },
  targetId: { type: String },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
