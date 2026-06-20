// Generates PWA icon PNGs from an inline SVG mark into /public.
// Run with: npm run gen:icons
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
mkdirSync(pub, { recursive: true });

// rx = corner radius (112 = rounded app tile, 0 = full-bleed for maskable/iOS)
const mark = (rx) => `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="${rx}" fill="#111217"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="#5C4524" stroke-width="30"/>
  <g transform="rotate(-90 256 256)">
    <circle cx="256" cy="256" r="150" fill="none" stroke="#F0A03C" stroke-width="30"
      stroke-linecap="round" stroke-dasharray="942.48" stroke-dashoffset="235.62"/>
  </g>
  <path d="M186 260 l46 46 l94 -106" fill="none" stroke="#F0A03C" stroke-width="32"
    stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const rounded = mark(112);
const square = mark(0);

const png = (svg, size, out) =>
  sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(pub, out));

await Promise.all([
  png(rounded, 192, "pwa-192x192.png"),
  png(rounded, 512, "pwa-512x512.png"),
  png(square, 512, "maskable-512x512.png"),
  png(square, 180, "apple-touch-icon.png"),
  png(rounded, 64, "favicon-64.png"),
]);

console.log("✓ icons generated in public/");
