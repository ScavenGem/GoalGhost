import type { LegacyDocument } from "@/types/legacy";

export function downloadLegacyFinaleImage(params: {
  ghostName: string;
  team: string;
  legacy: LegacyDocument;
}): void {
  const { ghostName, team, legacy } = params;
  const width = 1080;
  const height = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0f1a2e");
  gradient.addColorStop(0.5, "#0a1020");
  gradient.addColorStop(1, "#050810");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(244, 197, 66, 0.08)";
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.28, 280, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#F4C542";
  ctx.font = "600 28px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("GOALGHOST LEGACY", width / 2, 120);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "700 72px Georgia, serif";
  ctx.fillText(ghostName, width / 2, 280);

  ctx.fillStyle = "rgba(244, 197, 66, 0.85)";
  ctx.font = "500 36px system-ui, sans-serif";
  ctx.fillText(team, width / 2, 340);

  ctx.fillStyle = "#F4C542";
  ctx.font = "700 96px Georgia, serif";
  const mood = legacy.stats.dominantMood.toUpperCase();
  ctx.fillText(mood, width / 2, 520);

  ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
  ctx.font = "500 24px system-ui, sans-serif";
  ctx.fillText("Dominant Spirit", width / 2, 570);

  ctx.fillStyle = "rgba(248, 250, 252, 0.82)";
  ctx.font = "400 28px system-ui, sans-serif";
  wrapText(ctx, legacy.story.slice(0, 320), width / 2, 660, 900, 38);

  const stats = [
    { label: "Evolution", value: String(legacy.stats.peakEvolution) },
    { label: "Chapters", value: String(legacy.stats.matchesWitnessed) },
    { label: "Season", value: "WC 2026" },
  ];
  const statY = height - 280;
  const slot = width / stats.length;
  stats.forEach((stat, i) => {
    const x = slot * i + slot / 2;
    ctx.fillStyle = "#F4C542";
    ctx.font = "700 56px Georgia, serif";
    ctx.fillText(stat.value, x, statY);
    ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
    ctx.font = "500 20px system-ui, sans-serif";
    ctx.fillText(stat.label, x, statY + 36);
  });

  ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
  ctx.font = "400 18px system-ui, sans-serif";
  ctx.fillText("Verified on 0G Storage", width / 2, height - 80);

  const link = document.createElement("a");
  link.download = `goalghost-legacy-${ghostName.replace(/\s+/g, "-").toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let offsetY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, offsetY);
      line = word;
      offsetY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, offsetY);
}