// Helper functions for drawing high-resolution graphics to Canvas matching retro-brutalist and Wanted Poster styles

export interface CardDetails {
  name: string;
  role: string;
  skills: string;
  venue?: string;
  knownFor?: string;
  badgeId: string;
  qrLink: string;
  zoom?: number;
  rotation?: number;
  offset?: { x: number; y: number };
}

export interface ThemeSettings {
  bg: string;
  primary: string;
  accent: string;
  font: string;
}

// Normalize GitHub profile input (accepts "username" or full "https://github.com/username")
export function normalizeGithubUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return 'https://github.com';
  
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  if (/^github\.com\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  
  const cleanUsername = trimmed.replace(/^@/, '');
  return `https://github.com/${cleanUsername}`;
}

// Validate if input looks like a valid GitHub URL or username
export function isValidGithubUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  const normalized = normalizeGithubUrl(trimmed);
  return /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-._]+\/?$/i.test(normalized);
}

// Deterministic collision-safe Builder ID generator based on stable input hash (FNV-1a)
export function getDeterministicBuilderId(inputStr: string): string {
  const cleaned = (inputStr || 'builder').trim().toLowerCase();
  let hash = 2166136261;
  for (let i = 0; i < cleaned.length; i++) {
    hash ^= cleaned.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const num = (Math.abs(hash) % 9000) + 1000;
  return `#HH26-${num}`;
}

// Auto-scale font size so text never overflows or overlaps
const drawScaledText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  startFontSize: number,
  align: CanvasTextAlign = 'left',
  color: string = '#111111',
  weight: string = 'bold'
) => {
  if (!text) return;
  let fontSize = startFontSize;
  ctx.font = `${weight} ${fontSize}px sans-serif`;
  while (ctx.measureText(text).width > maxW && fontSize > 9) {
    fontSize -= 0.5;
    ctx.font = `${weight} ${fontSize}px sans-serif`;
  }
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x, y);
};

// Barcode Renderer for Canvas representing Builder ID
const drawBarcode = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, w: number, h: number) => {
  ctx.save();
  ctx.fillStyle = '#111111';
  
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
  }

  ctx.fillRect(x, y, 4, h);
  ctx.fillRect(x + 6, y, 2, h);
  
  let curX = x + 12;
  const endX = x + w - 12;
  
  while (curX < endX) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const barW = (seed % 3) + 1;
    const spaceW = ((seed >> 2) % 3) + 1;
    
    if (curX + barW * 2 > endX) break;
    ctx.fillRect(curX, y, barW * 2, h);
    curX += (barW + spaceW) * 2;
  }
  
  ctx.fillRect(x + w - 8, y, 2, h);
  ctx.fillRect(x + w - 4, y, 4, h);
  
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(text, x + w / 2, y + h + 4);
  
  ctx.restore();
};

let pfpTemplateImage: HTMLImageElement | null = null;
let pfpTemplateLoading = false;
let pfpTemplateCallbacks: (() => void)[] = [];

export const drawPFPFrame = (
  canvas: HTMLCanvasElement,
  imageElement: HTMLImageElement | null,
  details: CardDetails,
  qrCodeImage: HTMLImageElement | null,
  _theme: ThemeSettings
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const render = (template: HTMLImageElement) => {
    const size = 1000;
    canvas.width = size;
    canvas.height = size;

    ctx.drawImage(template, 0, 0, size, size);

    // 2. Photo frame box coordinates (Adjusted to avoid logo overlap)
    const boxW = 440;
    const boxH = 440;
    const boxX = (1000 - boxW) / 2; // 280
    const boxY = 310;
    const centerX = boxX + boxW / 2;
    const centerY = boxY + boxH / 2;

    if (imageElement) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.clip();

      const zoom = details.zoom || 1;
      const rotation = details.rotation || 0;
      const offsetX = details.offset?.x || 0;
      const offsetY = details.offset?.y || 0;

      ctx.translate(centerX + offsetX, centerY + offsetY);
      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }

      const imgRatio = imageElement.width / imageElement.height;
      const containerRatio = boxW / boxH;
      let drawW = boxW;
      let drawH = boxH;

      if (imgRatio > containerRatio) {
        drawW = boxH * imgRatio;
      } else {
        drawH = boxW / imgRatio;
      }

      drawW *= zoom;
      drawH *= zoom;

      ctx.drawImage(imageElement, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
      
      // Draw inner frame border
      ctx.save();
      ctx.strokeStyle = '#0F2E1E';
      ctx.lineWidth = 6;
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.restore();
    } else {
      // Clean fallback placeholder when no user photo is uploaded yet
      ctx.save();
      ctx.fillStyle = '#f5f6dc';
      ctx.fillRect(boxX, boxY, boxW, boxH);

      ctx.strokeStyle = '#0F2E1E';
      ctx.lineWidth = 6;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = '#0F2E1E';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📷 UPLOAD MUGSHOT', centerX, centerY);
      ctx.restore();
    }

    // Helper to draw label + value pair
    const drawField = (label: string, value: string, x: string | number, y: number) => {
      const numX = Number(x);
      ctx.font = '800 24px sans-serif';
      ctx.fillStyle = '#111111';
      ctx.textAlign = 'left';
      ctx.fillText(label, numX, y);
      const labelW = ctx.measureText(label).width + 10;
      // Increased max width to 950 to allow text to breathe
      drawScaledText(ctx, value, numX + labelW, y, 950 - (numX + labelW), 24, 'left', '#141414', '600');
    };

    // 3. Render Details (Tighter vertical spacing)
    const textStartX = 250;
    drawField('NAME:', details.name.toUpperCase(), textStartX, 805);
    
    const userRole = details.role || 'Full Stack Developer';
    drawField('ROLE:', userRole.toUpperCase(), textStartX, 855);

    const rawStack = details.skills || 'Python, React, Node';
    const formattedStack = rawStack.includes('•') || rawStack.includes('·')
      ? rawStack
      : rawStack.split(',').map(s => s.trim()).filter(Boolean).join(' • ');
    drawField('TECH STACK:', formattedStack.toUpperCase(), textStartX, 905);

    // 5. Render GitHub QR Code (Slightly smaller, moved up)
    if (qrCodeImage) {
      const qrSize = 110;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(100, 800, qrSize, qrSize);
      ctx.drawImage(qrCodeImage, 100 + 4, 800 + 4, qrSize - 8, qrSize - 8);
    }

    // 6. Render Builder ID & Barcode on Left Center (Rotated -90deg)
    const builderIdText = details.badgeId || '#HH26-0000';
    
    ctx.save();
    ctx.translate(65, 530); // Move to left center
    ctx.rotate(-Math.PI / 2); // Rotate -90 degrees (reads bottom to top)
    
    // Draw builder text above barcode
    ctx.font = '800 16px sans-serif';
    ctx.fillStyle = '#111111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`BUILDER ID - ${builderIdText}`, 0, -35);

    // Draw barcode centered at this rotated origin
    drawBarcode(ctx, builderIdText.replace('#', ''), -120, -25, 240, 50);
    ctx.restore();
  };

  if (pfpTemplateImage) {
    render(pfpTemplateImage);
  } else {
    if (!pfpTemplateLoading) {
      pfpTemplateLoading = true;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        pfpTemplateImage = img;
        pfpTemplateLoading = false;
        pfpTemplateCallbacks.forEach((cb) => cb());
        pfpTemplateCallbacks = [];
      };
      img.onerror = () => {
        console.error('Failed to load PFP template');
        pfpTemplateLoading = false;
      };
      img.src = '/hacker_house.png';
      
      pfpTemplateCallbacks.push(() => render(pfpTemplateImage!));
    } else {
      pfpTemplateCallbacks.push(() => {
        if (pfpTemplateImage) render(pfpTemplateImage);
      });
    }
  }
};

let posterTemplateImage: HTMLImageElement | null = null;
let posterTemplateLoading = false;
let posterTemplateCallbacks: (() => void)[] = [];

export const drawIDBadge = (
  canvas: HTMLCanvasElement,
  imageElement: HTMLImageElement | null,
  details: CardDetails,
  qrCodeImage: HTMLImageElement | null,
  _theme: ThemeSettings
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const render = (template: HTMLImageElement) => {
    const w = 682;
    const h = 1024;
    canvas.width = w;
    canvas.height = h;

    // 1. Draw base template image provided by user
    ctx.drawImage(template, 0, 0, w, h);

    // 2. Photo frame box coordinates
    const boxX = 355;
    const boxY = 362;
    const boxW = 230;
    const boxH = 220;
    const centerX = boxX + boxW / 2;
    const centerY = boxY + boxH / 2;

    if (imageElement) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.clip();

      const zoom = details.zoom || 1;
      const rotation = details.rotation || 0;
      const offsetX = details.offset?.x || 0;
      const offsetY = details.offset?.y || 0;

      ctx.translate(centerX + offsetX, centerY + offsetY);
      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }

      const imgRatio = imageElement.width / imageElement.height;
      const containerRatio = boxW / boxH;
      let drawW = boxW;
      let drawH = boxH;

      if (imgRatio > containerRatio) {
        drawW = boxH * imgRatio;
      } else {
        drawH = boxW / imgRatio;
      }

      drawW *= zoom;
      drawH *= zoom;

      ctx.drawImage(imageElement, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
      
      // Draw inner frame border
      ctx.save();
      ctx.strokeStyle = '#0F2E1E';
      ctx.lineWidth = 4;
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.restore();
    } else {
      // Clean fallback placeholder when no user photo is uploaded yet
      ctx.save();
      ctx.fillStyle = '#f5f6dc';
      ctx.fillRect(boxX, boxY, boxW, boxH);

      ctx.strokeStyle = '#0F2E1E';
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = '#0F2E1E';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📷 UPLOAD MUGSHOT', centerX, centerY);
      ctx.restore();
    }

    // 3. Helper to draw label + value pairs
    const drawFieldPoster = (label: string, value: string, x: string | number, y: number) => {
      const numX = Number(x);
      ctx.font = '800 18px sans-serif';
      ctx.fillStyle = '#111111';
      ctx.textAlign = 'left';
      ctx.fillText(label, numX, y);
      const labelW = ctx.measureText(label).width + 8;
      drawScaledText(ctx, value, numX + labelW, y, w - (numX + labelW) - 40, 18, 'left', '#141414', '600');
    };

    // 4. Render Details
    drawScaledText(ctx, details.name.toUpperCase(), 470, 618, 250, 26, 'center', '#111111', '900');

    // Shifted down slightly to avoid red #FrameInGoa text
    const textStartX = 162;
    const userRole = details.role || 'Full Stack Developer';
    drawFieldPoster('ROLE:', userRole.toUpperCase(), textStartX, 740);

    const rawStack = details.skills || 'Python, React, Node';
    const formattedStack = rawStack.includes('•') || rawStack.includes('·')
      ? rawStack
      : rawStack.split(',').map(s => s.trim()).filter(Boolean).join(' • ');
    drawFieldPoster('TECH STACK:', formattedStack.toUpperCase(), textStartX, 775);

    const userKnownFor = details.knownFor || 'Code · Coffee · Repeat';
    drawFieldPoster('KNOWN FOR:', userKnownFor.toUpperCase(), textStartX, 810);

    // 5. Render GitHub QR Code aligned straight down with ROLE label left margin
    if (qrCodeImage) {
      const qrSize = 95;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(96, 840, qrSize, qrSize);
      ctx.drawImage(qrCodeImage, 96 + 4, 840 + 4, qrSize - 8, qrSize - 8);
    }

    // 6. Render Builder ID & Barcode
    const builderIdText = details.badgeId || '#HH26-0000';
    
    ctx.font = '800 14px sans-serif';
    ctx.fillStyle = '#111111';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`BUILDER ID - ${builderIdText}`, 610, 842);

    // Draw barcode aligned slightly down
    drawBarcode(ctx, builderIdText.replace('#', ''), 430, 862, 180, 42);
  };

  if (posterTemplateImage) {
    render(posterTemplateImage);
  } else {
    if (!posterTemplateLoading) {
      posterTemplateLoading = true;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        posterTemplateImage = img;
        posterTemplateLoading = false;
        posterTemplateCallbacks.forEach((cb) => cb());
        posterTemplateCallbacks = [];
      };
      img.onerror = () => {
        console.error('Failed to load Poster template');
        posterTemplateLoading = false;
      };
      img.src = '/hacker_house_poster.png';
      
      posterTemplateCallbacks.push(() => render(img));
    } else {
      posterTemplateCallbacks.push(() => {
        if (posterTemplateImage) render(posterTemplateImage);
      });
    }
  }
};
