import mongoose, { Schema, Document } from 'mongoose';

export interface IAcknowledgement extends Document {
  assignmentId: string;
  projectId: string;
  roleId: string;
  memberId: string;
  signatureType: 'draw' | 'upload' | 'type';
  signatureData: string;
  typedName?: string;
  ipAddress: string;
  userAgent: string;
  consentAccepted: boolean;
  timestamp: Date;
  qrCodeHash: string;
  pdfUrl?: string;
}

const AcknowledgementSchema: Schema = new Schema({
  assignmentId: { type: String, required: true },
  projectId: { type: String, required: true },
  roleId: { type: String, required: true },
  memberId: { type: String, required: true },
  signatureType: { type: String, enum: ['draw', 'upload', 'type'], required: true },
  signatureData: { type: String, required: true },
  typedName: { type: String },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  consentAccepted: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  qrCodeHash: { type: String, required: true },
  pdfUrl: { type: String }
});

export default mongoose.models.Acknowledgement || mongoose.model<IAcknowledgement>('Acknowledgement', AcknowledgementSchema);
