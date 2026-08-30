import { describe, expect, it } from "vitest";

import { CalculationStrategy } from "../types/CalculationStrategy";
import { ColorMode } from "../types/ColorMode";
import { DeviceType } from "../types/DeviceType";
import { createEmptyFilters } from "../types/LibraryFilters";
import type { LibraryFilters } from "../types/LibraryFilters";
import type { PowerProfile } from "../types/PowerProfile";

import {
  applyFilters,
  applyFiltersExcept,
  computeFacetCounts,
  computeRanges,
  matchesSearch,
} from "./libraryFiltering";

const createProfile = (overrides: Partial<PowerProfile> = {}): PowerProfile => ({
  manufacturer: { dirName: "signify", fullName: "Signify", aliases: [] },
  modelId: "LCA001",
  name: "Hue White A60",
  aliases: ["LWB010", "LWB014"],
  deviceType: DeviceType.LIGHT,
  colorModes: [ColorMode.BRIGHTNESS, ColorMode.COLOR_TEMP],
  updatedAt: new Date("2025-06-01T00:00:00Z"),
  createdAt: new Date("2024-01-01T00:00:00Z"),
  description: "",
  measureDevice: "Shelly Plug S",
  measureMethod: "script",
  measureDescription: "",
  calculationStrategy: CalculationStrategy.LUT,
  standbyPower: 0.4,
  standbyPowerOn: 0.5,
  maxPower: 9,
  authors: [{ name: "Bram", githubUsername: "bramstroker" }],
  subProfileCount: 0,
  minVersion: null,
  compatibleIntegrations: [],
  ean: [],
  lutQuality: { score: 98.3, brightness: 98.3, colorTemp: 96.1 },
  usageStats: { installationCount: 12, deviceCount: 34, percentage: 1.5 },
  ...overrides,
});

const hueLight = createProfile();

const ikeaLight = createProfile({
  manufacturer: { dirName: "ikea", fullName: "IKEA", aliases: [] },
  modelId: "LED1836G9",
  name: "TRADFRI bulb E27",
  aliases: [],
  colorModes: [ColorMode.BRIGHTNESS],
  measureDevice: "Tapo P110",
  calculationStrategy: CalculationStrategy.LUT,
  authors: [{ name: "Ruben", githubUsername: "RubenKelevra" }],
  standbyPower: 0.2,
  maxPower: 11,
  createdAt: new Date("2025-03-01T00:00:00Z"),
  updatedAt: null,
  lutQuality: { score: 25.5, brightness: 25.5 },
  usageStats: { installationCount: 400, deviceCount: 800, percentage: 20 },
});

const sonoffSwitch = createProfile({
  manufacturer: { dirName: "sonoff", fullName: "Sonoff", aliases: [] },
  modelId: "S31",
  name: "Smart plug",
  aliases: [],
  deviceType: DeviceType.SMART_SWITCH,
  colorModes: [],
  measureMethod: "manual",
  measureDevice: "Shelly Plug S",
  calculationStrategy: CalculationStrategy.FIXED,
  standbyPower: 0.9,
  maxPower: null,
  authors: [{ name: "Bram", githubUsername: "bramstroker" }],
  createdAt: new Date("2023-01-01T00:00:00Z"),
  lutQuality: null,
  usageStats: { installationCount: 5, deviceCount: 5, percentage: 0.1 },
  updatedAt: new Date("2023-02-01T00:00:00Z"),
});

const profiles = [hueLight, ikeaLight, sonoffSwitch];

type FilterOverrides = Partial<Omit<LibraryFilters, "facets">> & {
  facets?: Partial<LibraryFilters["facets"]>;
};

const withFilters = (overrides: FilterOverrides): LibraryFilters => ({
  ...createEmptyFilters(),
  ...overrides,
  facets: { ...createEmptyFilters().facets, ...overrides.facets },
});

const modelIds = (result: PowerProfile[]) => result.map((profile) => profile.modelId);

describe("applyFilters", () => {
  it("returns everything when no filter is active", () => {
    expect(applyFilters(profiles, createEmptyFilters())).toHaveLength(3);
  });

  it("filters on a single facet value", () => {
    const result = applyFilters(profiles, withFilters({ facets: { manufacturer: ["IKEA"] } }));

    expect(modelIds(result)).toEqual(["LED1836G9"]);
  });

  it("matches facet values case-insensitively", () => {
    const result = applyFilters(profiles, withFilters({ facets: { manufacturer: ["ikea"] } }));

    expect(modelIds(result)).toEqual(["LED1836G9"]);
  });

  it("ORs multiple values within one facet", () => {
    const result = applyFilters(
      profiles,
      withFilters({ facets: { deviceType: ["light", "smart_switch"] } }),
    );

    expect(modelIds(result)).toEqual(["LCA001", "LED1836G9", "S31"]);
  });

  it("ANDs across different facets", () => {
    const result = applyFilters(
      profiles,
      withFilters({ facets: { deviceType: ["light"], measureDevice: ["Shelly Plug S"] } }),
    );

    expect(modelIds(result)).toEqual(["LCA001"]);
  });

  it("matches a color mode contained in the profile's array", () => {
    const result = applyFilters(profiles, withFilters({ facets: { colorMode: ["color_temp"] } }));

    expect(modelIds(result)).toEqual(["LCA001"]);
  });

  it("filters on the LUT quality band", () => {
    expect(
      modelIds(applyFilters(profiles, withFilters({ facets: { qualityBand: ["Poor"] } }))),
    ).toEqual(["LED1836G9"]);
  });

  it("keeps profiles without a LUT under the not applicable band", () => {
    expect(
      modelIds(
        applyFilters(profiles, withFilters({ facets: { qualityBand: ["Not applicable"] } })),
      ),
    ).toEqual(["S31"]);
  });

  it("matches an author by display name or by github username", () => {
    expect(modelIds(applyFilters(profiles, withFilters({ facets: { author: ["Bram"] } })))).toEqual(
      ["LCA001", "S31"],
    );
    expect(
      modelIds(applyFilters(profiles, withFilters({ facets: { author: ["bramstroker"] } }))),
    ).toEqual(["LCA001", "S31"]);
  });

  it("matches each author on a multi-author profile", () => {
    const profile = createProfile({
      authors: [
        { name: "Bram", githubUsername: "bramstroker" },
        { name: "Contributor Two", githubUsername: "contributor-two" },
      ],
    });

    expect(
      modelIds(applyFilters([profile], withFilters({ facets: { author: ["contributor-two"] } }))),
    ).toEqual(["LCA001"]);
  });

  it("filters on a numeric range", () => {
    const result = applyFilters(profiles, withFilters({ ranges: { standbyPower: [0.3, 1] } }));

    expect(modelIds(result)).toEqual(["LCA001", "S31"]);
  });

  it("excludes profiles without a value for an active range", () => {
    const result = applyFilters(profiles, withFilters({ ranges: { maxPower: [0, 100] } }));

    expect(modelIds(result)).toEqual(["LCA001", "LED1836G9"]);
  });

  it("filters on a created-after date", () => {
    const result = applyFilters(profiles, withFilters({ createdAfter: "2024-06-01" }));

    expect(modelIds(result)).toEqual(["LED1836G9"]);
  });

  it("combines search with facets", () => {
    const result = applyFilters(
      profiles,
      withFilters({ search: "tradfri", facets: { deviceType: ["light"] } }),
    );

    expect(modelIds(result)).toEqual(["LED1836G9"]);
  });
});

describe("matchesSearch", () => {
  it("matches on model id, name, aliases and manufacturer", () => {
    expect(matchesSearch(hueLight, "lca0")).toBe(true);
    expect(matchesSearch(hueLight, "hue white")).toBe(true);
    expect(matchesSearch(hueLight, "LWB014")).toBe(true);
    expect(matchesSearch(hueLight, "signify")).toBe(true);
  });

  it("matches words spread across different fields", () => {
    // The real "amazon echo" case: manufacturer holds one word, the name the other.
    const echoDot = createProfile({
      manufacturer: { dirName: "amazon", fullName: "Amazon", aliases: [] },
      modelId: "B7W644",
      name: "Echo Dot (Gen4) with clock",
      aliases: ["A2H4LV5GIZ1JFT"],
    });

    expect(matchesSearch(echoDot, "amazon echo")).toBe(true);
    expect(matchesSearch(echoDot, "echo amazon")).toBe(true);
    expect(matchesSearch(echoDot, "amazon dot gen4")).toBe(true);
    expect(matchesSearch(echoDot, "amazon hue")).toBe(false);
  });

  it("ignores extra whitespace between and around words", () => {
    expect(matchesSearch(hueLight, "  signify   lca001 ")).toBe(true);
  });

  it("requires every word to match", () => {
    expect(matchesSearch(hueLight, "signify nonsense")).toBe(false);
  });

  it("matches on device type and color mode", () => {
    expect(matchesSearch(hueLight, "light")).toBe(true);
    expect(matchesSearch(hueLight, "color_temp")).toBe(true);
    expect(matchesSearch(hueLight, "signify light")).toBe(true);
    expect(matchesSearch(sonoffSwitch, "light")).toBe(false);
  });

  it("matches everything on an empty or whitespace term", () => {
    expect(matchesSearch(hueLight, "")).toBe(true);
    expect(matchesSearch(hueLight, "   ")).toBe(true);
  });
});

describe("computeFacetCounts", () => {
  it("counts values and sorts by descending count", () => {
    expect(computeFacetCounts(profiles, "deviceType")).toEqual([
      { value: "light", count: 2 },
      { value: "smart_switch", count: 1 },
    ]);
  });

  it("counts each entry of a multi-valued facet", () => {
    expect(computeFacetCounts(profiles, "colorMode")).toEqual([
      { value: "brightness", count: 2 },
      { value: "color_temp", count: 1 },
    ]);
  });

  it("buckets every profile into exactly one LUT quality band", () => {
    expect(computeFacetCounts(profiles, "qualityBand")).toEqual([
      { value: "Excellent", count: 1 },
      { value: "Not applicable", count: 1 },
      { value: "Poor", count: 1 },
    ]);
  });

  it("lists authors by display name only, not by github username", () => {
    expect(computeFacetCounts(profiles, "author")).toEqual([
      { value: "Bram", count: 2 },
      { value: "Ruben", count: 1 },
    ]);
  });
});

describe("applyFiltersExcept", () => {
  it("ignores the named facet so its own counts stay meaningful", () => {
    const filters = withFilters({ facets: { deviceType: ["light"] } });

    expect(modelIds(applyFiltersExcept(profiles, filters, "deviceType"))).toEqual([
      "LCA001",
      "LED1836G9",
      "S31",
    ]);
    expect(modelIds(applyFiltersExcept(profiles, filters, "manufacturer"))).toEqual([
      "LCA001",
      "LED1836G9",
    ]);
  });
});

describe("computeRanges", () => {
  it("derives inclusive bounds and skips profiles without a value", () => {
    expect(computeRanges(profiles)).toEqual({
      standbyPower: [0, 1],
      maxPower: [9, 11],
      installationCount: [5, 400],
    });
  });

  it("omits a key when no profile carries a value", () => {
    const withoutMaxPower = profiles.map((profile) => ({ ...profile, maxPower: null }));

    expect(computeRanges(withoutMaxPower).maxPower).toBeUndefined();
  });
});

describe("device metadata facets", () => {
  const bulb = createProfile({
    modelId: "LCA001",
    deviceSpecs: {
      socket: ["E26", "E27"],
      formFactor: "bulb",
      lumens: 806,
      connectivity: ["zigbee"],
    },
    mainsVoltage: 230,
  });
  const spot = createProfile({
    modelId: "GU10",
    deviceSpecs: {
      socket: ["GU10"],
      formFactor: "spot",
      lumens: 350,
      connectivity: ["wifi", "bluetooth"],
    },
    mainsVoltage: 120,
  });
  const plug = createProfile({ modelId: "PLUG" });

  it("filters on the socket a light fits", () => {
    const filters = {
      ...createEmptyFilters(),
      facets: { ...createEmptyFilters().facets, socket: ["E27"] },
    };

    expect(applyFilters([bulb, spot, plug], filters).map((profile) => profile.modelId)).toEqual([
      "LCA001",
    ]);
  });

  it("counts every socket a profile fits", () => {
    expect(computeFacetCounts([bulb], "socket")).toEqual([
      { value: "E26", count: 1 },
      { value: "E27", count: 1 },
    ]);
  });

  it("matches a profile on any one of its protocols", () => {
    const filters = {
      ...createEmptyFilters(),
      facets: { ...createEmptyFilters().facets, connectivity: ["bluetooth"] },
    };

    expect(applyFilters([bulb, spot, plug], filters).map((profile) => profile.modelId)).toEqual([
      "GU10",
    ]);
  });

  it("groups supply voltages into two bands", () => {
    const counts = computeFacetCounts([bulb, spot, plug], "mainsVoltage");

    // Equal counts fall back to alphabetical order.
    expect(counts).toEqual([
      { value: "120 V", count: 1 },
      { value: "230 V", count: 1 },
    ]);
  });

  it("leaves a profile without device specs out of those facets", () => {
    const counts = computeFacetCounts([bulb, spot, plug], "socket");

    expect(counts.reduce((total, option) => total + option.count, 0)).toBe(3);
  });

  it("filters on brightness", () => {
    const filters = {
      ...createEmptyFilters(),
      ranges: { lumens: [500, 1000] as [number, number] },
    };

    expect(applyFilters([bulb, spot, plug], filters).map((profile) => profile.modelId)).toEqual([
      "LCA001",
    ]);
  });
});

describe("search", () => {
  it("finds a profile by the barcode on its box", () => {
    const profile = createProfile({ ean: ["8719514291218"] });

    expect(matchesSearch(profile, "8719514291218")).toBe(true);
  });
});
