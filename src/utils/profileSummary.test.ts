import { expect, it } from "vitest";

import { CalculationStrategy } from "../types/CalculationStrategy";
import { DeviceType } from "../types/DeviceType";
import type { PowerProfile } from "../types/PowerProfile";

import { profileSummary } from "./profileSummary";

it("keeps collection identity and dates without serializing measurement details", () => {
  const profile: PowerProfile = {
    manufacturer: { dirName: "ikea", fullName: "IKEA", aliases: [] },
    modelId: "LED123",
    name: "Bulb",
    aliases: ["E27"],
    createdAt: new Date("2025-01-01"),
    deviceType: DeviceType.LIGHT,
    calculationStrategy: CalculationStrategy.LUT,
    colorModes: [],
    measureDevice: "Meter",
    measureMethod: "script",
    authors: [],
    subProfileCount: 0,
    compatibleIntegrations: [],
    ean: [],
    standbyPower: 0.2,
    maxPower: 9,
    usageStats: { installationCount: 20, deviceCount: 40, percentage: 1 },
    description: "Product details",
    measureDescription: "A long measurement report",
    measureSettings: { samples: 1000 },
    productUrl: "https://example.com/product",
  };
  const summary = profileSummary(profile);
  expect(summary.createdAt).toEqual(profile.createdAt);
  expect(summary.aliases).toEqual(["E27"]);
  expect(summary.usageStats).toEqual(profile.usageStats);
  const payload = JSON.stringify(summary);
  expect(payload).not.toMatch(/description|measureDescription|measureSettings|productUrl/i);
  expect(profile.measureDescription).toBe("A long measurement report");
});
