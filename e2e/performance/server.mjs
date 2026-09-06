// Production-like compressed static delivery. Vite preview sends uncompressed assets, which
// distorts a bandwidth-limited test. This server is only used for the performance build.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve("build/client");
const types = {
  ".js": "application/javascript",
  ".html": "text/html",
  ".json": "application/json",
  ".data": "text/x-script",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};
const cache = new Map();
createServer(async (request, response) => {
  try {
    let path = resolve(
      root,
      `.${decodeURIComponent(new URL(request.url, "http://localhost").pathname)}`,
    );
    if (path !== root && !path.startsWith(root + sep)) throw new Error("Invalid path");
    if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
    let body = cache.get(path);
    if (!body) {
      body = gzipSync(await readFile(path));
      cache.set(path, body);
    }
    response.writeHead(200, {
      "content-type": types[extname(path)] ?? "application/octet-stream",
      "content-encoding": "gzip",
      "content-length": body.length,
      "cache-control": "no-cache",
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}).listen(3200, "127.0.0.1");
