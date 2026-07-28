import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, QrCode, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Acknowledgement } from '../../types';
import { Modal } from '../../components/common/Modal';
import { AcknowledgementLetterPreview } from '../../components/pdf/AcknowledgementLetterPreview';
import { useAuth } from '../../context/AuthContext';

export const MyLettersPage: React.FC = () => {
  const { user } = useAuth();
  const [letters, setLetters] = useState<Acknowledgement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAck, setSelectedAck] = useState<Acknowledgement | null>(null);

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const res = await api.getAcknowledgements(`memberId=${user?.id}`);
      if (res.success) {
        setLetters(res.acknowledgements);
      }
    } catch (e) {
      console.error('Failed to fetch letters:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-600" />
          My Signed Acknowledgement Letters
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personal repository of verified electronic letters, signature hashes, and PDF downloads
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading signed letters...</div>
      ) : letters.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400">You have no signed digital acknowledgement letters yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {letters.map((ack) => (
            <div key={ack.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-900">
                    <QrCode className="w-3.5 h-3.5" /> {ack.qrCodeHash}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(ack.timestamp).toLocaleDateString()}</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {ack.project?.title || (ack as any).projectTitle || (ack as any).assignment?.projectTitle || 'Nexora Project'}
                  </h3>
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    Role: {ack.role?.title || (ack as any).roleTitle || (ack as any).assignment?.roleTitle || 'Software Engineer'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signature Mode:</span>
                    <strong className="text-slate-900 dark:text-white uppercase">{ack.signatureType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IP Log:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{ack.ipAddress}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={`/verify/${ack.qrCodeHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-500"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Verify Link
                </a>

                <button
                  onClick={() => setSelectedAck(ack)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20"
                >
                  <Eye className="w-4 h-4" /> View / Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF View Modal */}
      {selectedAck && (
        <Modal
          isOpen={!!selectedAck}
          onClose={() => setSelectedAck(null)}
          title="Digital Acknowledgement Letter"
          subtitle={`Hash: ${selectedAck.qrCodeHash}`}
          maxWidth="4xl"
        >
          <AcknowledgementLetterPreview
            member={{
              name: selectedAck.member?.name || user?.name || 'Team Member',
              email: selectedAck.member?.email || user?.email || 'member@nexora.com',
              memberId: selectedAck.member?.memberId || user?.memberId || 'DEV-101',
              department: selectedAck.member?.department || user?.department || 'Software Engineering',
              college: selectedAck.member?.college || user?.college || 'Department of Computer Science'
            }}
            project={{
              title: selectedAck.project?.title || (selectedAck as any).projectTitle || (selectedAck as any).assignment?.projectTitle || 'Nexora Project',
              description: selectedAck.project?.description || 'Enterprise software platform developed by Nexora Technologies.',
              category: selectedAck.project?.category || 'Software Engineering',
              technologyStack: (selectedAck.project?.technologyStack && selectedAck.project.technologyStack.length > 0)
                ? selectedAck.project.technologyStack
                : ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
              deadline: selectedAck.project?.deadline || '2026-12-31'
            }}
            role={{
              title: selectedAck.role?.title || (selectedAck as any).roleTitle || (selectedAck as any).assignment?.roleTitle || 'Software Engineer',
              department: selectedAck.role?.department || selectedAck.member?.department || user?.department || 'Software Engineering',
              responsibilities: (selectedAck.role?.responsibilities && selectedAck.role.responsibilities.length > 0)
                ? selectedAck.role.responsibilities
                : [
                    'Develop, test, and deliver modular application features.',
                    'Collaborate with project leads and cross-functional engineering team members.',
                    'Maintain clean code principles and digital signature verification compliance.'
                  ]
            }}
            acknowledgement={{
              signatureData: selectedAck.signatureData,
              signatureType: selectedAck.signatureType,
              typedName: selectedAck.typedName,
              ipAddress: selectedAck.ipAddress,
              timestamp: selectedAck.timestamp,
              qrCodeHash: selectedAck.qrCodeHash,
              consentAccepted: selectedAck.consentAccepted
            }}
          />
        </Modal>
      )}
    </div>
  );
};
