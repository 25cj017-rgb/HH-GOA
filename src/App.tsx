import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Share2, 
  Check, 
  Link as LinkIcon,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { drawPFPFrame, drawIDBadge, type ThemeSettings } from './utils/canvasRenderer';
import confetti from 'canvas-confetti';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { DownloadSuccessModal } from './components/DownloadSuccessModal';
import { Background3D } from './components/Background3D';

const BUILDER_CLASSES = [
  'Terminal Wizard',
  'Frontend Architect',
  'Smart Contract Sage',
  'AI Whisperer',
  'DevOps Cowboy',
  'Product Maestro',
  'Fullstack Ninja',
  'Pixel Alchemist',
  'Shitpost Specialist',
  'Hype Engineer'
];

const THEMES = [
  { name: 'Goa Retro', bg: '#0F2E1E', primary: '#F6EAD8', accent: '#DE612F' },
  { name: 'Cyberpunk', bg: '#1A1A2E', primary: '#E94560', accent: '#0F3460' },
  { name: 'Midnight', bg: '#0B0C10', primary: '#66FCF1', accent: '#45A29E' },
  { name: 'Vaporwave', bg: '#2B0F4C', primary: '#FF71CE', accent: '#01CDFE' },
  { name: 'Minimal', bg: '#FDFBF7', primary: '#2D4263', accent: '#C84B31' }
];

const FONTS = [
  { name: 'Monospace Retro', value: 'monospace' },
  { name: 'Space Grotesk', value: '"Space Grotesk", sans-serif' },
  { name: 'Anton Block', value: '"Anton", sans-serif' }
];

export default function App() {
  const [format, setFormat] = useState<'pfp' | 'badge'>('badge');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Workflow State
  const [isGenerated, setIsGenerated] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [builderClass, setBuilderClass] = useState('Terminal Wizard');
  const [skills, setSkills] = useState('');
  const [badgeId, setBadgeId] = useState('');
  
  const [qrLink, setQrLink] = useState('https://github.com/yourusername');
  const [qrImageElement, setQrImageElement] = useState<HTMLImageElement | null>(null);

  // References
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraFallbackInputRef = useRef<HTMLInputElement>(null);

  // States for Camera & Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [downloadImageUrl, setDownloadImageUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  
  // Twitter Gate
  const [hasSharedToX, setHasSharedToX] = useState(false);

  useEffect(() => {
    // Generate random 4 digit badge ID on mount
    const randomId = `#HH26-${Math.floor(1000 + Math.random() * 9000)}`;
    setBadgeId(randomId);
  }, []);

  const triggerNativeCamera = () => {
    if (cameraFallbackInputRef.current) {
      cameraFallbackInputRef.current.click();
    }
  };

  useEffect(() => {
    if (!qrLink.trim()) {
      setQrImageElement(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setQrImageElement(img);
    img.onerror = () => setQrImageElement(null);
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrLink.trim())}`;
  }, [qrLink]);

  useEffect(() => {
    if (isGenerated) {
      renderCanvas();
      if (document.fonts) {
        document.fonts.ready.then(() => renderCanvas());
      }
    }
  }, [isGenerated, format, imageElement, name, role, builderClass, skills, badgeId, qrImageElement]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use default values for preview if inputs are empty
    const details = { 
      name: name || 'Your Name', 
      role: role || 'Your Role', 
      builderClass, 
      skills: skills || 'Your Skills', 
      badgeId, 
      qrLink 
    };
    
    // Always use the default theme and font
    const themeSettings: ThemeSettings = {
      bg: THEMES[0].bg,
      primary: THEMES[0].primary,
      accent: THEMES[0].accent,
      font: FONTS[0].value
    };

    if (format === 'pfp') {
      drawPFPFrame(canvas, imageElement, details, themeSettings);
    } else {
      drawIDBadge(canvas, imageElement, details, qrImageElement, themeSettings);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      let processedFile: Blob = file;
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.heic') || fileName.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
        const heic2any = (await import('heic2any')).default;
        const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
        processedFile = Array.isArray(result) ? result[0] : result;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const img = new Image();
          img.onload = () => {
            setImageElement(img);
            setImageSrc(event.target!.result as string);
            setIsLoading(false);
          };
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Error loading photo:', error);
      alert('Failed to process photo. Please try a standard JPG/PNG.');
      setIsLoading(false);
    }
  };

  const executeDownload = (showModal = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const filename = `hh-goa-${randomNum}.png`;
      setDownloadFilename(filename);

      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (showModal) {
        setDownloadImageUrl(dataUrl);
        confetti({ particleCount: 100, spread: 60, colors: ['#DE612F', '#0F2E1E', '#E5F085'] });
      }
    } catch (err) {
      console.error('Download generation error:', err);
      alert('Could not export image. The canvas may be tainted due to external image CORS restrictions.');
    }
  };

  const handleShareToX = () => {
    executeDownload(false);
    setHasSharedToX(true);
    const tweetText = `Just generated my Hacker House Goa 2026 ${
      format === 'pfp' ? 'PFP Frame' : 'Wanted Poster'
    }! Ready to build in Goa, ship from paradise 🌴🚀\n\n%23FrameInGoa`;
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    setTimeout(() => {
      window.open(xUrl, '_blank');
    }, 500);
  };

  const handleGenerate = () => {
    if (!imageSrc) {
      alert("Please upload a photo first!");
      return;
    }
    setIsGenerated(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Background3D />
      <div className="min-h-screen bg-transparent text-[#0F2E1E] selection:bg-[#DE612F] selection:text-white pb-16 font-sans relative overflow-x-hidden z-10">
        
        {/* HEADER SECTION */}
        <header className="border-b-4 border-[#0F2E1E] bg-[#0F2E1E]/95 backdrop-blur py-4 px-4 sticky top-0 z-40 shadow-[0_4px_0_rgba(15,46,30,0.15)]">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5F085] border-3 border-[#0F2E1E] flex items-center justify-center font-anton text-[#0F2E1E] text-xl shadow-[2px_2px_0px_#DE612F] transform -rotate-6">
                HH
              </div>
              <div>
                <h1 className="text-2xl font-anton text-[#E5F085] uppercase tracking-tighter m-0 leading-none">
                  HACKER HOUSE GOA
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <main className="max-w-3xl mx-auto px-4 mt-8">
          
          {!isGenerated && (
            <div className="flex flex-col space-y-6">
              <div className="text-center mb-4 flex flex-col items-center bg-[#FDFBF7] border-4 border-[#0F2E1E] p-6 rounded-2xl shadow-[6px_6px_0px_#0F2E1E] transform rotate-1">
                <span className="text-4xl md:text-5xl font-anton uppercase tracking-tighter text-[#0F2E1E] select-none leading-none">
                  GENERATE IDENTITY
                </span>
                <p className="text-xs font-mono mt-2 text-[#0F2E1E]/70 font-bold uppercase tracking-wider">
                  WANTED: DEVELOPERS, DESIGNERS & SHITPOSTERS
                </p>
              </div>

              {/* 1. Upload Photo card */}
              <section className="bg-[#FDFBF7] border-4 border-[#0F2E1E] p-6 rounded-2xl shadow-[4px_4px_0px_#0F2E1E] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-anton uppercase tracking-tight text-[#0F2E1E] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#DE612F] text-[#FDFBF7] border-2 border-[#0F2E1E] flex items-center justify-center text-xs font-mono">1</span>
                    UPLOAD PHOTO
                  </h3>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <label className={`flex-1 relative flex flex-col items-center justify-center p-6 border-4 border-dashed rounded-xl cursor-pointer transition-all group ${imageSrc ? 'border-[#4CAF50] bg-[#4CAF50]/10' : 'border-[#0F2E1E]/30 hover:border-[#DE612F] bg-[#E5F085]/10 hover:bg-[#E5F085]/20'}`}>
                    <input type="file" accept="image/*,.heic,.heif" onChange={handleImageUpload} className="hidden" />
                    {imageSrc ? (
                      <>
                        <CheckCircle2 className="w-8 h-8 text-[#4CAF50] mb-2" />
                        <span className="text-sm font-mono font-bold text-[#4CAF50]">
                          Photo Uploaded Successfully! ✅
                        </span>
                        <span className="text-[10px] font-mono text-[#0F2E1E]/60 mt-1">Tap to change</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[#0F2E1E]/60 group-hover:text-[#DE612F] transition-all mb-2" />
                        <span className="text-sm font-mono font-bold text-[#0F2E1E] group-hover:text-[#DE612F]">
                          {isLoading ? 'Processing...' : 'Choose File'}
                        </span>
                      </>
                    )}
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                      if (isMobile) {
                        triggerNativeCamera();
                      } else {
                        const hasWebRTC = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
                        if (hasWebRTC) setIsCameraOpen(true);
                        else alert("Camera access blocked. Try uploading a file.");
                      }
                    }}
                    className="flex-1 flex flex-col items-center justify-center gap-2 p-6 bg-[#E5F085] hover:bg-[#DE612F] text-[#0F2E1E] hover:text-[#FDFBF7] font-anton uppercase tracking-wider text-sm rounded-xl border-3 border-[#0F2E1E] shadow-[3px_3px_0px_#0F2E1E] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0F2E1E] transition-all"
                  >
                    <Camera className="w-8 h-8" />
                    Take Live Photo
                  </button>

                  <input ref={cameraFallbackInputRef} type="file" accept="image/*,.heic,.heif" capture="user" onChange={handleImageUpload} className="hidden" />
                </div>
              </section>

              {/* 2. Format Selector card */}
              <section className="bg-[#FDFBF7] border-4 border-[#0F2E1E] p-6 rounded-2xl shadow-[4px_4px_0px_#0F2E1E] transition-all">
                <h3 className="text-md font-anton uppercase tracking-tight text-[#0F2E1E] flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#DE612F] text-[#FDFBF7] border-2 border-[#0F2E1E] flex items-center justify-center text-xs font-mono">2</span>
                  CHOOSE TEMPLATE FORMAT
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormat('badge')}
                    className={`flex items-center gap-4 p-4 rounded-xl border-3 text-left transition-all ${
                      format === 'badge' ? 'border-[#0F2E1E] bg-[#DE612F] text-[#FDFBF7] shadow-[3px_3px_0_#0F2E1E]' : 'border-[#0F2E1E]/30 bg-[#FDFBF7] hover:bg-[#E5F085]/20 text-[#0F2E1E]/70'
                    }`}
                  >
                    <div className="w-12 h-12 shrink-0">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <rect x="20" y="10" width="60" height="80" rx="4" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="4"/>
                        <rect x="35" y="20" width="30" height="8" fill="currentColor"/>
                        <rect x="30" y="35" width="40" height="35" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="50" cy="52" r="10" fill="currentColor" fillOpacity="0.5"/>
                        <rect x="30" y="75" width="40" height="4" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-bold text-sm tracking-tight font-mono flex items-center justify-between gap-1.5">
                        Format B: Wanted Poster
                        {format === 'badge' && <Check className="w-4 h-4 text-[#E5F085]" />}
                      </span>
                      <span className={`text-[10px] font-mono mt-0.5 leading-tight ${format === 'badge' ? 'text-[#FDFBF7]/80' : 'text-[#0F2E1E]/50'}`}>
                        Vintage woodcut sketch on old paper
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('pfp')}
                    className={`flex items-center gap-4 p-4 rounded-xl border-3 text-left transition-all ${
                      format === 'pfp' ? 'border-[#0F2E1E] bg-[#DE612F] text-[#FDFBF7] shadow-[3px_3px_0_#0F2E1E]' : 'border-[#0F2E1E]/30 bg-[#FDFBF7] hover:bg-[#E5F085]/20 text-[#0F2E1E]/70'
                    }`}
                  >
                    <div className="w-12 h-12 shrink-0">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <rect width="100" height="100" rx="20" fill="currentColor" fillOpacity="0.1"/>
                        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="4"/>
                        <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                        <rect x="30" y="80" width="40" height="12" rx="4" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-bold text-sm tracking-tight font-mono flex items-center justify-between gap-1.5">
                        Format A: PFP Frame
                        {format === 'pfp' && <Check className="w-4 h-4 text-[#E5F085]" />}
                      </span>
                      <span className={`text-[10px] font-mono mt-0.5 leading-tight ${format === 'pfp' ? 'text-[#FDFBF7]/80' : 'text-[#0F2E1E]/50'}`}>
                        Circular profile pic with status ribbon
                      </span>
                    </div>
                  </button>
                </div>
              </section>

              {/* 3. Form Input Details card */}
              <section className="bg-[#FDFBF7] border-4 border-[#0F2E1E] p-6 rounded-2xl shadow-[4px_4px_0px_#0F2E1E] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-anton uppercase tracking-tight text-[#0F2E1E] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#DE612F] text-[#FDFBF7] border-2 border-[#0F2E1E] flex items-center justify-center text-xs font-mono">3</span>
                    WANTED POSTER DETAILS
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#0F2E1E]/80 font-bold">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={24}
                      placeholder="Enter your name"
                      className="bg-[#FDFBF7] border-3 border-[#0F2E1E] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#DE612F] transition-all text-[#0F2E1E] font-mono font-bold shadow-[2px_2px_0px_#0F2E1E]"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#0F2E1E]/80 font-bold flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5 text-[#DE612F]" /> Scannable QR Code (e.g. GitHub Link)
                    </label>
                    <input
                      type="text"
                      value={qrLink}
                      onChange={(e) => setQrLink(e.target.value)}
                      placeholder="https://github.com/yourusername"
                      className="bg-[#FDFBF7] border-3 border-[#0F2E1E] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#DE612F] transition-all text-[#0F2E1E] font-mono font-bold shadow-[2px_2px_0px_#0F2E1E]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#0F2E1E]/80 font-bold">Primary Role / Title</label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        maxLength={24}
                        placeholder="e.g. Software Developer"
                        className="bg-[#FDFBF7] border-3 border-[#0F2E1E] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#DE612F] transition-all text-[#0F2E1E] font-mono font-bold shadow-[2px_2px_0px_#0F2E1E]"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#0F2E1E]/80 font-bold">Builder Class / Persona</label>
                      <select
                        value={builderClass}
                        onChange={(e) => setBuilderClass(e.target.value)}
                        className="bg-[#FDFBF7] border-3 border-[#0F2E1E] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#DE612F] transition-all text-[#0F2E1E] font-mono font-bold shadow-[2px_2px_0px_#0F2E1E]"
                      >
                        {BUILDER_CLASSES.map((cls, idx) => (
                          <option key={idx} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#0F2E1E]/80 font-bold">Tech Stack / Skills</label>
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        maxLength={32}
                        placeholder="e.g. React, Node, Rust"
                        className="bg-[#FDFBF7] border-3 border-[#0F2E1E] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#DE612F] transition-all text-[#0F2E1E] font-mono font-bold shadow-[2px_2px_0px_#0F2E1E]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full mt-6 py-4 bg-[#E5F085] hover:bg-[#DE612F] text-[#0F2E1E] hover:text-[#FDFBF7] font-anton uppercase tracking-widest text-xl rounded-xl border-4 border-[#0F2E1E] shadow-[6px_6px_0px_#0F2E1E] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0F2E1E] transition-all"
                >
                  Generate Identity
                </button>
              </section>
            </div>
          )}

          {isGenerated && (
            <div className="flex flex-col space-y-6">
              {/* PREVIEW */}
              <div className="bg-[#FDFBF7] border-4 border-[#0F2E1E] p-6 rounded-2xl shadow-[6px_6px_0px_#0F2E1E] flex flex-col items-center">
                <div className="flex w-full justify-between items-center border-b-2 border-[#0F2E1E]/10 pb-3 mb-5">
                  <h3 className="text-lg font-anton uppercase tracking-tight text-[#0F2E1E]">
                    YOUR IDENTITY
                  </h3>
                  <button
                    onClick={() => setIsGenerated(false)}
                    className="flex items-center gap-1 text-xs font-mono font-bold text-[#DE612F] hover:text-[#0F2E1E] transition-colors"
                  >
                    ← Edit Details
                  </button>
                </div>

                <div className="w-full flex justify-center bg-[#E5F085]/20 p-4 rounded-xl border-3 border-[#0F2E1E] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]">
                  <canvas 
                    ref={canvasRef} 
                    className="max-w-full rounded border-2 border-[#0F2E1E] shadow-md object-contain bg-[#0F2E1E]" 
                    style={{
                      maxHeight: format === 'badge' ? '500px' : '400px',
                      aspectRatio: format === 'badge' ? '2/3' : '1/1'
                    }}
                  />
                </div>
              </div>

              {/* DOWNLOAD & SHARE */}
              <section className="bg-[#FDFBF7] border-4 border-[#0F2E1E] p-6 rounded-2xl shadow-[4px_4px_0px_#0F2E1E] transition-all text-center">
                <h3 className="text-lg font-anton uppercase tracking-tight text-[#0F2E1E] mb-2">
                  READY TO SHIP
                </h3>
                <p className="text-xs font-mono text-[#0F2E1E]/70 font-bold mb-6">
                  Share your identity on Twitter to unlock the full-resolution download!
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <button
                    type="button"
                    onClick={handleShareToX}
                    className="flex items-center justify-center gap-2 py-4 px-6 bg-[#000000] hover:bg-gray-800 text-white font-anton uppercase tracking-tight text-xl rounded-xl border-3 border-[#0F2E1E] shadow-[4px_4px_0px_#0F2E1E] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0F2E1E] transition-all"
                  >
                    <Share2 className="w-6 h-6 stroke-[3px]" />
                    Share to Unlock Download
                  </button>

                  <button
                    type="button"
                    onClick={() => executeDownload()}
                    disabled={!hasSharedToX}
                    className={`flex items-center justify-center gap-2 py-3 px-6 font-anton uppercase tracking-tight text-lg rounded-xl border-3 border-[#0F2E1E] transition-all ${
                      hasSharedToX 
                      ? 'bg-[#DE612F] hover:bg-[#DE612F]/90 text-[#FDFBF7] shadow-[4px_4px_0px_#0F2E1E] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0F2E1E] cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 shadow-none cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Download className="w-5 h-5 stroke-[3px]" />
                    {hasSharedToX ? 'Download Graphic' : 'Locked'}
                  </button>
                </div>
              </section>
            </div>
          )}

        </main>

        {/* FOOTER */}
        <footer className="max-w-3xl mx-auto px-4 mt-16 border-t-2 border-[#0F2E1E]/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#0F2E1E]/60 font-medium pb-8">
          <span>© 2026 Hacker House Goa. Built with 💚 for the developer community.</span>
          <div className="flex gap-4">
            <a href="https://hhgoa.com" target="_blank" rel="noreferrer" className="hover:text-[#DE612F] transition-colors font-bold">hhgoa.com</a>
            <span>•</span>
            <span className="text-[#DE612F] font-bold">#FrameInGoa</span>
          </div>
        </footer>

        {isCameraOpen && (
          <CameraCaptureModal
            onClose={() => setIsCameraOpen(false)}
            onCapture={(dataUrl) => {
              const img = new Image();
              img.onload = () => {
                setImageElement(img);
                setImageSrc(dataUrl);
              };
              img.src = dataUrl;
              setIsCameraOpen(false);
            }}
            onFallbackTrigger={triggerNativeCamera}
          />
        )}

        {downloadImageUrl && (
          <DownloadSuccessModal
            imageUrl={downloadImageUrl}
            filename={downloadFilename}
            onClose={() => setDownloadImageUrl(null)}
          />
        )}

      </div>
    </>
  );
}
