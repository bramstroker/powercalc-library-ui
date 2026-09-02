import { spawn } from "node:child_process";
import { resolve } from "node:path";

const API_PORT = 3101;
const API_URL = `http://127.0.0.1:${API_PORT}`;
const fixtureServer = spawn(
  process.execPath,
  ["--experimental-strip-types", resolve("e2e/fixture-server.mjs")],
  {
    env: { ...process.env, E2E_API_PORT: `${API_PORT}` },
    stdio: ["ignore", "inherit", "inherit"],
  },
);

const stopFixtureServer = () => {
  if (!fixtureServer.killed) fixtureServer.kill("SIGTERM");
};
process.once("exit", stopFixtureServer);
process.once("SIGINT", () => {
  stopFixtureServer();
  process.exit(130);
});
process.once("SIGTERM", () => {
  stopFixtureServer();
  process.exit(143);
});

try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      // The fixture process normally needs one or two attempts to start listening.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  if (!ready) throw new Error("Performance fixture API did not become ready");

  const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm";
  const build = spawn(npmExecutable, ["run", "build"], {
    env: {
      ...process.env,
      E2E: "1",
      LIBRARY_API_URL: `${API_URL}/library/full`,
      VITE_API_BASE_URL: API_URL,
    },
    stdio: "inherit",
  });
  const exitCode = await new Promise((resolveExit) => build.once("exit", resolveExit));
  if (exitCode !== 0) process.exitCode = typeof exitCode === "number" ? exitCode : 1;
} finally {
  stopFixtureServer();
}
