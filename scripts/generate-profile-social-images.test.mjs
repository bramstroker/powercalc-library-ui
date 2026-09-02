import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import sharp from "sharp";

import {
  generateProfileSocialImages,
  profileSocialImageOutputPath,
  renderProfileSocialCardSvg,
  wrapText,
} from "./generate-profile-social-images.mjs";

const manufacturer = {
  full_name: "Brand & Co",
  dir_name: "brand & co",
  models: [
    {
      id: "Model / One",
      name: "A <very> capable smart light",
      device_type: "smart_light",
      standby_power: 0.42,
      max_power: 9.5,
    },
  ],
};

describe("profile social images", () => {
  it("uses the available final line before truncating a product name", () => {
    assert.deepEqual(wrapText("Hue White and Color Ambiance A60", 26, 2), [
      "Hue White and Color",
      "Ambiance A60",
    ]);
    assert.deepEqual(wrapText("One two three four five six seven", 11, 2), [
      "One two",
      "three four…",
    ]);
  });

  it("renders the profile identity and power figures into escaped SVG", () => {
    const svg = renderProfileSocialCardSvg(manufacturer, manufacturer.models[0]);

    assert.match(svg, /Brand &amp; Co/u);
    assert.match(svg, /A &lt;very&gt; capable/u);
    assert.match(svg, /Model \/ One/u);
    assert.match(svg, /Smart Light/u);
    assert.match(svg, /0\.42 W/u);
    assert.match(svg, /9\.5 W/u);
  });

  it("writes a social-platform-sized PNG at the profile-specific URL path", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "powercalc-social-images-"));
    try {
      const count = await generateProfileSocialImages({
        library: { manufacturers: [manufacturer] },
        outDir,
      });
      const outputPath = profileSocialImageOutputPath(
        outDir,
        manufacturer.dir_name,
        manufacturer.models[0].id,
      );
      const metadata = await sharp(outputPath).metadata();

      assert.equal(count, 1);
      assert.deepEqual(
        outputPath,
        join(outDir, "social-cards", "profiles", "brand-co", "model-one.png"),
      );
      assert.equal(metadata.format, "png");
      assert.equal(metadata.width, 1200);
      assert.equal(metadata.height, 630);
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });
});
