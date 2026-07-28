import React, { useRef } from 'react';
import { 
  Download, 
  ShieldCheck, 
  QrCode, 
  Calendar, 
  CheckCircle2, 
  Building2, 
  Globe, 
  Award,
  FileCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AcknowledgementLetterPreviewProps {
  member: {
    name: string;
    email: string;
    memberId?: string;
    department?: string;
    college?: string;
  };
  project: {
    title: string;
    description: string;
    category: string;
    technologyStack: string[];
    deadline: string;
  };
  role: {
    title: string;
    department: string;
    responsibilities: string[];
  };
  acknowledgement: {
    signatureData: string;
    signatureType: string;
    typedName?: string;
    ipAddress: string;
    timestamp: string;
    qrCodeHash: string;
    consentAccepted: boolean;
  };
}

export const AcknowledgementLetterPreview: React.FC<AcknowledgementLetterPreviewProps> = ({
  member,
  project,
  role,
  acknowledgement
}) => {
  const documentRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;

    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PRDAMS_Acknowledgement_${member.name.replace(/\s+/g, '_')}_${role.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF Generation failed, invoking print fallback:', error);
      window.print();
    }
  };

  const qrVerificationUrl = `${window.location.origin}/verify/${acknowledgement.qrCodeHash}`;

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Official Verified Digital Letter</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Verification Hash: <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{acknowledgement.qrCodeHash}</span></p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download Official PDF
        </button>
      </div>

      {/* Document Printable Area */}
      <div className="overflow-x-auto p-2 bg-slate-200 dark:bg-slate-950 rounded-2xl">
        <div
          ref={documentRef}
          className="w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 p-10 shadow-2xl relative border border-slate-300 font-sans"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <ShieldCheck className="w-[450px] h-[450px] text-brand-900" />
          </div>

          {/* Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-brand-600 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-14 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                <img src="/logo.png" alt="Nexora Technologies Logo" className="h-11 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-wider text-slate-900 uppercase">NEXORA TECHNOLOGIES</h1>
                <p className="text-[10px] font-bold text-brand-700 uppercase tracking-widest">"BUILDING TOMORROW, TODAY"</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Project Role & Digital Acknowledgement Portal</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-600 space-y-0.5">
              <p className="font-bold text-slate-900">REF: {acknowledgement.qrCodeHash}</p>
              <p>Issue Date: {new Date(acknowledgement.timestamp).toLocaleDateString()}</p>
              <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Status: DIGITALLY VERIFIED</p>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center my-6">
            <h2 className="text-lg font-black text-brand-950 uppercase tracking-wider border-b border-slate-200 inline-block pb-1">
              DIGITAL ROLE ACKNOWLEDGEMENT LETTER
            </h2>
          </div>

          {/* Member Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-xs space-y-3">
            <h3 className="font-bold text-brand-900 uppercase text-[11px] tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-brand-600" /> Member Allocation Data
            </h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-slate-700">
              <div><strong className="text-slate-900">Member Name:</strong> {member.name}</div>
              <div><strong className="text-slate-900">Member ID:</strong> {member.memberId || 'DEV-101'}</div>
              <div><strong className="text-slate-900">Email Address:</strong> {member.email}</div>
              <div><strong className="text-slate-900">Department:</strong> {member.department || 'Software Engineering'}</div>
              <div className="col-span-2"><strong className="text-slate-900">Institution / College:</strong> {member.college || 'Department of Computer Science'}</div>
            </div>
          </div>

          {/* Project & Role Specifications */}
          <div className="space-y-4 mb-6 text-xs text-slate-800">
            <div className="border-l-4 border-brand-600 pl-4 py-1">
              <h4 className="font-bold text-slate-900 text-sm">Project: {project.title}</h4>
              <p className="text-slate-600 mt-1">{project.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-brand-50 text-brand-800 px-2 py-0.5 rounded font-semibold text-[10px]">
                  Category: {project.category}
                </span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[10px]">
                  Deadline: {project.deadline}
                </span>
              </div>
            </div>

            <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-brand-900 text-sm">Assigned Role: {role.title}</h4>
                <span className="text-[10px] font-bold text-brand-700 uppercase bg-white px-2 py-0.5 rounded border border-brand-200">
                  {role.department}
                </span>
              </div>
              <p className="font-bold text-slate-900 text-[11px] mb-1">Key Responsibilities & Deliverables:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] pl-1">
                {role.responsibilities.map((resp, i) => (
                  <li key={i} className="leading-relaxed">{resp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technology Stack Tags */}
          <div className="mb-6 text-xs">
            <p className="font-bold text-slate-900 text-[11px] mb-1">Target Technology Stack:</p>
            <div className="flex flex-wrap gap-1.5">
              {project.technologyStack.map((tech, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Digital Signature, Official Company Seal & Verification Audit Block */}
          <div className="border-t-2 border-slate-200 pt-6 mt-8 grid grid-cols-3 gap-4 text-xs">
            {/* Member Electronic Signature */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Electronic Signature</p>
                <div className="my-2 min-h-[45px] flex items-center">
                  <img src={acknowledgement.signatureData} alt="Digital Signature" className="max-h-12 object-contain" />
                </div>
                <p className="font-bold text-slate-900 text-[11px]">{member.name}</p>
                <p className="text-[9px] text-slate-500">Date: {new Date(acknowledgement.timestamp).toLocaleDateString()}</p>
                <p className="text-[9px] text-slate-400 font-mono">IP: {acknowledgement.ipAddress}</p>
              </div>
            </div>

            {/* Official Company Seal */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Official Company Seal</p>
              <img src="/company-seal.png" alt="Nexora Technologies Certified Seal" className="w-20 h-20 object-contain drop-shadow-sm" />
              <span className="text-[8px] font-bold text-brand-900 uppercase tracking-wider mt-1">CERTIFIED ACKNOWLEDGEMENT</span>
            </div>

            {/* Verification QR Code */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col items-center justify-between text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Document Authenticity</p>
              <div className="p-1.5 bg-white rounded-lg border border-slate-300 my-1">
                <QrCode className="w-12 h-12 text-slate-900 mx-auto" />
              </div>
              <span className="text-[8px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-brand-900 block truncate max-w-full">
                {acknowledgement.qrCodeHash}
              </span>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="border-t border-slate-200 mt-8 pt-4 text-[10px] text-slate-400 text-center space-y-1">
            <p>This document is digitally generated by PRDAMS. Electronic signatures recorded with consent are legally binding under Electronic Transactions Acts.</p>
            <p>PRDAMS System Verification Engine • {qrVerificationUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
