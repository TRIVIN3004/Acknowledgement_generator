import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Calendar, 
  Globe, 
  Building2, 
  ArrowLeft,
  Lock
} from 'lucide-react';
import { api } from '../services/api';

export const VerificationPage: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const [searchHash, setSearchHash] = useState(hash === 'demo' ? 'PRDAMS-ACK-89F3A19C' : (hash || 'PRDAMS-ACK-89F3A19C'));
  const [loading, setLoading] = useState(false);
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [error, setError] = useState('');

  const runVerification = async (codeToVerify: string) => {
    if (!codeToVerify) return;
    setLoading(true);
    setError('');
    setVerifiedData(null);

    try {
      const res = await api.verifyQRCode(codeToVerify);
      if (res.success && res.verifiedData) {
        setVerifiedData(res.verificationData);
      } else {
        setError('Verification hash not found in system audit database.');
      }
    } catch (e: any) {
      setError(e.message || 'Verification hash not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runVerification(searchHash);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runVerification(searchHash);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 py-10 bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Verification Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center shadow-md">
              <img src="/logo.png" alt="Nexora Technologies Logo" className="h-9 object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Nexora Technologies Verification Portal
              </h2>
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                "Building Tomorrow, Today"
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                placeholder="Enter Verification Hash (e.g. PRDAMS-ACK-89F3A19C)"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              {loading ? 'Verifying...' : 'Verify Hash'}
            </button>
          </form>
        </div>

        {/* Verification Result Card */}
        {verifiedData && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/30 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">VALID & AUTHENTICATED DOCUMENT</h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Cryptographic Hash Verified in Audit Registry</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400">
                {verifiedData.hash}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signatory Roster Data</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{verifiedData.member?.name}</p>
                <p className="text-slate-500">ID: {verifiedData.member?.memberId}</p>
                <p className="text-slate-500">{verifiedData.member?.email}</p>
                <p className="text-slate-500">{verifiedData.member?.college}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allocated Project & Role</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{verifiedData.project?.title}</p>
                <p className="text-brand-600 dark:text-brand-400 font-semibold">Role: {verifiedData.role?.title}</p>
                <p className="text-slate-500">Department: {verifiedData.role?.department}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/40 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  Sign Timestamp:
                </span>
                <span className="font-mono text-slate-900 dark:text-white">{new Date(verifiedData.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Globe className="w-4 h-4 text-brand-500" />
                  Originated IP Address:
                </span>
                <span className="font-mono text-slate-900 dark:text-white">{verifiedData.ipAddress}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Lock className="w-4 h-4 text-brand-500" />
                  Electronic Consent Logged:
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">VERIFIED</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">Verification Record Not Found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The provided hash ({searchHash}) could not be verified in the active system audit logs. Please check the spelling or contact system admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
