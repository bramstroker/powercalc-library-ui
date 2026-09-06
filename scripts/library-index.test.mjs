import assert from "node:assert/strict";
import test from "node:test";
import { createLibraryIndex } from "./library-index.mjs";

test("retains catalogue identity and filter metadata while removing detail payloads", () => {
  const model = {
    id: "bulb",
    legacy_ids: ["old"],
    aliases: ["TRÅDFRI"],
    ean: ["123"],
    device_specs: { socket: ["E27"], lumens: 800 },
    voltage_range: { min: 225, max: 235 },
    authors: [{ name: "Bram", github: "bramstroker" }],
    description: "Long detail",
    measure_settings: { samples: 100 },
    measure_description: "Measurements",
    hash: "abc",
  };
  const source = { manufacturers: [{ dir_name: "ikea", aliases: ["IKEA"], models: [model] }] };
  const index = createLibraryIndex(source);
  const projected = index.manufacturers[0].models[0];
  for (const key of [
    "id",
    "legacy_ids",
    "aliases",
    "ean",
    "device_specs",
    "voltage_range",
    "authors",
  ])
    assert.deepEqual(projected[key], model[key]);
  assert.equal(projected.description, null);
  assert.equal(projected.measure_description, null);
  assert.equal(projected.measure_settings, undefined);
  assert.equal(projected.hash, undefined);
  assert.equal(model.description, "Long detail");
});
