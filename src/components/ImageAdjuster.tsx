import React, { useState, useRef } from 'react';
import { ZoomIn, RotateCw, Move } from 'lucide-react';

interface ImageAdjusterProps {
  imageSrc: string;
  format: 'pfp' | 'badge';
  zoom: number;
  setZoom: (zoom: number) => void;
  rotation: number;
  setRotation: (rotation: number) => void;
  offset: { x: number; y: number };
  setOffset: (offset: { x: number; y: number }) => void;
}

export const ImageAdjuster: React.FC<ImageAdjusterProps> = ({
  imageSrc,
  format,
  zoom,
  setZoom,
  rotation,
  setRotation,
  offset,
  setOffset,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch support for mobile devices
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - offset.x,
      y: e.touches[0].clientY - offset.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const resetAdjustments = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Viewport Container */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-square bg-[#0F2E1E] border-4 border-[#0F2E1E] rounded-xl overflow-hidden cursor-move select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
      >
        {/* Render Image */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={imageSrc}
            alt="Adjustable Avatar"
            className="max-w-none origin-center transition-transform duration-75"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              maxHeight: '100%',
              maxWidth: '100%',
            }}
          />
        </div>

        {/* Viewport Crop Overlay Mask */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {format === 'pfp' ? (
            // Format A: Circle PFP Frame Cutout
            <div className="w-[76%] aspect-square rounded-full border-4 border-[#DE612F] shadow-[0_0_0_9999px_rgba(15,46,30,0.75)] flex items-center justify-center">
              <span className="text-[#E5F085]/60 text-xs bg-[#0F2E1E] px-2 py-1 rounded font-mono uppercase tracking-wider border border-[#E5F085]/20">
                PFP Area
              </span>
            </div>
          ) : (
            // Format B: Badge Photo Area Cutout (rectangular)
            <div className="w-[64%] aspect-[4/5] border-4 border-[#DE612F] shadow-[0_0_0_9999px_rgba(15,46,30,0.75)] flex items-center justify-center">
              <span className="text-[#E5F085]/60 text-xs bg-[#0F2E1E] px-2 py-1 rounded font-mono uppercase tracking-wider border border-[#E5F085]/20">
                Badge Photo
              </span>
            </div>
          )}
        </div>

        {/* Pan Icon Helper */}
        <div className="absolute bottom-3 right-3 bg-[#0F2E1E] border-2 border-[#DE612F] p-2 rounded-full pointer-events-none">
          <Move className="w-4 h-4 text-[#DE612F]" />
        </div>
      </div>

      <p className="text-xs text-[#0F2E1E]/70 text-center font-mono font-medium">
        💡 Drag or swipe on the preview container above to reposition your photo.
      </p>

      {/* Adjuster Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FDFBF7] p-4 rounded-xl border-2 border-[#0F2E1E] shadow-[3px_3px_0px_#0F2E1E]">
        {/* Zoom Slider */}
        <div className="flex flex-col space-y-1">
          <label className="flex items-center text-xs font-mono text-[#0F2E1E] uppercase tracking-wider justify-between font-bold">
            <span className="flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5 text-[#DE612F]" /> Zoom</span>
            <span className="text-[#0F2E1E]/80">{Math.round(zoom * 100)}%</span>
          </label>
          <input
            type="range"
            min="0.25"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#E5F085] rounded-lg appearance-none cursor-pointer accent-[#DE612F] border border-[#0F2E1E]"
          />
        </div>

        {/* Rotation Slider */}
        <div className="flex flex-col space-y-1">
          <label className="flex items-center text-xs font-mono text-[#0F2E1E] uppercase tracking-wider justify-between font-bold">
            <span className="flex items-center gap-1"><RotateCw className="w-3.5 h-3.5 text-[#DE612F]" /> Rotate</span>
            <span className="text-[#0F2E1E]/80">{rotation}°</span>
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
            className="w-full h-2 bg-[#E5F085] rounded-lg appearance-none cursor-pointer accent-[#DE612F] border border-[#0F2E1E]"
          />
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={resetAdjustments}
          className="md:col-span-2 py-1.5 px-4 text-xs font-mono border-2 border-[#0F2E1E] bg-[#E5F085] text-[#0F2E1E] hover:bg-[#DE612F] hover:text-[#FDFBF7] transition-all rounded-lg font-bold shadow-[2px_2px_0px_#0F2E1E] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0F2E1E]"
        >
          Reset Photo Alignment
        </button>
      </div>
    </div>
  );
};
