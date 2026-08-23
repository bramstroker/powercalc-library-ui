import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import sharp from "sharp";

const output = (name) => resolve("public", name);
const favicon = await readFile(resolve("public/favicon.svg"), "utf8");
const whiteGlyph = favicon.replace(".glyph { fill: #5488e8; }", ".glyph { fill: #ffffff; }");

const squareIcon = async (size, name, padding = Math.round(size * 0.18)) => {
  const glyphSize = size - padding * 2;
  const glyph = await sharp(Buffer.from(whiteGlyph)).resize(glyphSize, glyphSize).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: "#303f9f" },
  })
    .composite([{ input: glyph, left: padding, top: padding }])
    .png()
    .toFile(output(name));
};

await Promise.all([
  squareIcon(180, "apple-touch-icon.png", 28),
  squareIcon(192, "icon-192.png"),
  squareIcon(512, "icon-512.png"),
  squareIcon(512, "icon-maskable-512.png", 102),
]);

const socialCard = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#303f9f"/>
  <circle cx="190" cy="315" r="112" fill="#ffffff" fill-opacity="0.1"/>
  <g transform="translate(135 205) scale(3.62)" fill="#ffffff">
    <path d="M16.17 26.61 8.09 33.45v-23.2c0-.61.5-1.11 1.11-1.11h6.97v17.48Zm10.55-8.92-8.08 6.84V9.14h8.08v8.55Zm2.47-2.1V9.13h7.63l-7.63 6.46ZM6.11 59.15l7.19-12.56.47-.81 5.31-9.29H8.43c-.39 0-.57-.48-.27-.73l29.1-24.63-8.08 14.61-2.47 4.48h6.98c.77 0 1.26.81.92 1.49L25.2 50.52l2.19-.19c6.09-.52 11.55-3.21 15.63-7.29a25.07 25.07 0 0 0 7.38-17.65C50.49 11.44 38.7.02 24.75.02H9.64C4.32 0 0 4.32 0 9.64v47.87c0 3.35 4.44 4.54 6.11 1.65Z"/>
  </g>
  <text x="360" y="278" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700">Powercalc</text>
  <text x="362" y="354" fill="#ffffff" fill-opacity="0.88" font-family="Arial, Helvetica, sans-serif" font-size="42">Profile Library</text>
  <text x="362" y="426" fill="#ffffff" fill-opacity="0.72" font-family="Arial, Helvetica, sans-serif" font-size="26">Community-measured power profiles for Home Assistant</text>
</svg>`;

await sharp(Buffer.from(socialCard)).png().toFile(output("social-card.png"));

console.log("Generated Powercalc social and application icons");
