// Run once: node generate-icons.js
// Generates icons/icon-192.png and icons/icon-512.png
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size / 2;

  // Background
  ctx.fillStyle = '#070810';
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();

  // Gradient glow ring
  const grad = ctx.createRadialGradient(r, r, r * 0.3, r, r, r * 0.9);
  grad.addColorStop(0, 'rgba(143,220,255,0.18)');
  grad.addColorStop(1, 'rgba(184,145,255,0.06)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();

  // Letter "L"
  const fontSize = Math.round(size * 0.48);
  ctx.font = `700 ${fontSize}px "Sora", "Inter", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#8fdcff';
  ctx.shadowColor = 'rgba(143,220,255,0.7)';
  ctx.shadowBlur = size * 0.08;
  ctx.fillText('L', r, r + size * 0.03);

  return canvas.toBuffer('image/png');
}

for (const size of [192, 512]) {
  fs.writeFileSync(path.join(dir, `icon-${size}.png`), drawIcon(size));
  console.log(`Generated icons/icon-${size}.png`);
}
console.log('Done.');
