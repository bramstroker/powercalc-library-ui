import { describe, expect, it } from "vitest";

import type { LibraryModel } from "../api/library.api";
import type { Manufacturer, UsageStats } from "../types/PowerProfile";

import { mapToBasePowerProfile } from "./profileMappers";

const manufacturer: Manufacturer = { dirName: "signify", fullName: "Signify" };

const usageStats: UsageStats = {
  installationCount: 12,
  deviceCount: 34,
  percentage: 1.5,
};

const createModel = (overrides: Partial<LibraryModel> = {}): LibraryModel => ({
  id: "LCA001",
  name: "Hue White A60",
  device_type: "light",
  color_modes: ["brightness", "color_temp"],
  aliases: ["LWB010", "LWB014"],
  author_info: { name: "Bram", email: "bram@example.com", github: "bramstroker" },
  updated_at: "2025-01-02T03:04:05Z",
  created_at: "2024-01-02T03:04:05Z",
  description: "A light bulb",
  measure_device: "Shelly Plug S",
  measure_method: "script",
  measure_description: "Measured with the powercalc measure tool",
  calculation_strategy: "lut",
  max_power: 9,
  standby_power: 0.4,
  standby_power_on: 0.5,
  sub_profile_count: 2,
  min_version: "1.16.0",
  compatible_integrations: ["hue"],
  ...overrides,
});

describe("mapToBasePowerProfile", () => {
  it("maps the library model onto a power profile", () => {
    const profile = mapToBasePowerProfile(createModel(), manufacturer, usageStats);

    expect(profile).toMatchObject({
      manufacturer,
      modelId: "LCA001",
      name: "Hue White A60",
      deviceType: "light",
      colorModes: ["brightness", "color_temp"],
      description: "A light bulb",
      measureDevice: "Shelly Plug S",
      measureMethod: "script",
      calculationStrategy: "lut",
      maxPower: 9,
      standbyPower: 0.4,
      standbyPowerOn: 0.5,
      subProfileCount: 2,
      minVersion: "1.16.0",
      compatibleIntegrations: ["hue"],
      usageStats,
    });
  });

  it("keeps the aliases as a list", () => {
    const profile = mapToBasePowerProfile(createModel(), manufacturer, usageStats);

    expect(profile.aliases).toEqual(["LWB010", "LWB014"]);
  });

  it("parses the timestamps into dates", () => {
    const profile = mapToBasePowerProfile(createModel(), manufacturer, usageStats);

    expect(profile.createdAt.toISOString()).toBe("2024-01-02T03:04:05.000Z");
    expect(profile.updatedAt?.toISOString()).toBe("2025-01-02T03:04:05.000Z");
  });

  it("maps the author info", () => {
    const profile = mapToBasePowerProfile(createModel(), manufacturer, usageStats);

    expect(profile.author).toEqual({
      name: "Bram",
      email: "bram@example.com",
      githubUsername: "bramstroker",
    });
  });

  it("falls back to empty defaults when optional fields are missing", () => {
    const model = createModel({
      aliases: undefined,
      color_modes: undefined,
      max_power: undefined,
      min_version: undefined,
      sub_profile_count: 0,
      compatible_integrations: undefined,
      author_info: undefined as unknown as LibraryModel["author_info"],
    });

    const profile = mapToBasePowerProfile(model, manufacturer, usageStats);

    expect(profile.aliases).toEqual([]);
    expect(profile.colorModes).toEqual([]);
    expect(profile.maxPower).toBeNull();
    expect(profile.minVersion).toBeNull();
    expect(profile.subProfileCount).toBe(0);
    expect(profile.compatibleIntegrations).toEqual([]);
    expect(profile.author).toEqual({ name: "", email: undefined, githubUsername: "" });
  });

  it("treats a max power of zero as unknown", () => {
    const profile = mapToBasePowerProfile(createModel({ max_power: 0 }), manufacturer, usageStats);

    expect(profile.maxPower).toBeNull();
  });

  it("maps the LUT quality scores", () => {
    const model = createModel({ lut_quality: { score: 84.2, brightness: 97.9, color_temp: 84.2 } });

    const profile = mapToBasePowerProfile(model, manufacturer, usageStats);

    expect(profile.lutQuality).toEqual({ score: 84.2, brightness: 97.9, colorTemp: 84.2 });
  });

  it("leaves the LUT quality null for a profile without LUT files", () => {
    const profile = mapToBasePowerProfile(createModel(), manufacturer, usageStats);

    expect(profile.lutQuality).toBeNull();
  });
});
