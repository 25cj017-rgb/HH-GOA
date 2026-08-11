import React from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface DownloadSuccessModalProps {
  imageUrl: string;
  filename: string;
  onClose: () => void;
}

export const DownloadSuccessModal: React.FC<DownloadSuccessModalProps> = ({
  imageUrl,
  filename,
  onClose,
}) => {
  const handleDownloadAgain = () => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2E1E]/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#FDFBF7] border-4 border-[#0F2E1E] rounded-2xl w-full max-w-md overflow-hidden shadow-[8px_8px_0px_#0F2E1E] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0f2e1e] text-[#E5F085] px-4 py-3 border-b-4 border-[#0F2E1E] flex items-center justify-between">
          <span className="font-anton uppercase tracking-wider text-sm flex items-center gap-1.5">
            🔥 Bounty Exported! 🔥
          </span>
          <button 
            onClick={onClose} 
            className="text-[#E5F085] hover:text-[#DE612F] transition-colors p-1 border-2 border-transparent hover:border-[#DE612F] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex flex-col space-y-4">
          
          {/* Mobile instructions */}
          <div className="bg-[#E5F085]/30 border-2 border-[#0F2E1E] p-3.5 rounded-xl flex items-start gap-3 shadow-[2px_2px_0px_#0F2E1E]">
            <Smartphone className="w-6 h-6 text-[#DE612F] flex-shrink-0 mt-0.5" />
            <div className="text-xs font-mono text-[#0F2E1E] leading-relaxed">
              <span className="font-bold uppercase text-[#DE612F]">Mobile Users:</span>
              <p className="mt-1 font-bold">
                Tap and hold (long press) the image below, then select <span className="underline">"Save Image"</span> or <span className="underline">"Add to Photos"</span>.
              </p>
            </div>
          </div>

          {/* Desktop instructions */}
          <div className="text-center font-mono text-[11px] text-[#0F2E1E]/60 leading-normal">
            💻 Desktop users: Your download should have started. If it didn't, click "Download Again" below.
          </div>

          {/* Rendered Image */}
          <div className="relative bg-[#E5F085]/10 p-3 rounded-xl border-3 border-[#0F2E1E] flex justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]">
            <img 
              src={imageUrl} 
              alt="Generated Badge" 
              className="max-h-[40vh] w-auto rounded border-2 border-[#0F2E1E] shadow-sm object-contain"
            />
          </div>

          <div className="text-[10px] text-center font-mono text-[#0F2E1E]/50 leading-relaxed border-t border-[#0F2E1E]/10 pt-3">
            ⚠️ <span className="font-bold">In-app browsers</span> (like Twitter/X or Instagram) restrict direct file downloads. Long pressing the image is the most reliable way to save it!
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-[#E5F085]/20 p-4 border-t-3 border-[#0F2E1E] flex gap-3">
          <button
            type="button"
            onClick={handleDownloadAgain}
            className="flex-1 py-2.5 px-4 bg-[#E5F085] hover:bg-[#DE612F] text-[#0F2E1E] hover:text-[#FDFBF7] font-anton uppercase tracking-wider text-sm rounded-xl border-3 border-[#0F2E1E] shadow-[3px_3px_0px_#0F2E1E] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0F2E1E] transition-all"
          >
            <Download className="w-4 h-4 inline-block mr-1.5 -mt-1" />
            Download Again
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 bg-[#FDFBF7] hover:bg-gray-100 text-[#0F2E1E] font-anton uppercase tracking-wider text-sm rounded-xl border-3 border-[#0F2E1E] shadow-[3px_3px_0px_#0F2E1E] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0F2E1E] transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
