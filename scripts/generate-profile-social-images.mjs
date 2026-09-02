import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { profileSocialImagePath } from "../src/utils/urlSlugs.mjs";

import { DEFAULT_LIBRARY_API_URL } from "./generate-sitemap.mjs";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const DEFAULT_CONCURRENCY = 6;

const XML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

export const escapeXml = (value) =>
  String(value).replace(/[&<>"']/gu, (character) => XML_ENTITIES[character]);

const truncate = (value, maxLength) => {
  const characters = Array.from(String(value));
  return characters.length <= maxLength
    ? characters.join("")
    : `${characters.slice(0, Math.max(1, maxLength - 1)).join("")}…`;
};

export const wrapText = (value, maxCharacters, maxLines = 2) => {
  const words = String(value).trim().split(/\s+/u).filter(Boolean);
  if (words.length === 0) return ["Unknown product"];

  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharacters || !current) {
      current = candidate;
      continue;
    }

    lines.push(truncate(current, maxCharacters));
    current = word;
    if (lines.length === maxLines) {
      current = "";
      break;
    }
  }

  if (lines.length < maxLines && current) lines.push(current);
  const consumed = lines.join(" ");
  if (consumed.length < words.join(" ").length) {
    lines[lines.length - 1] = truncate(`${lines[lines.length - 1]}…`, maxCharacters);
  }

  return lines.slice(0, maxLines).map((line) => truncate(line, maxCharacters));
};

const humanizeIdentifier = (value) =>
  String(value || "device")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const powerValue = (value) => {
  if (value == null || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(number)} W`;
};

const textLines = (lines, x, firstBaseline, lineHeight) =>
  lines
    .map(
      (line, index) =>
        `<tspan x="${x}" y="${firstBaseline + index * lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");

export const renderProfileSocialCardSvg = (manufacturer, model) => {
  const manufacturerName = truncate(manufacturer.full_name || manufacturer.dir_name, 38);
  const productLines = wrapText(model.name || model.id, 26, 2);
  const modelId = truncate(model.id, 28);
  const deviceType = truncate(humanizeIdentifier(model.device_type), 28);
  const maxPower = model.max_power ?? model.power_range?.max;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" font-family="DejaVu Sans, sans-serif">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#eef1ff"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#536dfe"/>
      <stop offset="1" stop-color="#303f9f"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" rx="0" fill="url(#background)"/>
  <rect width="18" height="630" fill="url(#accent)"/>

  <g transform="translate(68 52)">
    <rect width="54" height="54" rx="13" fill="#303f9f"/>
    <g transform="translate(80 12)">
      <text y="25" fill="#303f9f" font-size="27" font-weight="700" letter-spacing="1.4">POWERCALC</text>
      <text x="205" y="25" fill="#667085" font-size="27">PROFILE LIBRARY</text>
    </g>
    <g transform="translate(13 11) scale(.52)" fill="#ffffff">
      <path d="M16.17 26.61 8.09 33.45v-23.2c0-.61.5-1.11 1.11-1.11h6.97v17.48Zm10.55-8.92-8.08 6.84V9.14h8.08v8.55Zm2.47-2.1V9.13h7.63l-7.63 6.46ZM6.11 59.15l7.19-12.56.47-.81 5.31-9.29H8.43c-.39 0-.57-.48-.27-.73l29.1-24.63-8.08 14.61-2.47 4.48h6.98c.77 0 1.26.81.92 1.49L25.2 50.52l2.19-.19c6.09-.52 11.55-3.21 15.63-7.29a25.07 25.07 0 0 0 7.38-17.65C50.49 11.44 38.7.02 24.75.02H9.64C4.32 0 0 4.32 0 9.64v47.87c0 3.35 4.44 4.54 6.11 1.65Z"/>
    </g>
  </g>

  <text x="72" y="174" fill="#4455bd" font-size="30" font-weight="700">${escapeXml(manufacturerName)}</text>
  <text x="72" fill="#171923" font-size="54" font-weight="700">${textLines(productLines, 72, 244, 64)}</text>

  <g transform="translate(72 374)">
    <rect width="${Math.max(144, 28 + modelId.length * 15)}" height="52" rx="26" fill="#ffffff" stroke="#b9c1eb" stroke-width="2"/>
    <text x="22" y="35" fill="#303f9f" font-size="24" font-weight="700">${escapeXml(modelId)}</text>
  </g>
  <g transform="translate(72 444)">
    <circle cx="18" cy="18" r="18" fill="#e5e9ff"/>
    <path d="M10 18h16M18 10v16" stroke="#4455bd" stroke-width="3" stroke-linecap="round"/>
    <text x="50" y="26" fill="#4a5061" font-size="26">${escapeXml(deviceType)}</text>
  </g>

  <g transform="translate(810 146)">
    <rect width="318" height="330" rx="28" fill="#303f9f"/>
    <text x="34" y="58" fill="#cbd2ff" font-size="20" font-weight="700" letter-spacing="1.6">POWER FIGURES</text>
    <text x="34" y="110" fill="#ffffff" fill-opacity=".78" font-size="23">Standby</text>
    <text x="34" y="163" fill="#ffffff" font-size="43" font-weight="700">${escapeXml(powerValue(model.standby_power))}</text>
    <line x1="34" y1="198" x2="284" y2="198" stroke="#ffffff" stroke-opacity=".2"/>
    <text x="34" y="244" fill="#ffffff" fill-opacity=".78" font-size="23">Maximum</text>
    <text x="34" y="297" fill="#ffffff" font-size="43" font-weight="700">${escapeXml(powerValue(maxPower))}</text>
  </g>

  <line x1="72" y1="538" x2="1128" y2="538" stroke="#d6daea" stroke-width="2"/>
  <text x="72" y="584" fill="#667085" font-size="23">Community-measured power profile</text>
  <text x="1128" y="584" text-anchor="end" fill="#303f9f" font-size="23" font-weight="700">library.powercalc.nl</text>
</svg>`;
};

export const profileSocialImageOutputPath = (outDir, manufacturer, model) =>
  join(outDir, decodeURIComponent(profileSocialImagePath(manufacturer, model)).replace(/^\/+/, ""));

const writeProfileSocialImage = async (outDir, manufacturer, model) => {
  const outputPath = profileSocialImageOutputPath(outDir, manufacturer.dir_name, model.id);
  await mkdir(dirname(outputPath), { recursive: true });
  await sharp(Buffer.from(renderProfileSocialCardSvg(manufacturer, model)))
    .png({ compressionLevel: 9, palette: true, colors: 64 })
    .toFile(outputPath);
  return outputPath;
};

export const generateProfileSocialImages = async ({
  library,
  outDir,
  concurrency = DEFAULT_CONCURRENCY,
  onFile,
}) => {
  const profiles = library.manufacturers.flatMap((manufacturer) =>
    manufacturer.models.map((model) => ({ manufacturer, model })),
  );
  let cursor = 0;

  const worker = async () => {
    while (cursor < profiles.length) {
      const profile = profiles[cursor++];
      const outputPath = await writeProfileSocialImage(outDir, profile.manufacturer, profile.model);
      onFile?.(outputPath);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(Math.max(1, concurrency), profiles.length) }, () => worker()),
  );
  return profiles.length;
};

const fetchLibrary = async (apiUrl) => {
  const response = await fetch(apiUrl, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    throw new Error(`Unable to generate social images: ${apiUrl} returned ${response.status}`);
  }
  return response.json();
};

const parseOutputDirectory = (argv) => {
  const outputIndex = argv.findIndex((argument) => argument === "--out");
  const inlineOutput = argv.find((argument) => argument.startsWith("--out="))?.split("=")[1];
  return resolve(inlineOutput ?? (outputIndex >= 0 ? argv[outputIndex + 1] : "build/client"));
};

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const outDir = parseOutputDirectory(process.argv.slice(2));
  const count = await generateProfileSocialImages({
    library: await fetchLibrary(process.env.LIBRARY_API_URL ?? DEFAULT_LIBRARY_API_URL),
    outDir,
    onFile: (outputPath) => console.log(`Generated ${outputPath}`),
  });
  console.log(`Generated ${count} profile social images into ${outDir}`);
}
