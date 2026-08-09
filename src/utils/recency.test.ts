import { describe, expect, it } from "vitest";

import { ColorMode } from "../types/ColorMode";
import { DeviceType } from "../types/DeviceType";
import type { PowerProfile } from "../types/PowerProfile";

import { isRecentlyAdded, recentlyAdded } from "./recency";

const NOW = new Date("2026-08-08T00:00:00Z");

const createProfile = (createdAt: string, modelId = "M1"): PowerProfile => ({
  manufacturer: { dirName: "signify", fullName: "Signify" },
  modelId,
  name: "A light",
  aliases: [],
  deviceType: DeviceType.LIGHT,
  colorModes: [ColorMode.BRIGHTNESS],
  updatedAt: new Date("2026-08-01T00:00:00Z"),
  createdAt: new Date(createdAt),
  description: "",
  measureDevice: "Shelly Plug S",
  measureMethod: "script",
  measureDescription: "",
  calculationStrategy: "lut",
  standbyPower: 0.4,
  maxPower: 9,
  author: { name: "Bram", githubUsername: "bramstroker" },
  subProfileCount: 0,
  minVersion: null,
  compatibleIntegrations: [],
  usageStats: { installationCount: 1, deviceCount: 1, percentage: 0.1 },
});

describe("isRecentlyAdded", () => {
  it("flags a profile added inside the window", () => {
    expect(isRecentlyAdded(createProfile("2026-07-20T00:00:00Z"), NOW)).toBe(true);
  });

  it("does not flag one added before the window", () => {
    expect(isRecentlyAdded(createProfile("2026-05-01T00:00:00Z"), NOW)).toBe(false);
  });

  it("ignores updatedAt entirely", () => {
    // Nearly every profile has a recent updatedAt from bulk re-imports, so it must not count.
    const old = createProfile("2024-01-01T00:00:00Z");
    old.updatedAt = NOW;

    expect(isRecentlyAdded(old, NOW)).toBe(false);
  });

  it("does not flag a future creation date", () => {
    expect(isRecentlyAdded(createProfile("2026-09-01T00:00:00Z"), NOW)).toBe(false);
  });
});

describe("recentlyAdded", () => {
  it("returns matches newest first", () => {
    const profiles = [
      createProfile("2026-07-01T00:00:00Z", "just-outside"),
      createProfile("2026-08-05T00:00:00Z", "newest"),
      createProfile("2020-01-01T00:00:00Z", "ancient"),
      createProfile("2026-07-25T00:00:00Z", "middle"),
    ];

    // "just-outside" is 38 days old, so the 30-day window excludes it.
    expect(recentlyAdded(profiles, 30, NOW).map((p) => p.modelId)).toEqual(["newest", "middle"]);

    expect(recentlyAdded(profiles, 90, NOW).map((p) => p.modelId)).toEqual([
      "newest",
      "middle",
      "just-outside",
    ]);
  });
});
