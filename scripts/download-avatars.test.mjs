import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  avatarFileName,
  collectAuthorUsernames,
  downloadAvatars,
} from "./download-avatars.mjs";

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

test("uses the response content type as the stored extension", () => {
  assert.equal(avatarFileName("Alice", "image/jpeg; charset=binary"), "alice.jpg");
  assert.equal(avatarFileName("Alice", "text/html"), undefined);
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
        return new Response(Uint8Array.from([1, 2, 3]), {
          headers: { "content-type": "image/jpeg" },
        });
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
    assert.deepEqual(result.manifest, {
      "alice-example": "/avatars/alice-example.jpg",
    });
    assert.deepEqual(
      JSON.parse(await readFile(join(outputDir, "manifest.json"), "utf8")),
      result.manifest,
    );
    assert.deepEqual([...await readFile(join(outputDir, "alice-example.jpg"))], [1, 2, 3]);
    await assert.rejects(readFile(join(outputDir, "old-user.png")), { code: "ENOENT" });
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});
