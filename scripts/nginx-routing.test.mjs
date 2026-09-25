import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { collectLegacyRedirects, renderNginxRedirectMap } from "./generate-sitemap.mjs";

const nginx = process.env.NGINX_BIN ?? "nginx";
const available = spawnSync(nginx, ["-v"]).status === 0;

test(
  "Nginx serves canonical HTML, redirects legacy IDs and returns real 404s",
  { skip: !available && "Install nginx to run the HTTP routing integration test" },
  async () => {
    const directory = await mkdtemp(join(tmpdir(), "powercalc-nginx-"));
    let server;
    let stopped;
    try {
      const portServer = createServer();
      portServer.listen(0, "127.0.0.1");
      await once(portServer, "listening");
      const port = portServer.address().port;
      await new Promise((resolve) => portServer.close(resolve));
      const root = join(directory, "html");
      const canonical = "/profiles/shelly/snpl-00112eu";
      await mkdir(join(root, canonical), { recursive: true });
      await writeFile(join(root, canonical, "index.html"), "<h1>Shelly Plus Plug S</h1>");
      await writeFile(join(root, "__spa-fallback.html"), "Loading Powercalc library…");
      const mapPath = join(directory, "redirects.conf");
      await writeFile(
        mapPath,
        renderNginxRedirectMap(
          collectLegacyRedirects({
            manufacturers: [
              {
                dir_name: "shelly",
                models: [{ id: "SNPL-00112EU", legacy_ids: ["Shelly Plus Plug S"] }],
              },
            ],
          }),
        ),
      );
      const securityPath = new URL("../etc/security-headers.conf", import.meta.url).pathname;
      const siteConfig = (await readFile(new URL("../etc/nginx.conf", import.meta.url), "utf8"))
        .replace("listen 80;", `listen 127.0.0.1:${port};`)
        .replaceAll("/usr/share/nginx/html", root)
        .replaceAll("/etc/nginx/security-headers.conf", securityPath);
      const config = join(directory, "nginx.conf");
      await writeFile(
        config,
        `pid ${directory}/nginx.pid;\nerror_log ${directory}/error.log;\nevents {}\nhttp { access_log off; include ${mapPath}; ${siteConfig} }`,
      );
      const args = ["-p", directory, "-c", config];
      const validation = spawnSync(nginx, [...args, "-t"], { encoding: "utf8" });
      assert.equal(validation.status, 0, validation.stderr);
      server = spawn(nginx, [...args, "-g", "daemon off;"], { stdio: "ignore" });
      stopped = once(server, "exit");
      const base = `http://127.0.0.1:${port}`;
      let ready = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        try {
          if ((await fetch(`${base}${canonical}`)).status === 200) {
            ready = true;
            break;
          }
        } catch {
          /* Wait for the local Nginx worker. */
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      assert.ok(ready, "Nginx did not start");
      for (const suffix of ["", "/", "/index.html"]) {
        const response = await fetch(`${base}${canonical}${suffix}`, { redirect: "manual" });
        assert.equal(response.status, suffix ? 301 : 200, `${canonical}${suffix}`);
        if (suffix) assert.equal(response.headers.get("location"), canonical);
        assert.match(
          await (await fetch(`${base}${canonical}${suffix}`)).text(),
          /Shelly Plus Plug S/,
        );
      }
      for (const path of [
        "/profiles/shelly/shelly-plus-plug-s",
        "/profiles/shelly/Shelly%20Plus%20Plug%20S",
        "/profiles/shelly/SNPL-00112EU",
      ]) {
        for (const suffix of ["", "/", "/index.html"]) {
          const response = await fetch(`${base}${path}${suffix}?tab=json`, { redirect: "manual" });
          assert.equal(response.status, 301, `${path}${suffix}`);
          assert.equal(response.headers.get("location"), `${canonical}?tab=json`);
        }
      }
      for (const path of [
        "/profiles/unknown/model",
        "/manufacturers/unknown",
        "/contributors/unknown",
        "/device-types/unknown",
        "/profiles/unknown/model.data",
        "/__spa-fallback.html",
        "/.redirects.json",
      ]) {
        const response = await fetch(`${base}${path}`);
        assert.equal(response.status, 404, path);
        assert.ok(!(await response.text()).includes("Loading Powercalc"));
      }
      // Publishing a new page and reloading redirects makes both URLs available without a rebuild.
      const next = "/profiles/shelly/new-model";
      await mkdir(join(root, next), { recursive: true });
      await writeFile(join(root, next, "index.html"), "New profile");
      await writeFile(
        mapPath,
        renderNginxRedirectMap([{ from: "/profiles/shelly/previous-model", to: next }]),
      );
      const reload = spawnSync(nginx, [...args, "-s", "reload"], { encoding: "utf8" });
      assert.equal(reload.status, 0, reload.stderr);
      let redirected = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        const response = await fetch(`${base}/profiles/shelly/previous-model`, {
          redirect: "manual",
          headers: { Connection: "close" },
        });
        if (response.status === 301) {
          assert.equal(response.headers.get("location"), next);
          redirected = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      assert.ok(redirected, "Refreshed redirects were not activated");
      assert.equal((await fetch(`${base}${next}`)).status, 200);
      await rm(join(root, next, "index.html"));
      assert.equal((await fetch(`${base}${next}`)).status, 404);
    } finally {
      if (server && server.exitCode === null) {
        server.kill("SIGQUIT");
        await stopped;
      }
      await rm(directory, { recursive: true, force: true });
    }
  },
);
