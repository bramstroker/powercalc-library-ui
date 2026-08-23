import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import sharp from "sharp";

import { avatarFileName, collectAuthorUsernames, downloadAvatars } from "./download-avatars.mjs";

const library = {
  manufacturers: [
    {
      models: [
        {
          authors: [
            { github: "Alice-Example" },
            { github: "alice-example" },
            { github: "invalid username" },
            { github: "bob" },
          ],
        },
      ],
    },
  ],
};

test("collects unique lowercase GitHub usernames", () => {
  assert.deepEqual(collectAuthorUsernames(library), ["alice-example", "bob"]);
});

test("uses a fingerprinted, size-specific WebP file name", () => {
  assert.equal(avatarFileName("Alice", "a1b2c3d4e5f6", 96), "alice-a1b2c3d4e5f6-96.webp");
});

test("downloads avatars and writes a same-origin manifest", async () => {
  const outputDir = await mkdtemp(join(tmpdir(), "powercalc-avatars-"));

  try {
    await writeFile(join(outputDir, "old-user.png"), "old");
    await writeFile(
      join(outputDir, "manifest.json"),
      `${JSON.stringify({ "old-user": "/avatars/old-user.png" })}\n`,
    );

    const fetchImpl = async (url) => {
      if (url === "https://example.com/library") {
        return new Response(JSON.stringify(library), {
          headers: { "content-type": "application/json" },
        });
      }
      if (String(url).includes("alice-example")) {
        return new Response(
          '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="red"/></svg>',
          {
            headers: { "content-type": "image/svg+xml" },
          },
        );
      }
      return new Response("missing", { status: 404 });
    };

    const result = await downloadAvatars({
      apiUrl: "https://example.com/library",
      outputDir,
      concurrency: 2,
      fetchImpl,
    });

    assert.equal(result.total, 2);
    assert.equal(result.downloaded, 1);
    assert.deepEqual(result.failures, [{ username: "bob", reason: "HTTP 404" }]);
    const avatarBase = result.manifest["alice-example"];
    assert.match(avatarBase, /^\/avatars\/alice-example-[a-f\d]{12}$/u);
    assert.deepEqual(
      JSON.parse(await readFile(join(outputDir, "manifest.json"), "utf8")),
      result.manifest,
    );
    for (const size of [96, 192]) {
      const avatar = await readFile(
        join(outputDir, `${avatarBase.slice("/avatars/".length)}-${size}.webp`),
      );
      const { format, width, height } = await sharp(avatar).metadata();
      assert.deepEqual({ format, width, height }, { format: "webp", width: size, height: size });
    }
    await assert.rejects(readFile(join(outputDir, "old-user.png")), {
      code: "ENOENT",
    });
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});
