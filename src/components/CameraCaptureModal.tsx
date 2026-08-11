import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, RotateCw, AlertTriangle, Upload } from 'lucide-react';

interface CameraCaptureModalProps {
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
  onFallbackTrigger: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  onClose,
  onCapture,
  onFallbackTrigger,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [permissionState, setPermissionState] = useState<'checking' | 'granted' | 'denied' | 'error'>('checking');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, setHasMultipleCameras] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Initialize camera
  useEffect(() => {
    startCamera();
    checkCameraDevices();

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const checkCameraDevices = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }
    } catch (e) {
      console.warn("Failed to enumerate devices:", e);
    }
  };

  const startCamera = async () => {
    stopCamera();
    setPermissionState('checking');
    setErrorMsg(null);

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: facingMode,
        width: { ideal: 1080 },
        height: { ideal: 1080 },
        aspectRatio: 1
      },
      audio: false
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionState('granted');
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setErrorMsg("Camera access was denied. Please allow camera permissions in your browser settings to take a live photo.");
      } else {
        setPermissionState('error');
        setErrorMsg(err.message || "Could not access the device camera. Verify no other app is using it.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || permissionState !== 'granted') return;

    setIsCapturing(true);

    try {
      const canvas = document.createElement('canvas');
      const videoWidth = video.videoWidth || 640;
      const videoHeight = video.videoHeight || 640;
      
      // Crop it square
      const size = Math.min(videoWidth, videoHeight);
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const startX = (videoWidth - size) / 2;
        const startY = (videoHeight - size) / 2;
        
        // Handle mirroring if front camera is active
        if (facingMode === 'user') {
          ctx.translate(size, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
          ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        }
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(dataUrl);
        stopCamera();
        onClose();
      }
    } catch (e: any) {
      console.error("Failed to capture image:", e);
      alert("Failed to capture photo. Try using file upload.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleUseNativeCamera = () => {
    stopCamera();
    onClose();
    onFallbackTrigger();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2E1E]/80 backdrop-blur-md p-4">
      <div className="bg-[#FDFBF7] border-4 border-[#0F2E1E] rounded-2xl w-full max-w-md overflow-hidden shadow-[8px_8px_0px_#0F2E1E] transform rotate-0 flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0f2e1e] text-[#E5F085] px-4 py-3 border-b-4 border-[#0F2E1E] flex items-center justify-between">
          <span className="font-anton uppercase tracking-wider text-sm flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#DE612F]" /> Live Badge Shutter
          </span>
          <button 
            onClick={onClose} 
            className="text-[#E5F085] hover:text-[#DE612F] transition-colors p-1 border-2 border-transparent hover:border-[#DE612F] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder Area */}
        <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden border-b-4 border-[#0F2E1E]">
          {permissionState === 'checking' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#FDFBF7] space-y-3 p-6 text-center">
              <RotateCw className="w-8 h-8 animate-spin text-[#DE612F]" />
              <p className="font-mono text-xs font-bold uppercase tracking-wider">Requesting Camera Access...</p>
            </div>
          )}

          {permissionState === 'granted' && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
          )}

          {(permissionState === 'denied' || permissionState === 'error') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#0F2E1E] bg-[#FDFBF7] p-6 text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-[#DE612F]" />
              <div>
                <h4 className="font-anton uppercase tracking-tight text-[#DE612F] text-lg">Camera Access Failed</h4>
                <p className="text-xs font-mono font-medium text-[#0F2E1E]/80 mt-2 max-w-xs mx-auto leading-relaxed">
                  {errorMsg}
                </p>
              </div>

              {/* Instructions or suggestions */}
              <div className="text-[10px] font-mono text-[#0F2E1E]/60 max-w-xs border border-dashed border-[#0F2E1E]/30 p-3 rounded-lg bg-[#E5F085]/10">
                💡 <span className="font-bold">Pro Tip:</span> In-app browsers (like Twitter or Instagram) frequently block camera permissions. Open this portal directly in Chrome or Safari.
              </div>

              {/* Fallback buttons */}
              <button
                type="button"
                onClick={handleUseNativeCamera}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#E5F085] hover:bg-[#DE612F] text-[#0F2E1E] hover:text-[#FDFBF7] font-anton uppercase tracking-tight text-xs rounded-xl border-3 border-[#0F2E1E] shadow-[3px_3px_0px_#0F2E1E] hover:shadow-[1px_1px_0px_#0F2E1E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                Use System Camera / Upload File
              </button>
            </div>
          )}

          {/* Quick Help Indicator */}
          {permissionState === 'granted' && (
            <div className="absolute bottom-3 left-3 bg-[#0F2E1E]/80 text-[#E5F085] font-mono text-[9px] px-2 py-1 rounded border border-[#E5F085]/20 select-none">
              {facingMode === 'user' ? 'Selfie Mode (Mirrored)' : 'Main Camera'}
            </div>
          )}
        </div>

        {/* Footer / Controls */}
        <div className="bg-[#E5F085]/20 p-5 flex items-center justify-between gap-4">
          {/* Switch camera button (only show if multiple cameras exist OR we are on mobile to let them try) */}
          <button
            type="button"
            disabled={permissionState !== 'granted'}
            onClick={toggleCamera}
            className={`flex items-center justify-center p-3 rounded-xl border-3 border-[#0F2E1E] shadow-[3px_3px_0px_#0F2E1E] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0F2E1E] ${
              permissionState === 'granted' 
                ? 'bg-[#FDFBF7] hover:bg-[#E5F085] text-[#0F2E1E]' 
                : 'bg-gray-200 text-gray-400 border-gray-400 shadow-none cursor-not-allowed'
            }`}
            title="Switch Camera"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Shutter capture button */}
          <button
            type="button"
            disabled={permissionState !== 'granted' || isCapturing}
            onClick={capturePhoto}
            className={`flex-1 py-3 px-6 font-anton uppercase tracking-tight text-lg rounded-xl border-3 border-[#0F2E1E] shadow-[4px_4px_0px_#0F2E1E] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0F2E1E] ${
              permissionState === 'granted' && !isCapturing
                ? 'bg-[#DE612F] text-[#FDFBF7] hover:bg-[#DE612F]/90'
                : 'bg-gray-200 text-gray-400 border-gray-400 shadow-none cursor-not-allowed'
            }`}
          >
            {isCapturing ? 'Snapping...' : 'Snap Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};
