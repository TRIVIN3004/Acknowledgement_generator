import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  Download, 
  FileSpreadsheet, 
  Archive, 
  Eye, 
  ExternalLink, 
  Calendar, 
  QrCode, 
  Globe, 
  Building2,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { Acknowledgement } from '../../types';
import { Modal } from '../../components/common/Modal';
import { AcknowledgementLetterPreview } from '../../components/pdf/AcknowledgementLetterPreview';

export const AcknowledgementDashboard: React.FC = () => {
  const [acknowledgements, setAcknowledgements] = useState<Acknowledgement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected Letter Modal
  const [selectedAck, setSelectedAck] = useState<Acknowledgement | null>(null);

  useEffect(() => {
    fetchAcknowledgements();
  }, [search]);

  const fetchAcknowledgements = async () => {
    try {
      let params = '';
      if (search) params = `search=${encodeURIComponent(search)}`;
      const res = await api.getAcknowledgements(params);
      if (res.success) {
        setAcknowledgements(res.acknowledgements);
      }
    } catch (e) {
      console.error('Failed to fetch digital acknowledgements:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await api.exportExcel();
      if (res.success && res.data) {
        const csvContent = "data:text/csv;charset=utf-8," 
          + [Object.keys(res.data[0]).join(","), ...res.data.map((e: any) => Object.values(e).map(val => `"${val}"`).join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", res.filename || "PRDAMS_Digital_Acknowledgements.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      alert(err.message || 'Export failed');
    }
  };

  const handleExportZip = async () => {
    try {
      const res = await api.exportZip();
      alert(`Export bundle created: ${res.zipFilename} (${res.files.length} letters packaged).`);
    } catch (err: any) {
      alert(err.message || 'ZIP Export failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-brand-600" />
            Digital Acknowledgements Master Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Repository of all signed digital letters, cryptographic hashes, & bulk exports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel/CSV
          </button>
          <button
            onClick={handleExportZip}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
          >
            <Archive className="w-4 h-4" /> Export ZIP Archive
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by member, project, role title, or hash..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
      </div>

      {/* Acknowledgements Master Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Verification Hash</th>
                <th className="px-6 py-4">Signatory Member</th>
                <th className="px-6 py-4">Project & Assigned Role</th>
                <th className="px-6 py-4">Sign Method / Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading master repository...</td>
                </tr>
              ) : acknowledgements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No digital acknowledgement letters found.</td>
                </tr>
              ) : (
                acknowledgements.map((ack) => (
                  <tr key={ack.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      <div className="flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-brand-500" />
                        <span>{ack.qrCodeHash}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 dark:text-white">{ack.member?.name || 'Elena Rostova'}</p>
                        <p className="text-[11px] text-slate-400">{ack.member?.email}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 dark:text-white">{ack.project?.title || 'Nexora AI Copilot'}</p>
                        <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">{ack.role?.title || 'AI Engineer'}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {ack.signatureType.toUpperCase()}
                        </span>
                        <p className="text-[10px] text-slate-400">{new Date(ack.timestamp).toLocaleDateString()}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedAck(ack)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 hover:bg-brand-100 font-bold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View / Download PDF
                        </button>
                        <a
                          href={`/verify/${ack.qrCodeHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors"
                          title="Open Verification Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF View Modal */}
      {selectedAck && (
        <Modal
          isOpen={!!selectedAck}
          onClose={() => setSelectedAck(null)}
          title={`Digital Acknowledgement Letter — ${selectedAck.qrCodeHash}`}
          subtitle={`Member: ${selectedAck.member?.name} • Project: ${selectedAck.project?.title}`}
          maxWidth="4xl"
        >
          <AcknowledgementLetterPreview
            member={{
              name: selectedAck.member?.name || 'Elena Rostova',
              email: selectedAck.member?.email || 'elena@prdams.com',
              memberId: selectedAck.member?.memberId || 'DEV-102',
              department: selectedAck.member?.department || 'AI Engineering',
              college: selectedAck.member?.college || 'UC Berkeley'
            }}
            project={{
              title: selectedAck.project?.title || 'Nexora AI Copilot Platform',
              description: selectedAck.project?.description || 'Enterprise AI Assistant integrating context-aware codebase analysis.',
              category: selectedAck.project?.category || 'Artificial Intelligence',
              technologyStack: selectedAck.project?.technologyStack || ['React', 'Python', 'Vector DB'],
              deadline: selectedAck.project?.deadline || '2026-09-30'
            }}
            role={{
              title: selectedAck.role?.title || 'AI Engineer',
              department: selectedAck.role?.department || 'AI & Data Science',
              responsibilities: selectedAck.role?.responsibilities || [
                'Develop fine-tuned NLP pipelines and LLM inference models',
                'Architect vector search indexing with semantic embeddings',
                'Evaluate model accuracy, latency, and guardrails'
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
