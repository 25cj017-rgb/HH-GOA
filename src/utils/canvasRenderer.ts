// Helper functions for drawing high-resolution graphics to Canvas matching the retro-brutalist and Wanted Poster styles

export interface CardDetails {
  name: string;
  role: string;
  builderClass: string;
  skills: string;
  badgeId: string;
  qrLink: string;
}

export interface ThemeSettings {
  bg: string;
  primary: string;
  accent: string;
  font: string;
}

const d2r = (deg: number) => (deg * Math.PI) / 180;

// Draw custom Devanagari script for 'गोवा' (Goa)
const drawGoaScript = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, scale: number = 1) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.strokeStyle = color; 
  ctx.fillStyle = color;
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
const drawSimulatedQRCode = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, darkColor: string, lightColor: string, accentColor: string) => {
  ctx.save();
  ctx.fillStyle = darkColor; 
  ctx.fillRect(x, y, size, size);

  ctx.strokeStyle = lightColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 4, y + 4, size - 8, size - 8);

  const drawAnchor = (ax: number, ay: number) => {
    ctx.fillStyle = lightColor;
    ctx.fillRect(ax, ay, 20, 20);
    ctx.fillStyle = darkColor;
    ctx.fillRect(ax + 4, ay + 4, 12, 12);
    ctx.fillStyle = lightColor;
    ctx.fillRect(ax + 7, ay + 7, 6, 6);
  };

  drawAnchor(x + 10, y + 10);
  drawAnchor(x + size - 30, y + 10);
  drawAnchor(x + 10, y + size - 30);

  ctx.fillStyle = lightColor;
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

  const center = x + size / 2;
  ctx.fillStyle = accentColor;
  ctx.fillRect(center - 8, center - 4, 16, 12);
  ctx.beginPath();
  ctx.moveTo(center - 12, center - 4);
  ctx.lineTo(center, center - 14);
  ctx.lineTo(center + 12, center - 4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

// Object-fit: cover drawing function
const drawImageCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, cx: number, cy: number, w: number, h: number) => {
  const imgRatio = img.width / img.height;
  const containerRatio = w / h;
  let drawW = w;
  let drawH = h;

  if (imgRatio > containerRatio) {
    drawW = h * imgRatio;
  } else {
    drawH = w / imgRatio;
  }

  ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
};

export const drawPFPFrame = (
  canvas: HTMLCanvasElement,
  imageElement: HTMLImageElement | null,
  details: CardDetails,
  theme: ThemeSettings
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const size = 1000;
  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = theme.bg;
  ctx.fill();

  if (imageElement) {
    drawImageCover(ctx, imageElement, cx, cy, radius * 2, radius * 2);
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = theme.primary;
    ctx.font = `bold 36px ${theme.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NO PHOTO UPLOADED', cx, cy);
  }
  ctx.restore();

  ctx.strokeStyle = theme.primary; 
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = theme.accent; 
  ctx.lineWidth = 6;
  ctx.setLineDash([12, 16]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.primary;
  
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '-2px';
  }
  ctx.font = `bold 74px ${theme.font}`;
  ctx.fillText('HACKER HOUSE GOA 2026', cx, 90);
  
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '0px';
  }
  ctx.fillStyle = theme.primary;
  ctx.font = `32px ${theme.font}`;
  ctx.fillText('• BUILD IN GOA • SHIP FROM PARADISE •', cx, 145);
  ctx.restore();

  drawGoaScript(ctx, cx + 240, cy - 250, theme.accent, 1.4);

  ctx.save();
  ctx.translate(140, 750);
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 200);
  ctx.quadraticCurveTo(-40, 50, -10, -50);
  ctx.stroke();
  ctx.fillStyle = theme.primary;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(-10 - i * 10, -50 - i * 5, 45, 12, d2r(-30 + i * 20), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(860, 750);
  ctx.scale(-1, 1);
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 200);
  ctx.quadraticCurveTo(-40, 50, -10, -50);
  ctx.stroke();
  ctx.fillStyle = theme.primary;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(-10 - i * 10, -50 - i * 5, 45, 12, d2r(-30 + i * 20), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  const badgeText = `${details.builderClass.toUpperCase()} | ${details.role.toUpperCase()}`;
  ctx.font = `bold 32px ${theme.font}`;
  const textWidth = ctx.measureText(badgeText).width;
  
  const ribbonW = textWidth + 80;
  const ribbonH = 75;
  const rx = cx - ribbonW / 2;
  const ry = cy + radius - 30;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(rx + 8, ry + 8, ribbonW, ribbonH);

  ctx.fillStyle = theme.accent; 
  ctx.fillRect(rx, ry, ribbonW, ribbonH);
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.strokeRect(rx, ry, ribbonW, ribbonH);

  ctx.fillStyle = theme.primary;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '-1px';
  }
  ctx.font = `bold 36px ${theme.font}`;
  ctx.fillText(badgeText, cx, ry + ribbonH / 2);
  ctx.restore();
};

const drawRubberStamp = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  angle: number,
  color: string,
  paperColor: string,
  fontFamily: string
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4.5;

  ctx.font = `bold 22px ${fontFamily}`;
  const textW = ctx.measureText(text).width;
  const padX = 16;
  const padY = 6;

  const rx = -textW / 2 - padX;
  const ry = -12 - padY;
  const rw = textW + padX * 2;
  const rh = 24 + padY * 2;

  ctx.strokeRect(rx, ry, rw, rh);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(rx + 4, ry + 4, rw - 8, rh - 8);

  ctx.font = `900 24px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 2);

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

export const drawIDBadge = (
  canvas: HTMLCanvasElement,
  imageElement: HTMLImageElement | null,
  details: CardDetails,
  qrCodeImage: HTMLImageElement | null,
  theme: ThemeSettings
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = 800;
  const h = 1200;
  canvas.width = w;
  canvas.height = h;

  const paperColor = theme.primary; 

  const paperGrad = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, Math.max(w, h));
  paperGrad.addColorStop(0, paperColor); 
  paperGrad.addColorStop(1, theme.primary === '#F6EAD8' ? '#D5BEA1' : theme.bg); 
  ctx.fillStyle = paperGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(139, 90, 43, 0.08)';
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 50 + 20, 0, Math.PI * 2);
    ctx.fill();
  }

  const borderDark = theme.bg;
  ctx.strokeStyle = borderDark;
  ctx.lineWidth = 8;
  ctx.strokeRect(30, 30, w - 60, h - 60);

  ctx.lineWidth = 3;
  ctx.strokeRect(42, 42, w - 84, h - 84);

  ctx.save();
  ctx.fillStyle = 'rgba(28, 21, 16, 0.35)';
  ctx.font = `bold 12px ${theme.font}`;
  
  ctx.save();
  ctx.translate(22, h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('LESS NOISE • MORE SIGNAL • LOCK IN & SHIP • 247 BUILDERS', 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(w - 22, h / 2);
  ctx.rotate(Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('heads down. ship or ship • GOA RESIDENCY 2026 • 2:47 PM STUDIO', 0, 0);
  ctx.restore();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = borderDark;
  ctx.textAlign = 'center';
  
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '8px';
  }
  
  ctx.font = `900 120px ${theme.font}`;
  ctx.fillText('WANTED', w / 2, 160);
  ctx.restore();

  ctx.strokeStyle = borderDark;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(60, 185);
  ctx.lineTo(w - 60, 185);
  ctx.stroke();

  ctx.save();
  ctx.fillStyle = borderDark;
  ctx.font = `bold 22px ${theme.font}`;
  ctx.textAlign = 'center';
  ctx.fillText(`HACKER HOUSE GOA 2026  |  ID: ${details.badgeId.toUpperCase()}`, w / 2, 218);
  ctx.restore();

  const boxW = 480;
  const boxH = 500;
  const boxX = w / 2 - boxW / 2;
  const boxY = 245;

  ctx.strokeStyle = borderDark;
  ctx.lineWidth = 5;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  ctx.save();
  ctx.beginPath();
  ctx.rect(boxX + 2.5, boxY + 2.5, boxW - 5, boxH - 5);
  ctx.clip();

  ctx.fillStyle = theme.primary === '#F6EAD8' ? '#E4D6C3' : theme.primary; 
  ctx.fillRect(boxX, boxY, boxW, boxH);

  ctx.strokeStyle = 'rgba(28, 21, 16, 0.22)';
  ctx.lineWidth = 2.5;
  ctx.font = `bold 13px ${theme.font}`;
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

  if (imageElement) {
    ctx.save();
    ctx.filter = 'grayscale(100%) sepia(25%) contrast(115%)';
    ctx.globalAlpha = 0.90; 
    drawImageCover(ctx, imageElement, boxX + boxW / 2, boxY + boxH / 2, boxW, boxH);
    ctx.restore();
  } else {
    ctx.fillStyle = 'rgba(28, 21, 16, 0.08)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = 'rgba(28, 21, 16, 0.3)';
    ctx.font = `bold 24px ${theme.font}`;
    ctx.textAlign = 'center';
    ctx.fillText('NO MUGSHOT UPLOADED', w / 2, boxY + boxH / 2);
  }
  ctx.restore();

  drawRubberStamp(ctx, '100% SIGNAL', boxX + 80, boxY + 70, -18, 'rgba(195, 41, 41, 0.82)', paperColor, theme.font);
  drawRubberStamp(ctx, 'APPROVED: 2:47 PM', boxX + boxW - 120, boxY + boxH - 45, 12, 'rgba(23, 114, 56, 0.85)', paperColor, theme.font);

  const bountyY = 770;
  const bountyW = boxW;
  const bountyH = 65;
  const bountyX = w / 2 - bountyW / 2;

  ctx.save();
  ctx.fillStyle = borderDark;
  ctx.fillRect(bountyX, bountyY, bountyW, bountyH);

  ctx.fillStyle = theme.primary; 
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '2px';
  }
  ctx.font = `bold 32px ${theme.font}`;
  ctx.fillText('REWARD: 1,000,000 $SOL', w / 2, bountyY + bountyH / 2 + 2);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = borderDark;
  ctx.textAlign = 'center';

  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '-1.5px';
  }
  ctx.font = `bold 62px ${theme.font}`;
  ctx.fillText(details.name.toUpperCase(), w / 2, 890);

  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '0px';
  }

  ctx.fillStyle = borderDark;
  const starSize = 24;
  const starY = 915;
  ctx.textAlign = 'center';
  for (let s = 0; s < 5; s++) {
    const starX = w / 2 + (s - 2) * 32;
    ctx.font = `${starSize}px sans-serif`;
    ctx.fillText('★', starX, starY);
  }

  ctx.textAlign = 'left';
  const infoX = 80;
  const infoY = 975;

  ctx.font = `bold 20px ${theme.font}`;
  ctx.fillText(`WANTED FOR: SHITPOSTING & DEPLOYING IN PARADISE`, infoX, infoY);
  ctx.fillText(`ROLE:       ${details.role.toUpperCase()}`, infoX, infoY + 34);
  ctx.fillText(`CLASS:      ${details.builderClass.toUpperCase()}`, infoX, infoY + 68);
  ctx.fillText(`STACK:      ${details.skills.toUpperCase()}`, infoX, infoY + 102);
  ctx.restore();

  ctx.save();
  drawGoaScript(ctx, w - 170, 940, theme.accent, 1.25);
  ctx.restore();

  const qrSize = 120;
  const qrX = w - qrSize - 80;
  const qrY = h - qrSize - 80;

  ctx.save();
  if (qrCodeImage) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.drawImage(qrCodeImage, qrX + 6, qrY + 6, qrSize - 12, qrSize - 12);
    ctx.strokeStyle = borderDark;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(qrX, qrY, qrSize, qrSize);
  } else {
    drawSimulatedQRCode(ctx, qrX, qrY, qrSize, borderDark, theme.primary, theme.accent);
  }
  
  ctx.fillStyle = borderDark;
  ctx.font = `bold 12px ${theme.font}`;
  ctx.textAlign = 'center';
  ctx.fillText('Scan for Profile', qrX + qrSize / 2, qrY + qrSize + 18);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = borderDark;
  const barcodeX = 80;
  const barcodeY = h - 130;
  const barcodeW = 200;
  const barcodeH = 45;

  ctx.fillRect(barcodeX, barcodeY, 4, barcodeH);
  ctx.fillRect(barcodeX + 6, barcodeY, 2, barcodeH);

  let curBX = barcodeX + 10;
  const seedString = `${details.name}${details.badgeId}`;
  for (let bi = 0; bi < seedString.length && curBX < barcodeX + barcodeW - 12; bi++) {
    const val = seedString.charCodeAt(bi);
    const w1 = (val % 3) + 1;
    const s1 = ((val >> 2) % 3) + 2;
    ctx.fillRect(curBX, barcodeY, w1 * 2, barcodeH);
    curBX += (w1 + s1) * 2;
  }
  ctx.fillRect(barcodeX + barcodeW - 8, barcodeY, 2, barcodeH);
  ctx.fillRect(barcodeX + barcodeW - 4, barcodeY, 4, barcodeH);

  ctx.font = `10px ${theme.font}`;
  ctx.textAlign = 'left';
  ctx.fillText(`HH-2026-${details.badgeId.replace('#', '')}`, barcodeX + 2, barcodeY + barcodeH + 14);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(28, 21, 16, 0.65)';
  ctx.font = `bold 11px ${theme.font}`;
  ctx.textAlign = 'center';
  ctx.fillText(
    'NO FLUFF, NO USELESS NETWORKING • 500 ELITE BUILDERS • HIGH-SPEED FIBER & THE OCEAN AT YOUR DOORSTEP',
    w / 2,
    h - 44
  );
  ctx.restore();

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
