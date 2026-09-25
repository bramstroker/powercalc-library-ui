import { spawn } from "node:child_process";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const children = new Set();

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    children.add(child);
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      children.delete(child);
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${signal ?? code}`));
    });
  });

const socialCardsDir = await mkdtemp(join(tmpdir(), "powercalc-social-cards-"));
try {
  await Promise.all([
    run("react-router", ["build"]).then(() => run("node", ["scripts/generate-sitemap.mjs"])),
    run("node", ["scripts/generate-profile-social-images.mjs", "--out", socialCardsDir]),
  ]);
  await cp(socialCardsDir, "build/client", { recursive: true });
} catch (error) {
  for (const child of children) child.kill();
  throw error;
} finally {
  await rm(socialCardsDir, { recursive: true, force: true });
}
