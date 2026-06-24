import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.SCREENSHOT_BASE_URL ?? "https://goalghost.vercel.app";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "docs", "screenshots");

const PAGES = [
  { name: "home", path: "/" },
  { name: "create", path: "/create" },
  { name: "my-ghost", path: "/ghost" },
  { name: "match-center", path: "/matches" },
  { name: "fan-journey", path: "/memories" },
  { name: "legacy", path: "/legacy" },
];

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome",
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});
const page = await context.newPage();

for (const { name, path: route } of PAGES) {
  const url = `${BASE}${route}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(OUT_DIR, `${name}.png`),
    fullPage: false,
  });
  console.log(`Captured ${name}.png`);
}

await browser.close();
console.log(`Screenshots saved to ${OUT_DIR}`);