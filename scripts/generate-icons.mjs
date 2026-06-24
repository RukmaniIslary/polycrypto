/**
 * Generates app icons using canvas (Node.js).
 * Run: node scripts/generate-icons.mjs
 */
import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/icons");
mkdirSync(outDir, { recursive: true });

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  const bg = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  bg.addColorStop(0, "#1A1D26");
  bg.addColorStop(1, "#0A0B0F");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  // Hexagon
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  const hexGrad = ctx.createLinearGradient(0, 0, size, size);
  hexGrad.addColorStop(0, "rgba(59,130,246,0.25)");
  hexGrad.addColorStop(0.5, "rgba(139,92,246,0.25)");
  hexGrad.addColorStop(1, "rgba(34,197,94,0.25)");
  ctx.fillStyle = hexGrad;
  ctx.fill();
  const strokeGrad = ctx.createLinearGradient(0, 0, size, size);
  strokeGrad.addColorStop(0, "#3B82F6");
  strokeGrad.addColorStop(1, "#22C55E");
  ctx.strokeStyle = strokeGrad;
  ctx.lineWidth = size * 0.025;
  ctx.stroke();

  // P letter
  const scale = size / 100;
  ctx.strokeStyle = "white";
  ctx.lineWidth = scale * 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Vertical stroke
  ctx.beginPath();
  ctx.moveTo(cx - 14 * scale, cy - 20 * scale);
  ctx.lineTo(cx - 14 * scale, cy + 22 * scale);
  ctx.stroke();

  // Curved bowl
  ctx.beginPath();
  ctx.moveTo(cx - 14 * scale, cy - 20 * scale);
  ctx.bezierCurveTo(
    cx + 18 * scale, cy - 20 * scale,
    cx + 18 * scale, cy + 4 * scale,
    cx - 14 * scale, cy + 4 * scale
  );
  ctx.stroke();

  // Green accent dot
  ctx.beginPath();
  ctx.arc(cx + 14 * scale, cy + 14 * scale, scale * 5, 0, Math.PI * 2);
  ctx.fillStyle = "#22C55E";
  ctx.fill();

  return canvas.toBuffer("image/png");
}

[192, 512].forEach((size) => {
  const buf = drawIcon(size);
  writeFileSync(path.join(outDir, `icon-${size}.png`), buf);
  console.log(`Generated icon-${size}.png`);
});

// OG image (1200x630)
const og = createCanvas(1200, 630);
const ogCtx = og.getContext("2d");
const ogBg = ogCtx.createLinearGradient(0, 0, 1200, 630);
ogBg.addColorStop(0, "#0A0B0F");
ogBg.addColorStop(1, "#12141A");
ogCtx.fillStyle = ogBg;
ogCtx.fillRect(0, 0, 1200, 630);

// Logo at center-left
const iconBuf = drawIcon(200);
// Write text
ogCtx.fillStyle = "#F1F5F9";
ogCtx.font = "bold 72px sans-serif";
ogCtx.fillText("PolyCrypto", 120, 290);
ogCtx.fillStyle = "#94A3B8";
ogCtx.font = "32px sans-serif";
ogCtx.fillText("Predict the Market. Own the Outcome.", 120, 360);

writeFileSync(path.join(outDir, "og-image.png"), og.toBuffer("image/png"));
console.log("Generated og-image.png");
