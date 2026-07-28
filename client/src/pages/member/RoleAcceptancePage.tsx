import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  FolderKanban, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  FileCheck2, 
  Calendar, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { api } from '../../services/api';
import { Assignment, Acknowledgement } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DigitalSignatureModal } from '../../components/signature/DigitalSignatureModal';
import { AcknowledgementLetterPreview } from '../../components/pdf/AcknowledgementLetterPreview';
import { getFallbackRoleDetails } from '../../utils/roleUtils';

export const RoleAcceptancePage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Digital Signature Modal
  const [activeAssignmentForSign, setActiveAssignmentForSign] = useState<Assignment | null>(null);

  // Reject / Change Request Note Modal
  const [actionModal, setActionModal] = useState<{ open: boolean; assignment: Assignment | null; action: 'reject' | 'request_change' }>({
    open: false,
    assignment: null,
    action: 'reject'
  });
  const [changeNote, setChangeNote] = useState('');

  // View Signed Letter Modal
  const [activeLetterAck, setActiveLetterAck] = useState<Acknowledgement | null>(null);

  useEffect(() => {
    fetchMyAssignments();
  }, [user]);

  const fetchMyAssignments = async () => {
    try {
      const res = await api.getAssignments("memberId=" + user?.id);
      if (res.success) {
        setAssignments(res.assignments);
      }
    } catch (e) {
      console.error('Failed to fetch assignments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureSubmit = async (signatureData: { signatureType: any; signatureData: string; typedName?: string; consentAccepted: boolean }) => {
    if (!activeAssignmentForSign) return;

    try {
      const res = await api.createAcknowledgement({
        assignmentId: activeAssignmentForSign.id,
        signatureType: signatureData.signatureType,
        signatureData: signatureData.signatureData,
        typedName: signatureData.typedName,
        consentAccepted: signatureData.consentAccepted
      });

      if (res.success) {
        alert('🎉 Role accepted and digital acknowledgement letter successfully signed!');
        setActiveAssignmentForSign(null);
        fetchMyAssignments();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to record digital signature');
    }
  };

  const handleResponseSubmit = async () => {
    if (!actionModal.assignment) return;

    try {
      const res = await api.respondAssignment(actionModal.assignment.id, {
        action: actionModal.action,
        changeNote
      });

      if (res.success) {
        alert(`Status updated to ${actionModal.action.replace('_', ' ')}.`);
        setActionModal({ open: false, assignment: null, action: 'reject' });
        setChangeNote('');
        fetchMyAssignments();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit response');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-semibold text-slate-400">
        Loading assigned role allocations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-brand-600" />
          Assigned Roles & Electronic Acknowledgement
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review role specifications, responsibilities matrix, and officially submit electronic signatures
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-xs text-slate-400">You currently have no project role assignments requiring review.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignments.map((asgn) => {
            const project = asgn.project;
            const role = asgn.role;

            return (
              <div 
                key={asgn.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden"
              >
                {/* Top Status Ribbon */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={asgn.status} />
                    <span className="text-xs text-slate-400">
                      Assigned On: {new Date(asgn.assignedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    REF: {asgn.id}
                  </span>
                </div>

                {/* Project & Role Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Project Specs */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        Project Overview
                      </span>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                        {project?.title || asgn.projectTitle || 'Parent teacher app'}
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {project?.description || 'Enterprise Parent teacher app software platform developed by Nexora Technologies.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <FolderKanban className="w-4 h-4 text-brand-500" />
                        <span>Category: <strong className="text-slate-900 dark:text-white">{project?.category || 'Software Engineering'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span>Deadline: <strong className="text-slate-900 dark:text-white">{project?.deadline || '2026-12-31'}</strong></span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Project Technology Stack:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(project?.technologyStack || ['React', 'TypeScript', 'Node.js', 'PostgreSQL']).map((tech, idx) => (
                          <span 
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Assigned Role Card */}
                  {(() => {
                    const fallback = getFallbackRoleDetails(user?.department, asgn.roleTitle);
                    const displayTitle = role?.title || (asgn.roleTitle && asgn.roleTitle !== 'Unknown Role' ? asgn.roleTitle : fallback.title);
                    const displayDept = role?.department || user?.department || fallback.department;
                    const displayResps = (role?.responsibilities && role.responsibilities.length > 0) ? role.responsibilities : fallback.responsibilities;

                    return (
                      <div className="p-5 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">
                            Assigned Role
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {displayDept}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                          {displayTitle}
                        </h3>

                        <div>
                          <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Key Responsibilities:
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                            {displayResps.map((resp, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Actions Bar */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {asgn.status === 'pending' ? (
                    <>
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                        <Clock className="w-4 h-4" />
                        Action Required: Please accept & electronically sign this role acknowledgement.
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setActionModal({ open: true, assignment: asgn, action: 'reject' })}
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
                        >
                          Decline Role
                        </button>
                        <button
                          onClick={() => setActionModal({ open: true, assignment: asgn, action: 'request_change' })}
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-900 transition-all cursor-pointer"
                        >
                          Request Change
                        </button>
                        <button
                          onClick={() => setActiveAssignmentForSign(asgn)}
                          className="flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <FileCheck2 className="w-4 h-4" /> Accept & Sign Digitally
                        </button>
                      </div>
                    </>
                  ) : asgn.status === 'accepted' ? (
                    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Role Officialized & Digitally Signed {asgn.acknowledgement?.qrCodeHash ? `(Hash: ${asgn.acknowledgement.qrCodeHash})` : ''}
                      </div>

                      {asgn.acknowledgement && (
                        <button
                          onClick={() => setActiveLetterAck(asgn.acknowledgement)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                        >
                          <Eye className="w-4 h-4" /> View Official Signed Letter
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">
                      Response recorded: <strong className="uppercase">{asgn.status}</strong>
                    </div>
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
          roleTitle={activeAssignmentForSign.role?.title || activeAssignmentForSign.roleTitle || 'Software Engineer'}
          projectTitle={activeAssignmentForSign.project?.title || activeAssignmentForSign.projectTitle || 'Nexora Project'}
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
              name: activeLetterAck.member?.name || user?.name || 'Team Member',
              email: activeLetterAck.member?.email || user?.email || 'member@nexora.com',
              memberId: activeLetterAck.member?.memberId || user?.memberId || 'DEV-101',
              department: activeLetterAck.member?.department || user?.department || 'Software Engineering',
              college: activeLetterAck.member?.college || user?.college || 'Department of Computer Science'
            }}
            project={{
              title: activeLetterAck.project?.title || (activeLetterAck as any).projectTitle || (activeLetterAck as any).assignment?.projectTitle || 'Nexora Project',
              description: activeLetterAck.project?.description || 'Enterprise software initiative developed by Nexora Technologies.',
              category: activeLetterAck.project?.category || 'Software Engineering',
              technologyStack: (activeLetterAck.project?.technologyStack && activeLetterAck.project.technologyStack.length > 0)
                ? activeLetterAck.project.technologyStack
                : ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
              deadline: activeLetterAck.project?.deadline || '2026-12-31'
            }}
            role={(() => {
              const fallback = getFallbackRoleDetails(
                activeLetterAck.member?.department || user?.department,
                activeLetterAck.role?.title || (activeLetterAck as any).roleTitle || (activeLetterAck as any).assignment?.roleTitle
              );
              return {
                title: activeLetterAck.role?.title || (activeLetterAck as any).roleTitle || (activeLetterAck as any).assignment?.roleTitle || fallback.title,
                department: activeLetterAck.role?.department || activeLetterAck.member?.department || user?.department || fallback.department,
                responsibilities: (activeLetterAck.role?.responsibilities && activeLetterAck.role.responsibilities.length > 0)
                  ? activeLetterAck.role.responsibilities
                  : fallback.responsibilities
              };
            })()}
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
