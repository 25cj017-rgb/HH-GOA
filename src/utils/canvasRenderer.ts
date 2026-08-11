// Helper functions for drawing high-resolution graphics to Canvas matching the retro-brutalist and Wanted Poster styles

export interface CardDetails {
  name: string;
  role: string;
  builderClass: string;
  skills: string;
  badgeId: string;
  qrLink: string;
}

interface ImageTransform {
  zoom: number;
  rotation: number;
  offset: { x: number; y: number };
}

const d2r = (deg: number) => (deg * Math.PI) / 180;

// Draw custom Devanagari script for 'गोवा' (Goa)
const drawGoaScript = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#DE612F'; // Warm orange
  ctx.fillStyle = '#DE612F';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Go ('गो')
  ctx.beginPath();
  ctx.moveTo(-35, -5);
  ctx.lineTo(-35, 15);
  ctx.moveTo(-35, 10);
  ctx.quadraticCurveTo(-45, 10, -45, 0);
  ctx.quadraticCurveTo(-45, -5, -35, -5);
  ctx.moveTo(-20, -5);
  ctx.lineTo(-20, 20);
  ctx.moveTo(-10, -5);
  ctx.lineTo(-10, 20);
  ctx.moveTo(-10, -10);
  ctx.quadraticCurveTo(-20, -22, -30, -20);
  ctx.stroke();

  // Wa ('वा')
  ctx.beginPath();
  ctx.arc(10, 8, 8, 0, Math.PI * 2);
  ctx.moveTo(18, -5);
  ctx.lineTo(18, 20);
  ctx.moveTo(28, -5);
  ctx.lineTo(28, 20);
  ctx.stroke();

  // Top horizontal shirorekha
  ctx.beginPath();
  ctx.lineWidth = 6;
  ctx.moveTo(-50, -8);
  ctx.lineTo(38, -8);
  ctx.stroke();

  ctx.restore();
};

// Draw Simulated QR Code
const drawSimulatedQRCode = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.save();
  ctx.fillStyle = '#1C1510'; // Dark brown ink
  ctx.fillRect(x, y, size, size);

  ctx.strokeStyle = '#F6EAD8';
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 4, y + 4, size - 8, size - 8);

  const drawAnchor = (ax: number, ay: number) => {
    ctx.fillStyle = '#F6EAD8';
    ctx.fillRect(ax, ay, 20, 20);
    ctx.fillStyle = '#1C1510';
    ctx.fillRect(ax + 4, ay + 4, 12, 12);
    ctx.fillStyle = '#F6EAD8';
    ctx.fillRect(ax + 7, ay + 7, 6, 6);
  };

  drawAnchor(x + 10, y + 10);
  drawAnchor(x + size - 30, y + 10);
  drawAnchor(x + 10, y + size - 30);

  ctx.fillStyle = '#F6EAD8';
  const dotSize = 4;
  for (let px = 10; px < size - 10; px += dotSize) {
    for (let py = 10; py < size - 10; py += dotSize) {
      if (
        (px < 35 && py < 35) ||
        (px > size - 35 && py < 35) ||
        (px < 35 && py > size - 35)
      ) {
        continue;
      }
      if (Math.random() > 0.45) {
        ctx.fillRect(x + px, y + py, dotSize, dotSize);
      }
    }
  }

  // Draw simple lock/house icon inside QR code center
  const center = x + size / 2;
  ctx.fillStyle = '#DE612F';
  ctx.fillRect(center - 8, center - 4, 16, 12);
  ctx.beginPath();
  ctx.moveTo(center - 12, center - 4);
  ctx.lineTo(center, center - 14);
  ctx.lineTo(center + 12, center - 4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

/**
 * Render Format A: PFP Frame / Overlay (Brutalist style)
 */
export const drawPFPFrame = (
  canvas: HTMLCanvasElement,
  imageElement: HTMLImageElement | null,
  transform: ImageTransform,
  details: CardDetails
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const size = 1000;
  canvas.width = size;
  canvas.height = size;

  // 1. Clear background (Dark forest green)
  ctx.fillStyle = '#0F2E1E';
  ctx.fillRect(0, 0, size, size);

  // 2. Draw user photo cropped as circle inside center
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = '#0F2E1E';
  ctx.fill();

  if (imageElement) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.translate(transform.offset.x * 2.5, transform.offset.y * 2.5);
    ctx.rotate(d2r(transform.rotation));
    const drawScale = transform.zoom * (radius * 2 / Math.min(imageElement.width, imageElement.height));
    const drawW = imageElement.width * drawScale;
    const drawH = imageElement.height * drawScale;
    ctx.drawImage(imageElement, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E5F085';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NO PHOTO UPLOADED', cx, cy);
  }
  ctx.restore();

  // 3. Draw Brand Borders
  ctx.strokeStyle = '#E5F085'; // Pale yellow-green
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#DE612F'; // Orange
  ctx.lineWidth = 6;
  ctx.setLineDash([12, 16]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Header Text Overlay using massive Anton font
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#E5F085';
  
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '-2px';
  }
  ctx.font = 'bold 74px "Anton", sans-serif';
  ctx.fillText('HACKER HOUSE GOA 2026', cx, 90);
  
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '0px';
  }
  ctx.fillStyle = '#E5F085';
  ctx.font = '32px monospace';
  ctx.fillText('• BUILD IN GOA • SHIP FROM PARADISE •', cx, 145);
  ctx.restore();

  // 5. Draw Goa Script
  drawGoaScript(ctx, cx + 240, cy - 250, 1.4);

  // 6. Draw Palm Trees
  ctx.save();
  ctx.translate(140, 750);
  ctx.strokeStyle = '#E5F085';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 200);
  ctx.quadraticCurveTo(-40, 50, -10, -50);
  ctx.stroke();
  ctx.fillStyle = '#E5F085';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(-10 - i * 10, -50 - i * 5, 45, 12, d2r(-30 + i * 20), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(860, 750);
  ctx.scale(-1, 1);
  ctx.strokeStyle = '#E5F085';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 200);
  ctx.quadraticCurveTo(-40, 50, -10, -50);
  ctx.stroke();
  ctx.fillStyle = '#E5F085';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(-10 - i * 10, -50 - i * 5, 45, 12, d2r(-30 + i * 20), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 7. Footer Badge Ribbon
  ctx.save();
  const badgeText = `${details.builderClass.toUpperCase()} | ${details.role.toUpperCase()}`;
  ctx.font = 'bold 32px monospace';
  const textWidth = ctx.measureText(badgeText).width;
  
  const ribbonW = textWidth + 80;
  const ribbonH = 75;
  const rx = cx - ribbonW / 2;
  const ry = cy + radius - 30;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(rx + 8, ry + 8, ribbonW, ribbonH);

  ctx.fillStyle = '#DE612F'; // Orange background
  ctx.fillRect(rx, ry, ribbonW, ribbonH);
  ctx.strokeStyle = '#E5F085';
  ctx.lineWidth = 4;
  ctx.strokeRect(rx, ry, ribbonW, ribbonH);

  ctx.fillStyle = '#E5F085';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '-1px';
  }
  ctx.font = 'bold 36px "Anton", sans-serif';
  ctx.fillText(badgeText, cx, ry + ribbonH / 2);
  ctx.restore();
};

/**
 * Helper to draw a distressed slanted rubber stamp
 */
const drawRubberStamp = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  angle: number,
  color: string,
  paperColor: string = '#F6EAD8'
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4.5;

  ctx.font = 'bold 22px "Space Grotesk", sans-serif';
  const textW = ctx.measureText(text).width;
  const padX = 16;
  const padY = 6;

  const rx = -textW / 2 - padX;
  const ry = -12 - padY;
  const rw = textW + padX * 2;
  const rh = 24 + padY * 2;

  // Outer distressed box border
  ctx.strokeRect(rx, ry, rw, rh);

  // Inner distressed box border
  ctx.lineWidth = 1.5;
  ctx.strokeRect(rx + 4, ry + 4, rw - 8, rh - 8);

  // Stamp text
  ctx.font = '900 24px "Anton", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 2);

  // Paint distress noise spots over the stamp using the paper color
  ctx.fillStyle = paperColor;
  for (let i = 0; i < 22; i++) {
    ctx.beginPath();
    ctx.arc(
      (Math.random() - 0.5) * rw,
      (Math.random() - 0.5) * rh,
      Math.random() * 2.5 + 0.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
};

/**
 * Render Format B: Wanted Poster (Vintage Streetwear / GenZ Style)
 */
export const drawIDBadge = (
  canvas: HTMLCanvasElement,
  imageElement: HTMLImageElement | null,
  transform: ImageTransform,
  details: CardDetails,
  qrCodeImage: HTMLImageElement | null
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = 800;
  const h = 1200;
  canvas.width = w;
  canvas.height = h;

  const paperColor = '#F6EAD8';

  // 1. Create a beautiful radial gradient for vintage paper texture
  const paperGrad = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, Math.max(w, h));
  paperGrad.addColorStop(0, paperColor); // Lighter center
  paperGrad.addColorStop(1, '#D5BEA1'); // Darker edges
  ctx.fillStyle = paperGrad;
  ctx.fillRect(0, 0, w, h);

  // Draw some soft vintage dust specs and grunge marks
  ctx.fillStyle = 'rgba(139, 90, 43, 0.08)';
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 50 + 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Draw outer double black borders
  const borderCharcoal = '#1C1510'; // Aged dark ink
  ctx.strokeStyle = borderCharcoal;
  ctx.lineWidth = 8;
  ctx.strokeRect(30, 30, w - 60, h - 60);

  ctx.lineWidth = 3;
  ctx.strokeRect(42, 42, w - 84, h - 84);

  // 3. DRAW VERTICAL BORDER TEXT (Streetwear style)
  ctx.save();
  ctx.fillStyle = 'rgba(28, 21, 16, 0.35)';
  ctx.font = 'bold 12px monospace';
  
  // Left border vertical text
  ctx.save();
  ctx.translate(22, h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('LESS NOISE • MORE SIGNAL • LOCK IN & SHIP • 247 BUILDERS', 0, 0);
  ctx.restore();

  // Right border vertical text
  ctx.save();
  ctx.translate(w - 22, h / 2);
  ctx.rotate(Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('heads down. ship or ship • GOA RESIDENCY 2026 • 2:47 PM STUDIO', 0, 0);
  ctx.restore();
  ctx.restore();

  // 4. TITLE: "WANTED"
  ctx.save();
  ctx.fillStyle = borderCharcoal;
  ctx.textAlign = 'center';
  
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '8px';
  }
  
  ctx.font = '900 120px "Anton", sans-serif';
  ctx.fillText('WANTED', w / 2, 160);
  ctx.restore();

  // Draw a horizontal divider line under WANTED
  ctx.strokeStyle = borderCharcoal;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(60, 185);
  ctx.lineTo(w - 60, 185);
  ctx.stroke();

  // Subheader: HACKER HOUSE GOA 2026 & BUILDER ID
  ctx.save();
  ctx.fillStyle = borderCharcoal;
  ctx.font = 'bold 22px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`HACKER HOUSE GOA 2026  |  ID: ${details.badgeId.toUpperCase()}`, w / 2, 218);
  ctx.restore();

  // 5. PHOTO CONTAINER (Mugshot style with height lines)
  const boxW = 480;
  const boxH = 500;
  const boxX = w / 2 - boxW / 2;
  const boxY = 245;

  // Draw photo container border
  ctx.strokeStyle = borderCharcoal;
  ctx.lineWidth = 5;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Draw height markings background inside the photo box
  ctx.save();
  ctx.beginPath();
  ctx.rect(boxX + 2.5, boxY + 2.5, boxW - 5, boxH - 5);
  ctx.clip();

  ctx.fillStyle = '#E4D6C3'; // Slightly darker wood/paper tone
  ctx.fillRect(boxX, boxY, boxW, boxH);

  // Draw horizontal lines for the mugshot height grid
  ctx.strokeStyle = 'rgba(28, 21, 16, 0.22)';
  ctx.lineWidth = 2.5;
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = 'rgba(28, 21, 16, 0.55)';
  ctx.textAlign = 'left';

  for (let lineY = boxY + 40; lineY < boxY + boxH; lineY += 45) {
    ctx.beginPath();
    ctx.moveTo(boxX, lineY);
    ctx.lineTo(boxX + boxW, lineY);
    ctx.stroke();

    const heightFeet = Math.floor((boxY + boxH - lineY) / 90) + 4;
    const heightInches = Math.floor(((boxY + boxH - lineY) % 90) / 7.5);
    ctx.fillText(`${heightFeet}'${heightInches}"`, boxX + 12, lineY - 6);
  }

  // Draw user's avatar image inside the photo box
  if (imageElement) {
    ctx.save();
    const cx = boxX + boxW / 2;
    const cy = boxY + boxH / 2;
    ctx.translate(cx, cy);
    ctx.translate(transform.offset.x * 2.0, transform.offset.y * 2.0);
    ctx.rotate(d2r(transform.rotation));

    // Vintage grayscale/sepia filter on user's photo
    ctx.filter = 'grayscale(100%) sepia(25%) contrast(115%)';
    ctx.globalAlpha = 0.90; // Blend slightly with the background grid lines

    const drawScale = transform.zoom * (boxW / Math.min(imageElement.width, imageElement.height));
    const drawW = imageElement.width * drawScale;
    const drawH = imageElement.height * drawScale;
    ctx.drawImage(imageElement, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    ctx.fillStyle = 'rgba(28, 21, 16, 0.08)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = 'rgba(28, 21, 16, 0.3)';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NO MUGSHOT UPLOADED', w / 2, boxY + boxH / 2);
  }
  ctx.restore();

  // 6. DRAW STAMPS / SEALS OVER PHOTO (Authentic poster aesthetics)
  // "100% SIGNAL" Stamp (Angled Red)
  drawRubberStamp(ctx, '100% SIGNAL', boxX + 80, boxY + 70, -18, 'rgba(195, 41, 41, 0.82)', paperColor);
  // "2:47 PM STUDIO APPROVED" Stamp (Angled Green)
  drawRubberStamp(ctx, 'APPROVED: 2:47 PM', boxX + boxW - 120, boxY + boxH - 45, 12, 'rgba(23, 114, 56, 0.85)', paperColor);

  // 7. BOUNTY / REWARD LABEL
  const bountyY = 770;
  const bountyW = boxW;
  const bountyH = 65;
  const bountyX = w / 2 - bountyW / 2;

  ctx.save();
  ctx.fillStyle = borderCharcoal;
  ctx.fillRect(bountyX, bountyY, bountyW, bountyH);

  ctx.fillStyle = '#F6EAD8'; // Light paper text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '2px';
  }
  ctx.font = 'bold 32px "Anton", sans-serif';
  ctx.fillText('REWARD: 1,000,000 $SOL', w / 2, bountyY + bountyH / 2 + 2);
  ctx.restore();

  // 8. BUILDER IDENTITY INFO
  ctx.save();
  ctx.fillStyle = borderCharcoal;
  ctx.textAlign = 'center';

  // Builder Name
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '-1.5px';
  }
  ctx.font = 'bold 62px "Anton", sans-serif';
  ctx.fillText(details.name.toUpperCase(), w / 2, 890);

  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '0px';
  }

  // Draw 5 Wanted Stars (Charcoal ink)
  ctx.fillStyle = borderCharcoal;
  const starSize = 24;
  const starY = 915;
  ctx.textAlign = 'center';
  for (let s = 0; s < 5; s++) {
    const starX = w / 2 + (s - 2) * 32;
    ctx.font = `${starSize}px sans-serif`;
    ctx.fillText('★', starX, starY);
  }

  // Wanted details list (monospaced newspaper style)
  ctx.textAlign = 'left';
  const infoX = 80;
  const infoY = 975;

  ctx.font = 'bold 20px monospace';
  ctx.fillText(`WANTED FOR: SHITPOSTING & DEPLOYING IN PARADISE`, infoX, infoY);
  ctx.fillText(`ROLE:       ${details.role.toUpperCase()}`, infoX, infoY + 34);
  ctx.fillText(`CLASS:      ${details.builderClass.toUpperCase()}`, infoX, infoY + 68);
  ctx.fillText(`STACK:      ${details.skills.toUpperCase()}`, infoX, infoY + 102);
  ctx.restore();

  // 9. GOA DEVANAGARI STAMP (Sticker look, orange/pink overlay)
  ctx.save();
  drawGoaScript(ctx, w - 170, 940, 1.25);
  ctx.restore();

  // 10. SCANNABLE QR CODE & PROCEDURAL BARCODE (Utility details)
  const qrSize = 120;
  const qrX = w - qrSize - 80;
  const qrY = h - qrSize - 80;

  ctx.save();
  if (qrCodeImage) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.drawImage(qrCodeImage, qrX + 6, qrY + 6, qrSize - 12, qrSize - 12);
    ctx.strokeStyle = borderCharcoal;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(qrX, qrY, qrSize, qrSize);
  } else {
    drawSimulatedQRCode(ctx, qrX, qrY, qrSize);
  }
  
  // Scannable caption
  ctx.fillStyle = borderCharcoal;
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Scan for Profile', qrX + qrSize / 2, qrY + qrSize + 18);
  ctx.restore();

  // Barcode (Bottom left, matching references)
  ctx.save();
  ctx.fillStyle = borderCharcoal;
  const barcodeX = 80;
  const barcodeY = h - 130;
  const barcodeW = 200;
  const barcodeH = 45;

  // Draw start guard
  ctx.fillRect(barcodeX, barcodeY, 4, barcodeH);
  ctx.fillRect(barcodeX + 6, barcodeY, 2, barcodeH);

  let curBX = barcodeX + 10;
  // Deterministic random generation using badges string seed
  const seedString = `${details.name}${details.badgeId}`;
  for (let bi = 0; bi < seedString.length && curBX < barcodeX + barcodeW - 12; bi++) {
    const val = seedString.charCodeAt(bi);
    const w1 = (val % 3) + 1;
    const s1 = ((val >> 2) % 3) + 2;
    ctx.fillRect(curBX, barcodeY, w1 * 2, barcodeH);
    curBX += (w1 + s1) * 2;
  }
  // Draw end guard
  ctx.fillRect(barcodeX + barcodeW - 8, barcodeY, 2, barcodeH);
  ctx.fillRect(barcodeX + barcodeW - 4, barcodeY, 4, barcodeH);

  // Barcode subtext
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`HH-2026-${details.badgeId.replace('#', '')}`, barcodeX + 2, barcodeY + barcodeH + 14);
  ctx.restore();

  // 11. FOOTER SYSTEM STATS (Goa Residency Details)
  ctx.save();
  ctx.fillStyle = 'rgba(28, 21, 16, 0.65)';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    'NO FLUFF, NO USELESS NETWORKING • 500 ELITE BUILDERS • HIGH-SPEED FIBER & THE OCEAN AT YOUR DOORSTEP',
    w / 2,
    h - 44
  );
  ctx.restore();

  // 12. WEATHERED GRAIN OVERLAY
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  for (let i = 0; i < 2000; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let i = 0; i < 1200; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
  ctx.restore();
};

