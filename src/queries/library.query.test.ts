import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProfileStats } from "../api/analytics.api";
import { fetchProfiles } from "../api/analytics.api";
import type { LibraryJson, LibraryModel } from "../api/library.api";
import { fetchLibrary } from "../api/library.api";
import { CalculationStrategy } from "../types/CalculationStrategy";

import { libraryQuery } from "./library.query";

vi.mock("../api/library.api", () => ({ fetchLibrary: vi.fn() }));
vi.mock("../api/analytics.api", () => ({ fetchProfiles: vi.fn() }));

const fetchLibraryMock = vi.mocked(fetchLibrary);
const fetchProfilesMock = vi.mocked(fetchProfiles);

const createModel = (overrides: Partial<LibraryModel> = {}): LibraryModel => ({
  id: "LCA001",
  name: "Hue White A60",
  device_type: "light",
  authors: [{ name: "Bram", github: "bramstroker" }],
  updated_at: "2025-01-02T03:04:05Z",
  created_at: "2024-01-02T03:04:05Z",
  description: "",
  measure_device: "Shelly Plug S",
  measure_method: "script",
  measure_description: "",
  calculation_strategy: CalculationStrategy.LUT,
  standby_power: 0.4,
  sub_profile_count: 0,
  ...overrides,
});

const library: LibraryJson = {
  manufacturers: [
    {
      full_name: "Signify",
      dir_name: "signify",
      models: [createModel(), createModel({ id: "LCT010", name: "Hue Color" })],
    },
    {
      full_name: "IKEA",
      dir_name: "ikea",
      models: [
        createModel({
          id: "LED1836G9",
          name: "TRADFRI bulb",
          authors: [{ name: "Someone Else", github: "someone" }],
        }),
      ],
    },
  ],
};

const analytics: ProfileStats[] = [
  { manufacturer: "signify", model: "LCA001", count: 100, installation_count: 40, percentage: 2.5 },
];

const runQuery = () => libraryQuery().queryFn();

describe("libraryQuery", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchLibraryMock.mockResolvedValue(library);
    fetchProfilesMock.mockResolvedValue(analytics);
  });

  it("flattens all manufacturer models into power profiles", async () => {
    const data = await runQuery();

    expect(data.total).toBe(3);
    expect(data.powerProfiles).toHaveLength(3);
    expect(data.powerProfiles.map((p) => p.modelId)).toEqual(["LCA001", "LCT010", "LED1836G9"]);
  });

  it("indexes profiles by their slugified URL key", async () => {
    const data = await runQuery();

    expect([...data.powerProfilesBySlugKey.keys()]).toEqual([
      "signify/lca001",
      "signify/lct010",
      "ikea/led1836g9",
    ]);
    expect(data.powerProfilesBySlugKey.get("ikea/led1836g9")?.name).toBe("TRADFRI bulb");
  });

  it("indexes legacy model IDs so the loader can redirect them to the current URL", async () => {
    fetchLibraryMock.mockResolvedValue({
      manufacturers: [
        {
          full_name: "Signify",
          dir_name: "signify",
          models: [createModel({ legacy_ids: ["Hue LCA 001", "old-lca001"] })],
        },
      ],
    });

    const data = await runQuery();

    expect(data.powerProfilesBySlugKey.get("signify/hue-lca-001")?.modelId).toBe("LCA001");
    expect(data.powerProfilesBySlugKey.get("signify/old-lca001")?.modelId).toBe("LCA001");
  });

  it("groups profiles per manufacturer and per author", async () => {
    const data = await runQuery();

    expect(data.profilesByManufacturerSlug.get("signify")?.map((p) => p.modelId)).toEqual([
      "LCA001",
      "LCT010",
    ]);
    expect(data.profilesByAuthorSlug.get("bramstroker")).toHaveLength(2);
    expect(data.contributionCountsByAuthor.get("bramstroker")).toBe(2);
  });

  it("builds contributor summaries with coverage and contribution dates", async () => {
    const data = await runQuery();

    expect(data.contributorSummaries).toEqual([
      expect.objectContaining({
        author: expect.objectContaining({ githubUsername: "bramstroker" }),
        profileCount: 2,
        manufacturerCount: 1,
        deviceTypes: ["light"],
        firstContributionAt: new Date("2024-01-02T03:04:05Z"),
        latestContributionAt: new Date("2024-01-02T03:04:05Z"),
        latestProfile: expect.objectContaining({ modelId: "LCA001" }),
      }),
      expect.objectContaining({
        author: expect.objectContaining({ githubUsername: "someone" }),
        profileCount: 1,
        manufacturerCount: 1,
      }),
    ]);
  });

  it("attaches usage stats from the analytics endpoint", async () => {
    const data = await runQuery();

    expect(data.powerProfilesBySlugKey.get("signify/lca001")?.usageStats).toEqual({
      installationCount: 40,
      deviceCount: 100,
      percentage: 2.5,
    });
  });

  it("defaults usage stats to zero when a profile has no analytics", async () => {
    const data = await runQuery();

    expect(data.powerProfilesBySlugKey.get("signify/lct010")?.usageStats).toEqual({
      installationCount: 0,
      deviceCount: 0,
      percentage: 0,
    });
  });

  it("collects unique manufacturers and authors", async () => {
    const data = await runQuery();

    expect(data.manufacturers).toEqual({
      signify: {
        dirName: "signify",
        fullName: "Signify",
        aliases: [],
        website: null,
        country: null,
        description: null,
      },
      ikea: {
        dirName: "ikea",
        fullName: "IKEA",
        aliases: [],
        website: null,
        country: null,
        description: null,
      },
    });
    expect(Object.keys(data.authors)).toEqual(["bramstroker", "someone"]);
  });

  it("collects every author from a profile with multiple authors", async () => {
    fetchLibraryMock.mockResolvedValue({
      manufacturers: [
        {
          full_name: "Signify",
          dir_name: "signify",
          models: [
            createModel({
              authors: [
                { name: "Bram", github: "bramstroker" },
                { name: "Contributor Two", github: "contributor-two" },
              ],
            }),
          ],
        },
      ],
    });

    const data = await runQuery();

    expect(Object.keys(data.authors)).toEqual(["bramstroker", "contributor-two"]);
  });

  it("returns an empty result set when the library is empty", async () => {
    fetchLibraryMock.mockResolvedValue({ manufacturers: [] });

    const data = await runQuery();

    expect(data).toEqual({
      powerProfiles: [],
      powerProfilesBySlugKey: new Map(),
      total: 0,
      authors: {},
      authorsBySlug: {},
      manufacturers: {},
      manufacturersBySlug: {},
      profilesByManufacturerSlug: new Map(),
      profilesByAuthorSlug: new Map(),
      contributionCountsByAuthor: new Map(),
      contributorSummaries: [],
    });
  });

  it("still builds profiles when the analytics call yields nothing", async () => {
    fetchProfilesMock.mockResolvedValue([]);

    const data = await runQuery();

    expect(data.total).toBe(3);
    expect(data.powerProfiles[0].usageStats.deviceCount).toBe(0);
  });
});
