import { createHash } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DEFAULT_API_URL = "https://api.powercalc.nl/library";
const DEFAULT_OUTPUT_DIR = resolve("public/avatars");
const DEFAULT_SIZE = 192;
const OUTPUT_SIZES = [96, 192];
const DEFAULT_CONCURRENCY = 8;
const MANIFEST_FILE_NAME = "manifest.json";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

// Avatars are addressed by username, so anything that is not a valid GitHub login cannot be stored
// as a predictable file name and is skipped rather than escaped.
const isValidUsername = (username) => /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/iu.test(username);
const generatedAvatarFiles = (avatarPath) => {
  if (typeof avatarPath !== "string" || !avatarPath.startsWith("/avatars/")) return [];
  const fileName = avatarPath.slice("/avatars/".length);
  if (/^[a-z\d](?:[a-z\d-]{0,38})\.(?:gif|jpe?g|png|webp)$/u.test(fileName)) {
    return [fileName];
  }
  if (!/^[a-z\d](?:[a-z\d-]{0,38})-[a-f\d]{12}$/u.test(fileName)) return [];
  return OUTPUT_SIZES.map((size) => `${fileName}-${size}.webp`);
};

const readManifest = async (outputDir) => {
  try {
    const manifest = JSON.parse(await readFile(resolve(outputDir, MANIFEST_FILE_NAME), "utf8"));
    return manifest && typeof manifest === "object" && !Array.isArray(manifest) ? manifest : {};
  } catch {
    return {};
  }
};

export const collectAuthorUsernames = (library) => {
  const usernames = new Set();

  for (const manufacturer of library.manufacturers ?? []) {
    for (const model of manufacturer.models ?? []) {
      for (const author of model.authors ?? []) {
        if (author.github && isValidUsername(author.github))
          usernames.add(author.github.toLowerCase());
      }
    }
  }

  return [...usernames].sort((a, b) => a.localeCompare(b));
};

export const avatarFileName = (username, fingerprint, size) =>
  `${username.toLowerCase()}-${fingerprint}-${size}.webp`;

const downloadAvatar = async (username, { fetchImpl, outputDir, size }) => {
  const response = await fetchImpl(`https://github.com/${username}.png?size=${size}`, {
    headers: { "user-agent": "powercalc-avatar-downloader/1.0" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const contents = Buffer.from(await response.arrayBuffer());
  if (contents.byteLength > MAX_AVATAR_BYTES) {
    throw new Error(`avatar exceeds ${MAX_AVATAR_BYTES} bytes`);
  }

  // GitHub's `size` parameter is only a hint and its response format follows the original upload.
  // Normalize both here so a 40–64 px UI avatar never ships a multi-megapixel PNG or JPEG.
  const largest = await sharp(contents, { animated: true })
    .rotate()
    .resize(size, size, { fit: "cover" })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
  const fingerprint = createHash("sha256").update(largest).digest("hex").slice(0, 12);
  const baseName = `${username.toLowerCase()}-${fingerprint}`;

  await Promise.all(
    OUTPUT_SIZES.map(async (outputSize) => {
      const optimized =
        outputSize === size
          ? largest
          : await sharp(contents, { animated: true })
              .rotate()
              .resize(outputSize, outputSize, { fit: "cover" })
              .webp({ quality: 82, effort: 4 })
              .toBuffer();
      await writeFile(
        resolve(outputDir, avatarFileName(username, fingerprint, outputSize)),
        optimized,
      );
    }),
  );
  return baseName;
};

/**
 * Copies every contributor avatar into Vite's public directory and writes the path manifest that
 * Vite embeds in the application bundle. Individual failures are tolerated: `GithubAvatar` falls
 * back to the GitHub URL for anything missing.
 */
export const downloadAvatars = async ({
  apiUrl = DEFAULT_API_URL,
  outputDir = DEFAULT_OUTPUT_DIR,
  size = DEFAULT_SIZE,
  concurrency = DEFAULT_CONCURRENCY,
  fetchImpl = fetch,
} = {}) => {
  const response = await fetchImpl(apiUrl, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`Unable to download avatars: ${apiUrl} returned HTTP ${response.status}`);
  }

  const usernames = collectAuthorUsernames(await response.json());
  await mkdir(outputDir, { recursive: true });
  const previousManifest = await readManifest(outputDir);

  const queue = [...usernames];
  const failures = [];
  const manifest = {};
  let downloaded = 0;

  const worker = async () => {
    for (let username = queue.shift(); username; username = queue.shift()) {
      try {
        const baseName = await downloadAvatar(username, {
          fetchImpl,
          outputDir,
          size,
        });
        manifest[username] = `/avatars/${baseName}`;
        downloaded += 1;
      } catch (error) {
        failures.push({
          username,
          reason: error instanceof Error ? error.message : `${error}`,
        });
      }
    }
  };

  const requestedConcurrency = Number.isFinite(concurrency)
    ? Math.max(1, Math.floor(concurrency))
    : DEFAULT_CONCURRENCY;
  const workerCount = Math.min(requestedConcurrency, queue.length);
  await Promise.all(Array.from({ length: workerCount }, worker));

  const sortedManifest = Object.fromEntries(
    usernames.flatMap((username) => (manifest[username] ? [[username, manifest[username]]] : [])),
  );
  const currentFiles = new Set(Object.values(sortedManifest));
  await Promise.all(
    Object.values(previousManifest).map(async (previousPath) => {
      if (typeof previousPath !== "string" || currentFiles.has(previousPath)) return;
      await Promise.all(
        generatedAvatarFiles(previousPath).map(async (fileName) => {
          try {
            await unlink(resolve(outputDir, fileName));
          } catch (error) {
            if (!(
              error &&
              typeof error === "object" &&
              "code" in error &&
              error.code === "ENOENT"
            )) {
              throw error;
            }
          }
        }),
      );
    }),
  );

  await writeFile(
    resolve(outputDir, MANIFEST_FILE_NAME),
    `${JSON.stringify(sortedManifest, null, 2)}\n`,
    "utf8",
  );

  return {
    total: usernames.length,
    downloaded,
    failures,
    manifest: sortedManifest,
  };
};

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const { total, downloaded, failures } = await downloadAvatars({
    apiUrl: process.env.LIBRARY_API_URL,
    outputDir: process.env.AVATARS_OUTPUT_DIR,
    size: process.env.AVATAR_SIZE ? Number(process.env.AVATAR_SIZE) : undefined,
  });
  console.log(`Downloaded ${downloaded}/${total} contributor avatars`);
  for (const { username, reason } of failures) {
    console.warn(`Skipped avatar for ${username}: ${reason}`);
  }
}
