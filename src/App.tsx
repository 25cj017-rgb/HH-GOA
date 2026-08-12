import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Share2, 
  RefreshCw, 
  Check, 
  Link as LinkIcon,
  Camera,
  Palette
} from 'lucide-react';
import { drawPFPFrame, drawIDBadge, type ThemeSettings } from './utils/canvasRenderer';
import confetti from 'canvas-confetti';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { DownloadSuccessModal } from './components/DownloadSuccessModal';
import { Background3D } from './components/Background3D';

const DEMO_AVATARS = [
  {
    name: 'Atul Gangwar',
    role: 'Terminal Wizard',
    skills: 'Rust, Go, Web3',
    qrLink: 'https://github.com/atul',
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%230F2E1E"/><circle cx="50" cy="45" r="22" fill="%23FFDD00"/><path d="M50 23 L28 42 H72 Z" fill="%23E91E63"/><rect x="36" y="38" width="10" height="6" fill="%230F2E1E"/><rect x="54" y="38" width="10" height="6" fill="%230F2E1E"/><rect x="46" y="41" width="8" height="2" fill="%230F2E1E"/><path d="M30 75 C30 62 40 58 50 58 C60 58 70 62 70 75 Z" fill="%23FDFBF7"/></svg>`
  },
  {
    name: 'Dev Nomad',
    role: 'Frontend Architect',
    skills: 'React, Tailwind, CSS',
    qrLink: 'https://twitter.com/nomad',
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%23E91E63"/><circle cx="50" cy="45" r="22" fill="%23FDFBF7"/><path d="M50 23 L25 35 L75 35 Z" fill="%23FFDD00"/><rect x="36" y="42" width="8" height="4" rx="2" fill="%230F2E1E"/><rect x="56" y="42" width="8" height="4" rx="2" fill="%230F2E1E"/><path d="M42 51 Q50 56 58 51" stroke="%230F2E1E" stroke-width="2" fill="none"/><path d="M30 78 C30 65 40 60 50 60 C60 60 70 65 70 78 Z" fill="%23FFDD00"/></svg>`
  },
  {
    name: 'Cyber Shipper',
    role: 'Smart Contract Sage',
    skills: 'Solidity, TS, DevOps',
    qrLink: 'https://hhgoa.com',
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%23FFDD00"/><circle cx="50" cy="45" r="22" fill="%230F2E1E"/><rect x="36" y="42" width="8" height="4" fill="%23FDFBF7"/><rect x="56" y="42" width="8" height="4" fill="%23FDFBF7"/><path d="M24 45 Q50 20 76 45" stroke="%23E91E63" stroke-width="5" fill="none"/><rect x="22" y="40" width="8" height="14" rx="4" fill="%23E91E63"/><rect x="70" y="40" width="8" height="14" rx="4" fill="%23E91E63"/><path d="M30 78 C30 65 40 60 50 60 C60 60 70 65 70 78 Z" fill="%23FDFBF7"/></svg>`
  }
];

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
  const [, setImageSrc] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Customization Session State
  const [selectedThemeIdx, setSelectedThemeIdx] = useState(0);
  const [selectedFontIdx, setSelectedFontIdx] = useState(0);

  // Form State
  const [name, setName] = useState('Atul Gangwar');
  const [role, setRole] = useState('Software Developer');
  const [builderClass, setBuilderClass] = useState('Terminal Wizard');
  const [skills, setSkills] = useState('Rust, Go, Web3');
  const [badgeId, setBadgeId] = useState('#HH26-5703');
  
  const [qrLink, setQrLink] = useState('https://hhgoa.com');
  const [qrImageElement, setQrImageElement] = useState<HTMLImageElement | null>(null);

  // References
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const cameraFallbackInputRef = useRef<HTMLInputElement>(null);

  // States for Camera & Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [downloadImageUrl, setDownloadImageUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  
  // Twitter Gate
  const [hasSharedToX, setHasSharedToX] = useState(false);

  const scrollToPreview = () => {
    if (window.innerWidth < 1024 && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const triggerNativeCamera = () => {
    if (cameraFallbackInputRef.current) {
      cameraFallbackInputRef.current.click();
    }
  };

  useEffect(() => {
    loadDemoAvatar(0);
  }, []);

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
    renderCanvas();
    if (document.fonts) {
      document.fonts.ready.then(() => renderCanvas());
    }
  }, [format, imageElement, name, role, builderClass, skills, badgeId, qrImageElement, selectedThemeIdx, selectedFontIdx]);

  const loadDemoAvatar = (index: number) => {
    setIsLoading(true);
    const demo = DEMO_AVATARS[index];
    setName(demo.name);
    setRole(demo.role);
    setBuilderClass(demo.role);
    setSkills(demo.skills);
    setQrLink(demo.qrLink);
    setBadgeId(`#HH26-${Math.floor(1000 + Math.random() * 9000)}`);

    const img = new Image();
    img.onload = () => {
      setImageElement(img);
      setImageSrc(demo.src);
      setIsLoading(false);
      scrollToPreview();
    };
    img.src = demo.src;
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const details = { name, role, builderClass, skills, badgeId, qrLink };
    const themeSettings: ThemeSettings = {
      bg: THEMES[selectedThemeIdx].bg,
      primary: THEMES[selectedThemeIdx].primary,
      accent: THEMES[selectedThemeIdx].accent,
      font: FONTS[selectedFontIdx].value
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
      if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
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
            scrollToPreview();
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

  const handleRandomize = () => {
    const randomClass = BUILDER_CLASSES[Math.floor(Math.random() * BUILDER_CLASSES.length)];
    const randomId = `#HH26-${Math.floor(1000 + Math.random() * 9000)}`;
    setBuilderClass(randomClass);
    setBadgeId(randomId);
    scrollToPreview();
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
    // 1. Auto-download image so they have it ready to paste/attach
    executeDownload(false);
    
    // 2. Unlock regular download button
    setHasSharedToX(true);

    // 3. Redirect to Twitter with text & hashtag
    const tweetText = `Just generated my Hacker House Goa 2026 ${
      format === 'pfp' ? 'PFP Frame' : 'Wanted Poster'
    }! Ready to build in Goa, ship from paradise 🌴🚀\n\n%23FrameInGoa`;
    
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    
    // Slight delay so the download triggers before the window changes focus
    setTimeout(() => {
      window.open(xUrl, '_blank');
    }, 500);
  };

  return (
    <>
      <Background3D />
      <div className="min-h-screen bg-transparent text-[#0F2E1E] selection:bg-[#DE612F] selection:text-white pb-16 font-sans relative overflow-x-hidden z-10">
        
        {/* HEADER SECTION */}
        <header className="border-b-4 border-[#0F2E1E] bg-[#0F2E1E]/95 backdrop-blur py-6 px-4 sticky top-0 z-40 shadow-[0_4px_0_rgba(15,46,30,0.15)]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E5F085] border-3 border-[#0F2E1E] flex items-center justify-center font-anton text-[#0F2E1E] text-2xl shadow-[3px_3px_0px_#DE612F] transform -rotate-6">
                HH
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-anton text-[#E5F085] uppercase tracking-tighter m-0 leading-none">
                    HACKER HOUSE GOA 2026
                  </h1>
                  <span className="hidden sm:inline-block bg-[#DE612F] text-[#FDFBF7] text-[10px] font-mono font-bold px-2 py-0.5 rounded border-2 border-[#0F2E1E] shadow-[1px_1px_0_#0F2E1E]">
                    PORTAL
                  </span>
                </div>
                <p className="text-xs text-[#E5F085]/80 font-mono mt-1">
                  BUILD IN GOA, SHIP FROM PARADISE • OFFICIAL PFP & WANTED POSTER GENERATOR
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href="https://hhgoa.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-mono font-bold text-[#FDFBF7] bg-[#DE612F] hover:bg-[#DE612F]/90 py-2.5 px-5 rounded-xl border-2 border-[#0F2E1E] shadow-[3px_3px_0px_#0F2E1E] hover:shadow-[1px_1px_0px_#0F2E1E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Official Website
              </a>
            </div>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <main className="max-w-6xl mx-auto px-4 mt-10">
          
          {/* Intro Tagline Card */}
          <div className="text-center mb-10 flex flex-col items-center max-w-2xl mx-auto bg-[#FDFBF7] border-4 border-[#0F2E1E] p-6 rounded-2xl shadow-[6px_6px_0px_#0F2E1E] transform rotate-1">
            <span className="text-4xl md:text-6xl font-anton uppercase tracking-tighter text-[#0F2E1E] select-none leading-none">
              GENERATE IDENTITY
            </span>
            <p className="text-xs font-mono mt-1 text-[#0F2E1E]/70 font-bold uppercase tracking-wider">
              WANTED: DEVELOPERS, DESIGNERS & SHITPOSTERS
            </p>
            <span className="bg-[#DE612F] text-[#FDFBF7] text-md font-bold font-mono px-4 py-1 rounded-lg border-3 border-[#0F2E1E] shadow-[2px_2px_0_#0F2E1E] transform -rotate-2 mt-3 select-none">
              #FrameInGoa
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: EDITOR */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              
              {/* 1. Upload Photo card */}
              <section className="bg-[#FDFBF7] border-4 border-[#0F2E1E] p-6 rounded-2xl shadow-[6px_6px_0px_#0F2E1E] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-anton uppercase tracking-tight text-[#0F2E1E] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#DE612F] text-[#FDFBF7] border-2 border-[#0F2E1E] flex items-center justify-center text-xs font-mono">1</span>
                    UPLOAD BADGE PHOTO
                  </h3>
                  <span className="text-[10px] font-mono text-[#0F2E1E]/60">(Auto-cropping enabled)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-3">
                    <label className="relative flex flex-col items-center justify-center p-4 border-4 border-dashed border-[#0F2E1E]/30 hover:border-[#DE612F] bg-[#E5F085]/10 hover:bg-[#E5F085]/20 rounded-xl cursor-pointer transition-all group">
                      <input type="file" accept="image/*,.heic" onChange={handleImageUpload} className="hidden" />
                      <Upload className="w-6 h-6 text-[#0F2E1E]/60 group-hover:text-[#DE612F] transition-all mb-1" />
                      <span className="text-xs font-mono font-bold text-[#0F2E1E] group-hover:text-[#DE612F]">
                        {isLoading ? 'Processing...' : 'Upload Photo'}
                      </span>
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
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-[#E5F085] hover:bg-[#DE612F] text-[#0F2E1E] hover:text-[#FDFBF7] font-anton uppercase tracking-wider text-sm rounded-xl border-3 border-[#0F2E1E] shadow-[3px_3px_0px_#0F2E1E] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0F2E1E] transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      Take Live Photo
                    </button>

                    <input ref={cameraFallbackInputRef} type="file" accept="image/*" capture="user" onChange={handleImageUpload} className="hidden" />
                  </div>

                  <div className="flex flex-col justify-center space-y-3 bg-[#E5F085]/30 p-4 rounded-xl border-2 border-[#0F2E1E]/10">
                    <span className="text-[11px] font-mono text-[#0F2E1E] uppercase tracking-wider font-bold">
                      💡 Try 1-Click Demo Avatar:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {DEMO_AVATARS.map((avatar, idx) => (
                        <button key={idx} onClick={() => loadDemoAvatar(idx)} className="flex flex-col items-center p-2 rounded-lg bg-[#FDFBF7] hover:bg-[#E5F085] border-2 border-[#0F2E1E]/30 hover:border-[#0F2E1E] transition-all">
                          <div className="w-10 h-10 rounded-full overflow-hidden mb-1.5 border-2 border-[#0F2E1E]/50">
                            <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[9px] font-mono text-[#0F2E1E] font-bold truncate w-full text-center">
                            {avatar.name.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Customization Session */}
              <section className="bg-[#FDFBF7] border-4 border-[#0F2E1E] p-6 rounded-2xl shadow-[6px_6px_0px_#0F2E1E] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-anton uppercase tracking-tight text-[#0F2E1E] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#DE612F] text-[#FDFBF7] border-2 border-[#0F2E1E] flex items-center justify-center text-xs font-mono"><Palette className="w-3.5 h-3.5" /></span>
                    CUSTOMIZATION
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#0F2E1E]/80 font-bold mb-2 block">Color Palette</label>
                    <div className="flex flex-wrap gap-2">
                      {THEMES.map((t, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => { setSelectedThemeIdx(idx); scrollToPreview(); }}
                          className={`px-3 py-1.5 rounded-lg border-2 font-mono text-xs font-bold transition-all flex items-center gap-2 ${selectedThemeIdx === idx ? 'border-[#0F2E1E] shadow-[2px_2px_0px_#0F2E1E] -translate-y-[2px]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                          style={{ backgroundColor: t.bg, color: t.primary }}
                        >
                          <span className="w-3 h-3 rounded-full border border-current" style={{ backgroundColor: t.accent }}></span>
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#0F2E1E]/80 font-bold mb-2 block">Typography</label>
                    <div className="flex flex-wrap gap-2">
                      {FONTS.map((f, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => { setSelectedFontIdx(idx); scrollToPreview(); }}
                          className={`px-3 py-1.5 rounded-lg border-2 font-mono text-xs font-bold transition-all ${selectedFontIdx === idx ? 'border-[#0F2E1E] bg-[#DE612F] text-white shadow-[2px_2px_0px_#0F2E1E]' : 'border-[#0F2E1E]/20 text-[#0F2E1E] hover:border-[#0F2E1E]/50'}`}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Format Selector card */}
              <section className="bg-[#FDFBF7] border-4 border-[#0F2E1E] p-6 rounded-2xl shadow-[6px_6px_0px_#0F2E1E] transition-all">
                <h3 className="text-md font-anton uppercase tracking-tight text-[#0F2E1E] flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#DE612F] text-[#FDFBF7] border-2 border-[#0F2E1E] flex items-center justify-center text-xs font-mono">2</span>
                  CHOOSE TEMPLATE FORMAT
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => { setFormat('badge'); scrollToPreview(); }}
                    className={`flex flex-col items-start p-4 rounded-xl border-3 text-left transition-all ${
                      format === 'badge' ? 'border-[#0F2E1E] bg-[#DE612F] text-[#FDFBF7] shadow-[3px_3px_0_#0F2E1E]' : 'border-[#0F2E1E]/30 bg-[#FDFBF7] hover:bg-[#E5F085]/20 text-[#0F2E1E]/70'
                    }`}
                  >
                    <span className="font-bold text-sm tracking-tight font-mono flex items-center gap-1.5">
                      Format B: Wanted Poster
                      {format === 'badge' && <Check className="w-4 h-4 text-[#E5F085]" />}
                    </span>
                    <span className={`text-[11px] font-mono mt-1 leading-normal ${format === 'badge' ? 'text-[#FDFBF7]/90' : 'text-[#0F2E1E]/50'}`}>
                      Retro wanted poster featuring your photo as a sepia-toned mugshot, custom bounty reward, and scannable profile QR code.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setFormat('pfp'); scrollToPreview(); }}
                    className={`flex flex-col items-start p-4 rounded-xl border-3 text-left transition-all ${
                      format === 'pfp' ? 'border-[#0F2E1E] bg-[#DE612F] text-[#FDFBF7] shadow-[3px_3px_0_#0F2E1E]' : 'border-[#0F2E1E]/30 bg-[#FDFBF7] hover:bg-[#E5F085]/20 text-[#0F2E1E]/70'
                    }`}
                  >
                    <span className="font-bold text-sm tracking-tight font-mono flex items-center gap-1.5">
                      Format A: PFP Frame / Overlay
                      {format === 'pfp' && <Check className="w-4 h-4 text-[#E5F085]" />}
                    </span>
                    <span className={`text-[11px] font-mono mt-1 leading-normal ${format === 'pfp' ? 'text-[#FDFBF7]/90' : 'text-[#0F2E1E]/50'}`}>
                      Circular profile frame wrapping your photo in custom HH Goa vibes with palm trees and a status ribbon.
                    </span>
                  </button>
                </div>
              </section>

              {/* 3. Form Input Details card */}
              <section className="bg-[#FDFBF7] border-4 border-[#0F2E1E] p-6 rounded-2xl shadow-[6px_6px_0px_#0F2E1E] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-anton uppercase tracking-tight text-[#0F2E1E] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#DE612F] text-[#FDFBF7] border-2 border-[#0F2E1E] flex items-center justify-center text-xs font-mono">3</span>
                    WANTED POSTER DETAILS
                  </h3>
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="flex items-center gap-1.5 text-xs font-mono font-bold py-1 px-3 bg-[#E5F085] border-2 border-[#0F2E1E] rounded-lg text-[#0F2E1E] hover:bg-[#DE612F] hover:text-[#FDFBF7] transition-all shadow-[2px_2px_0px_#0F2E1E]"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Randomize ID
                  </button>
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
                      <LinkIcon className="w-3.5 h-3.5 text-[#DE612F]" /> Scannable QR Code Link
                    </label>
                    <input
                      type="text"
                      value={qrLink}
                      onChange={(e) => setQrLink(e.target.value)}
                      placeholder="e.g. https://github.com/yourusername"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#0F2E1E]/80 font-bold">Builder ID Number</label>
                      <input
                        type="text"
                        value={badgeId}
                        onChange={(e) => setBadgeId(e.target.value)}
                        maxLength={12}
                        placeholder="#HH26-1234"
                        className="bg-[#FDFBF7] border-3 border-[#0F2E1E] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#DE612F] transition-all text-[#0F2E1E] font-mono font-bold shadow-[2px_2px_0px_#0F2E1E]"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: PREVIEW */}
            <div className="lg:col-span-5 flex flex-col space-y-6 lg:sticky lg:top-28" ref={previewRef}>
              <div className="bg-[#FDFBF7] border-4 border-[#0F2E1E] p-6 rounded-2xl shadow-[6px_6px_0px_#0F2E1E] flex flex-col items-center">
                <h3 className="text-lg font-anton uppercase tracking-tight text-[#0F2E1E] w-full text-center border-b-2 border-[#0F2E1E]/10 pb-3 mb-5">
                  REAL-TIME PREVIEW
                </h3>

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

                <div className="w-full mt-6 grid grid-cols-1 gap-4">
                  {/* Share to X (Primary CTA) */}
                  <button
                    type="button"
                    onClick={handleShareToX}
                    className="flex items-center justify-center gap-2 py-3 px-6 bg-[#000000] hover:bg-gray-800 text-white font-anton uppercase tracking-tight text-lg rounded-xl border-3 border-[#0F2E1E] shadow-[4px_4px_0px_#0F2E1E] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0F2E1E] transition-all"
                  >
                    <Share2 className="w-5 h-5 stroke-[3px]" />
                    Share to Unlock Download
                  </button>

                  {/* Standard Download Button */}
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
                  {!hasSharedToX && (
                     <p className="text-[10px] font-mono text-center text-[#0F2E1E]/60 -mt-2">
                       Share to Twitter to automatically download your image!
                     </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* FOOTER */}
        <footer className="max-w-6xl mx-auto px-4 mt-16 border-t-2 border-[#0F2E1E]/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#0F2E1E]/60 font-medium pb-8">
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
                scrollToPreview();
              };
              img.src = dataUrl;
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
