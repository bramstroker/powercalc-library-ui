// Render two SVG files at the same size and report how many pixels differ, so a rewrite of the
// path data can be checked against the artwork it came from rather than eyeballed.
//
//   node .claude/skills/add-manufacturer-logo/scripts/diffsvg.mjs <a.svg> <b.svg> [width]
//
// Run it from the repository root — it resolves Playwright out of the project's node_modules.
// A few dozen differing pixels on a detailed mark is edge antialiasing; a percent or more is a
// real shift, so render both and look before accepting it.
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const [a, b, sizeArg] = process.argv.slice(2);
const size = Number(sizeArg) || 600;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 100, height: 100 } });

const load = (file) =>
  "data:image/svg+xml;base64," +
  Buffer.from(readFileSync(file, "utf8").replace(/<\?xml[^>]*\?>/g, "")).toString("base64");

const result = await page.evaluate(
  async ([srcA, srcB, W]) => {
    const draw = async (src) => {
      const img = new Image();
      await new Promise((ok, err) => {
        img.onload = ok;
        img.onerror = () => err(new Error("failed to decode"));
        img.src = src;
      });
      const H = Math.max(1, Math.round((img.height / img.width) * W)) || W;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, W, H);
      return { data: ctx.getImageData(0, 0, W, H).data, W, H };
    };
    const x = await draw(srcA);
    const y = await draw(srcB);
    if (x.W !== y.W || x.H !== y.H) return { error: `size ${x.W}x${x.H} vs ${y.W}x${y.H}` };
    let differing = 0;
    let worst = 0;
    for (let i = 0; i < x.data.length; i += 4) {
      let d = 0;
      for (let k = 0; k < 4; k++) d = Math.max(d, Math.abs(x.data[i + k] - y.data[i + k]));
      if (d > 8) differing++;
      worst = Math.max(worst, d);
    }
    return { differing, total: x.W * x.H, worst, W: x.W, H: x.H };
  },
  [load(a), load(b), size],
);

console.log(
  result.error ??
    `${result.W}x${result.H}: ${result.differing}/${result.total} px differ ` +
      `(${((100 * result.differing) / result.total).toFixed(3)}%), worst channel delta ${result.worst}`,
);
await browser.close();
