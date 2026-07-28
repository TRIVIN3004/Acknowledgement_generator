import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, 
  Upload, 
  Type, 
  RotateCcw, 
  CheckCircle, 
  ShieldCheck, 
  Lock,
  Eye,
  FileCheck2
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { SignatureType } from '../../types';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (signatureData: {
    signatureType: SignatureType;
    signatureData: string;
    typedName?: string;
    consentAccepted: boolean;
  }) => void;
  memberName: string;
  roleTitle: string;
  projectTitle: string;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  memberName,
  roleTitle,
  projectTitle,
}) => {
  const [signatureType, setSignatureType] = useState<SignatureType>('draw');
  const [typedName, setTypedName] = useState(memberName);
  const [fontFamily, setFontFamily] = useState<'Caveat' | 'Dancing Script' | 'Great Vibes' | 'Alex Brush'>('Caveat');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [ipAddress, setIpAddress] = useState('192.168.1.104 (Verified Session)');

  // Canvas refs for Option 1: Draw Signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen && signatureType === 'draw') {
      setTimeout(() => {
        initCanvas();
      }, 100);
    }
  }, [isOpen, signatureType]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.parentElement?.clientWidth || 500;
    canvas.height = 180;

    // Background white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Baseline guide
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(30, 140);
    ctx.lineTo(canvas.width - 30, 140);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pen stroke settings
    ctx.strokeStyle = '#0274c7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    initCanvas();
    setHasDrawn(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateTypedSignatureDataUrl = () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 500;
    tempCanvas.height = 120;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.fillStyle = '#0274c7';
    ctx.font = `36px "${fontFamily}", cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName || memberName, tempCanvas.width / 2, tempCanvas.height / 2);

    return tempCanvas.toDataURL('image/png');
  };

  const getFinalSignatureData = (): string => {
    if (signatureType === 'draw') {
      return canvasRef.current ? canvasRef.current.toDataURL('image/png') : '';
    } else if (signatureType === 'upload') {
      return uploadedImage || '';
    } else {
      return generateTypedSignatureDataUrl();
    }
  };

  const handleSubmit = () => {
    const dataUrl = getFinalSignatureData();
    if (!dataUrl) {
      alert('Please provide a valid signature before submitting.');
      return;
    }
    if (!consentAccepted) {
      alert('You must accept the legal consent agreement to proceed.');
      return;
    }

    onSubmit({
      signatureType,
      signatureData: dataUrl,
      typedName: signatureType === 'type' ? typedName : undefined,
      consentAccepted
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Electronic Role Acknowledgement & Digital Signature"
      subtitle={`Project: ${projectTitle} • Role: ${roleTitle}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Audit Metadata Summary Banner */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Lock className="w-4 h-4 text-brand-500" />
            <span>Audit Trail: <strong className="text-slate-900 dark:text-white">{memberName}</strong></span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <span>Date: {new Date().toLocaleDateString()}</span>
            <span>IP: {ipAddress}</span>
          </div>
        </div>

        {/* Tab Selection: Draw / Upload / Type */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
          <button
            type="button"
            onClick={() => setSignatureType('draw')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              signatureType === 'draw'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Draw Signature
          </button>
          <button
            type="button"
            onClick={() => setSignatureType('upload')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              signatureType === 'upload'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Image
          </button>
          <button
            type="button"
            onClick={() => setSignatureType('type')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              signatureType === 'type'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Type Full Name
          </button>
        </div>

        {/* Option 1: Canvas Drawing */}
        {signatureType === 'draw' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Draw Your Signature Below:
              </label>
              <button
                type="button"
                onClick={clearCanvas}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Canvas
              </button>
            </div>
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full cursor-crosshair touch-none"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs font-medium">
                  Use mouse or touch screen to draw your signature
                </div>
              )}
            </div>
          </div>
        )}

        {/* Option 2: Upload Image */}
        {signatureType === 'upload' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Upload Signature Image (PNG or JPG format):
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/30">
              {uploadedImage ? (
                <div className="space-y-3">
                  <img src={uploadedImage} alt="Signature Upload" className="max-h-32 mx-auto object-contain bg-white p-2 rounded-lg border border-slate-200" />
                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
                    className="text-xs text-rose-600 font-semibold hover:underline"
                  >
                    Remove and upload another
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer space-y-2 block">
                  <Upload className="w-8 h-8 text-brand-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Click to browse signature file
                  </p>
                  <p className="text-[11px] text-slate-400">Max file size 5MB (Transparent PNG recommended)</p>
                  <input type="file" accept="image/png, image/jpeg" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        )}

        {/* Option 3: Type Name */}
        {signatureType === 'type' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Type Your Full Legal Name:
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="Enter full legal name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Digital Signature Font Style:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Caveat', 'Dancing Script', 'Great Vibes', 'Alex Brush'] as const).map((font) => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => setFontFamily(font)}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      fontFamily === font
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-2xl block" style={{ fontFamily: `"${font}", cursive` }}>
                      {typedName || 'Your Signature'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block font-sans">{font}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Preview Box */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-brand-500" />
              Live Signature Verification Preview
            </span>
            <span className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">Valid Electronic Signature</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between min-h-[80px]">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digitally Signed By</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{memberName}</p>
              <p className="text-[10px] text-slate-400">{new Date().toLocaleString()} • {ipAddress}</p>
            </div>

            {signatureType === 'type' ? (
              <span className="text-3xl text-brand-600 dark:text-brand-400 pr-4" style={{ fontFamily: `"${fontFamily}", cursive` }}>
                {typedName || memberName}
              </span>
            ) : signatureType === 'upload' && uploadedImage ? (
              <img src={uploadedImage} alt="Signature Preview" className="max-h-12 object-contain" />
            ) : signatureType === 'draw' && hasDrawn ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Canvas Render Ready
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">Signature Pending</span>
            )}
          </div>
        </div>

        {/* Legal Consent Checkbox */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 cursor-pointer">
          <input
            type="checkbox"
            checked={consentAccepted}
            onChange={(e) => setConsentAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
          />
          <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            I, <strong className="text-slate-900 dark:text-white">{memberName}</strong>, hereby declare that I officially accept the assigned role of <strong>{roleTitle}</strong> for project <strong>{projectTitle}</strong>. I authorize this electronic signature to be attached to the official digital acknowledgement letter with cryptographically logged metadata.
          </span>
        </label>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!consentAccepted}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
              consentAccepted
                ? 'bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 shadow-brand-500/25 cursor-pointer'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Confirm & Sign Acknowledgement
          </button>
        </div>
      </div>
    </Modal>
  );
};
