import { createServer } from "node:http";

import { library, modelJson, profileStats, sensors, summary, timeseries } from "./fixtures/api.ts";

const port = Number(process.env.E2E_API_PORT || 3101);

const sendJson = (response, body, status = 200) => {
  response.writeHead(status, {
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
    "content-type": "application/json",
  });
  response.end(JSON.stringify(body));
};

const server = createServer((request, response) => {
  if (!request.url) return sendJson(response, { error: "Missing URL" }, 400);
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
    });
    return response.end();
  }

  const { pathname } = new URL(request.url, `http://${request.headers.host}`);
  if (pathname === "/health") return sendJson(response, { ok: true });
  if (pathname === "/library") return sendJson(response, library);
  if (pathname === "/analytics/profiles") return sendJson(response, profileStats);
  if (pathname === "/analytics/summary") return sendJson(response, summary);
  if (pathname === "/analytics/sensors") return sendJson(response, sensors);
  if (pathname === "/analytics/timeseries") return sendJson(response, timeseries);
  if (pathname === "/analytics/versions") {
    return sendJson(response, { ha_versions: [], powercalc_versions: [] });
  }
  if (pathname === "/analytics/countries") return sendJson(response, []);
  if (pathname.startsWith("/profile/")) return sendJson(response, modelJson);
  if (pathname.startsWith("/download/")) return sendJson(response, []);

  return sendJson(response, { error: "Fixture not found" }, 404);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Powercalc fixture API listening on http://127.0.0.1:${port}`);
});
