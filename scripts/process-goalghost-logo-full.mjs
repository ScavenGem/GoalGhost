import fs from "fs";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public");

const SOURCE_CANDIDATES = [
  "C:/Users/samue/Downloads/GoalGhostLogo.png",
  path.join(root, "public", "goalghost-logo-source.jpg"),
];

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
    if (dist < 45 || luminance < 40) {
      alpha = 0;
    } else if (dist < 78) {
      alpha = Math.round(((dist - 45) / 33) * 255);
    } else if (luminance < 75) {
      alpha = Math.round(((luminance - 40) / 35) * 255);
    }

    pixels[i + 3] = Math.min(255, Math.max(0, alpha));
  }

  return sharp(Buffer.from(pixels), {
    raw: { width, height, channels },
  })
    .png()
    .toBuffer();
}

function resolveSource() {
  for (const candidate of SOURCE_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error("No GoalGhost logo source found");
}

async function main() {
  const source = resolveSource();
  console.log("Using source:", source);

  const transparent = await removeDarkBackground(await sharp(source).toBuffer());
  const trimmed = await sharp(transparent).trim({ threshold: 14 }).toBuffer();
  const trimmedMeta = await sharp(trimmed).metadata();
  const tw = trimmedMeta.width ?? 400;
  const th = trimmedMeta.height ?? 500;
  const targetWidth = 140;
  const targetHeight = Math.round((th / tw) * targetWidth);

  const full = await sharp(trimmed)
    .resize(targetWidth, targetHeight, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  await sharp(full).toFile(path.join(outDir, "goalghost-logo-full.png"));
  const outMeta = await sharp(full).metadata();
  console.log(
    "Created goalghost-logo-full.png",
    outMeta.width,
    "x",
    outMeta.height
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});