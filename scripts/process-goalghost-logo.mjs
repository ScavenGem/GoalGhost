import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source = "C:/Users/samue/Downloads/GoalGhostLogo.png";
const outDir = path.join(root, "public");

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

async function removeDarkBackground(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixels = new Uint8Array(data);

  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  let bgR = 0;
  let bgG = 0;
  let bgB = 0;
  for (const [x, y] of corners) {
    const idx = (y * width + x) * channels;
    bgR += pixels[idx];
    bgG += pixels[idx + 1];
    bgB += pixels[idx + 2];
  }
  bgR = Math.round(bgR / corners.length);
  bgG = Math.round(bgG / corners.length);
  bgB = Math.round(bgB / corners.length);

  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const dist = colorDistance(r, g, b, bgR, bgG, bgB);

    let alpha = a;
    if (dist < 40 || luminance < 35) {
      alpha = 0;
    } else if (dist < 70) {
      alpha = Math.round(((dist - 40) / 30) * 255);
    } else if (luminance < 70) {
      alpha = Math.round(((luminance - 35) / 35) * 255);
    }

    pixels[i + 3] = Math.min(255, Math.max(0, alpha));
  }

  return sharp(Buffer.from(pixels), {
    raw: { width, height, channels },
  })
    .png()
    .toBuffer();
}

async function trimAndSquare(inputBuffer, size) {
  const trimmed = await sharp(inputBuffer).trim({ threshold: 8 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  const w = meta.width ?? size;
  const h = meta.height ?? size;
  const maxDim = Math.max(w, h);
  const padX = Math.floor((maxDim - w) / 2);
  const padY = Math.floor((maxDim - h) / 2);
  const breathe = Math.round(maxDim * 0.12);

  const squared = await sharp(trimmed)
    .extend({
      top: padY,
      bottom: maxDim - h - padY,
      left: padX,
      right: maxDim - w - padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: breathe,
      bottom: breathe,
      left: breathe,
      right: breathe,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  return sharp(squared)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  const meta = await sharp(source).metadata();
  const width = meta.width ?? 3919;
  const height = meta.height ?? 3919;

  // Icon only: crop out the GOALGHOST text banner below the circular emblem
  const cropTop = Math.round(height * 0.04);
  const cropHeight = Math.round(height * 0.66);
  const cropLeft = Math.round(width * 0.08);
  const cropWidth = Math.round(width * 0.84);

  const cropped = await sharp(source)
    .extract({
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
    })
    .toBuffer();

  const transparent = await removeDarkBackground(cropped);
  const logo128 = await trimAndSquare(transparent, 128);
  const logo256 = await trimAndSquare(transparent, 256);

  await sharp(logo128).toFile(path.join(outDir, "goalghost-logo.png"));
  await sharp(logo256).toFile(path.join(outDir, "goalghost-logo@2x.png"));

  const logo128Meta = await sharp(logo128).metadata();
  console.log("Created goalghost-logo.png", logo128Meta.width, "x", logo128Meta.height);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});