import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  PenTool, 
  Calendar, 
  Code, 
  Building2, 
  ShieldCheck,
  Eye,
  FileCheck2
} from 'lucide-react';
import { api } from '../../services/api';
import { Assignment, SignatureType } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DigitalSignatureModal } from '../../components/signature/DigitalSignatureModal';
import { Modal } from '../../components/common/Modal';
import { AcknowledgementLetterPreview } from '../../components/pdf/AcknowledgementLetterPreview';
import { useAuth } from '../../context/AuthContext';

export const RoleAcceptancePage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Digital Signature Modal State
  const [activeAssignmentForSign, setActiveAssignmentForSign] = useState<Assignment | null>(null);

  // View Generated Letter Modal
  const [activeLetterAck, setActiveLetterAck] = useState<any | null>(null);

  // Reject / Request Change Modal
  const [actionModal, setActionModal] = useState<{ open: boolean; assignment: Assignment | null; action: 'reject' | 'request_change' }>({
    open: false,
    assignment: null,
    action: 'reject'
  });
  const [changeNote, setChangeNote] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.getAssignments(`memberId=${user?.id}`);
      if (res.success) {
        setAssignments(res.assignments);
      }
    } catch (e) {
      console.error('Failed to fetch assignments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureSubmit = async (signatureData: {
    signatureType: SignatureType;
    signatureData: string;
    typedName?: string;
    consentAccepted: boolean;
  }) => {
    if (!activeAssignmentForSign) return;

    try {
      const res = await api.createAcknowledgement({
        assignmentId: activeAssignmentForSign.id,
        signatureType: signatureData.signatureType,
        signatureData: signatureData.signatureData,
        typedName: signatureData.typedName,
        consentAccepted: signatureData.consentAccepted
      });

      alert('Electronic signature accepted and digital acknowledgement generated!');
      setActiveAssignmentForSign(null);
      fetchAssignments();
    } catch (err: any) {
      alert(err.message || 'Signature submission failed');
    }
  };

  const handleResponseSubmit = async () => {
    if (!actionModal.assignment) return;
    try {
      await api.respondAssignment(actionModal.assignment.id, {
        action: actionModal.action,
        changeNote
      });
      setActionModal({ open: false, assignment: null, action: 'reject' });
      setChangeNote('');
      fetchAssignments();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-brand-600" />
          Assigned Roles & Electronic Acknowledgement
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review role specifications, responsibilities matrix, and officially submit electronic signatures
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400">No project roles have been assigned to your account yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignments.map((asgn) => {
            const isPending = asgn.status === 'pending';
            const isAccepted = asgn.status === 'accepted';

            return (
              <div
                key={asgn.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
              >
                {/* Status Bar */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={asgn.status} />
                    <span className="text-xs text-slate-400">
                      Assigned On: {new Date(asgn.assignedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">REF: {asgn.id}</span>
                </div>

                {/* Project & Role Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Project Details */}
                  <div className="lg:col-span-2 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        Project Overview
                      </span>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{asgn.project?.title}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {asgn.project?.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-2">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> Category: <strong>{asgn.project?.category}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-500" /> Deadline: <strong>{asgn.project?.deadline}</strong>
                      </span>
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Project Technology Stack:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {asgn.project?.technologyStack.map((tech, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Assigned Role Specifications */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Assigned Role</span>
                      <span className="text-[10px] font-semibold text-slate-400">{asgn.role?.department}</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{asgn.role?.title}</h3>
                    
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Key Responsibilities:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {asgn.role?.responsibilities.map((resp, i) => (
                          <li key={i} className="line-clamp-2">{resp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Member Action Controls Bar */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  {isPending ? (
                    <>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                        <PenTool className="w-4 h-4" /> Official digital acknowledgement signature is required for project onboarding.
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActionModal({ open: true, assignment: asgn, action: 'request_change' })}
                          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Request Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setActionModal({ open: true, assignment: asgn, action: 'reject' })}
                          className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20"
                        >
                          Decline Role
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveAssignmentForSign(asgn)}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition-all cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" /> Accept & Attach Digital Signature
                        </button>
                      </div>
                    </>
                  ) : isAccepted && asgn.acknowledgement ? (
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <ShieldCheck className="w-5 h-5" />
                        Role Officialized & Digitally Signed (Hash: {asgn.acknowledgement.qrCodeHash})
                      </div>
                      <button
                        onClick={() => setActiveLetterAck(asgn.acknowledgement)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                      >
                        <Eye className="w-4 h-4" /> View Official Signed Letter
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Assignment Status: {asgn.status}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Signature Modal */}
      {activeAssignmentForSign && (
        <DigitalSignatureModal
          isOpen={!!activeAssignmentForSign}
          onClose={() => setActiveAssignmentForSign(null)}
          onSubmit={handleSignatureSubmit}
          memberName={user?.name || 'Team Member'}
          roleTitle={activeAssignmentForSign.role?.title || 'Assigned Role'}
          projectTitle={activeAssignmentForSign.project?.title || 'Project'}
        />
      )}

      {/* Response Note Modal (Reject or Request Change) */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, assignment: null, action: 'reject' })}
        title={actionModal.action === 'reject' ? 'Decline Role Assignment' : 'Request Role Adjustment'}
        subtitle="Send a note to administration detailing your reasoning."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Note for Project Leadership:
            </label>
            <textarea
              rows={4}
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="Detail reasons for rejection or requested adjustments..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              onClick={() => setActionModal({ open: false, assignment: null, action: 'reject' })}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleResponseSubmit}
              className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
            >
              Submit Response
            </button>
          </div>
        </div>
      </Modal>

      {/* View Signed Letter Modal */}
      {activeLetterAck && (
        <Modal
          isOpen={!!activeLetterAck}
          onClose={() => setActiveLetterAck(null)}
          title="Digital Acknowledgement Letter"
          subtitle={`Hash: ${activeLetterAck.qrCodeHash}`}
          maxWidth="4xl"
        >
          <AcknowledgementLetterPreview
            member={{
              name: user?.name || 'Member',
              email: user?.email || '',
              memberId: user?.memberId || 'DEV-101',
              department: user?.department,
              college: user?.college
            }}
            project={{
              title: activeLetterAck.project?.title || 'Project',
              description: activeLetterAck.project?.description || '',
              category: activeLetterAck.project?.category || 'Software',
              technologyStack: activeLetterAck.project?.technologyStack || [],
              deadline: activeLetterAck.project?.deadline || ''
            }}
            role={{
              title: activeLetterAck.role?.title || 'Role',
              department: activeLetterAck.role?.department || '',
              responsibilities: activeLetterAck.role?.responsibilities || []
            }}
            acknowledgement={{
              signatureData: activeLetterAck.signatureData,
              signatureType: activeLetterAck.signatureType,
              typedName: activeLetterAck.typedName,
              ipAddress: activeLetterAck.ipAddress,
              timestamp: activeLetterAck.timestamp,
              qrCodeHash: activeLetterAck.qrCodeHash,
              consentAccepted: activeLetterAck.consentAccepted
            }}
          />
        </Modal>
      )}
    </div>
  );
};
