import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const eligible = (path) =>
  /(?:\.html|\.data)$/.test(path) || path.startsWith("social-cards/") || path === "sitemap.xml";
const safePath = (path) => {
  if (path.startsWith("/") || path.split("/").includes("..") || /[\r\n\\]/.test(path))
    throw new Error(`Unsafe content path: ${path}`);
  return path;
};

export const snapshot = async (directory) => {
  const manifest = {};
  const visit = async (relative = "") => {
    for (const entry of await readdir(join(directory, relative), { withFileTypes: true })) {
      const path = safePath(join(relative, entry.name));
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && eligible(path))
        manifest[path] = createHash("sha256")
          .update(await readFile(join(directory, path)))
          .digest("hex");
    }
  };
  await visit();
  return manifest;
};

export const contentDelta = (previous, next) => ({
  changed: Object.keys(next)
    .filter((path) => previous[path] !== next[path])
    .map(safePath)
    .sort(),
  removed: Object.keys(previous)
    .filter((path) => !(path in next))
    .map(safePath)
    .sort(),
});

export const urlsForFile = (path, siteUrl) => {
  safePath(path);
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const fileUrl = new URL(`/${encoded}`, siteUrl).href;
  if (path === "index.html") return [new URL("/", siteUrl).href, fileUrl];
  if (path.endsWith("/index.html")) {
    const route = encoded.slice(0, -"/index.html".length);
    return [new URL(`/${route}`, siteUrl).href, new URL(`/${route}/`, siteUrl).href, fileUrl];
  }
  return [fileUrl];
};

export const cachePlan = (delta, siteUrl = "https://library.powercalc.nl") => ({
  purge: [
    ...new Set([...delta.changed, ...delta.removed].flatMap((path) => urlsForFile(path, siteUrl))),
  ],
  // One canonical URL per changed file is sufficient to warm it; removed URLs must stay cold.
  warm: delta.changed
    .filter((path) => path !== "__spa-fallback.html")
    .map((path) => urlsForFile(path, siteUrl)[0]),
});

export const prepareRefresh = async (directory) => {
  let previous = {};
  try {
    previous = JSON.parse(await readFile(join(directory, "previous-manifest.json"), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const next = await snapshot(join(directory, "next"));
  const delta = contentDelta(previous, next);
  await mkdir(join(directory, "delta"), { recursive: true });
  for (const path of delta.changed) {
    const target = join(directory, "delta", path);
    await mkdir(dirname(target), { recursive: true });
    await cp(join(directory, "next", path), target);
  }
  await writeFile(join(directory, "next-manifest.json"), JSON.stringify(next));
  await writeFile(
    join(directory, "removed.txt"),
    delta.removed.map((path) => `${path}\n`).join(""),
  );
  await writeFile(join(directory, "cache-plan.json"), JSON.stringify(cachePlan(delta)));
  console.log(`Content refresh: ${delta.changed.length} changed, ${delta.removed.length} removed`);
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = resolve(process.argv[3] ?? "build/client");
  if (process.argv[2] === "snapshot")
    await writeFile(
      join(directory, ".content-manifest.json"),
      JSON.stringify(await snapshot(directory)),
    );
  else if (process.argv[2] === "prepare") await prepareRefresh(directory);
  else throw new Error("Expected snapshot or prepare");
}
