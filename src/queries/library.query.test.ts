import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProfileStats } from "../api/analytics.api";
import { fetchProfiles } from "../api/analytics.api";
import type { LibraryJson, LibraryModel } from "../api/library.api";
import { fetchLibrary } from "../api/library.api";

import { libraryQuery } from "./library.query";

vi.mock("../api/library.api", () => ({ fetchLibrary: vi.fn() }));
vi.mock("../api/analytics.api", () => ({ fetchProfiles: vi.fn() }));

const fetchLibraryMock = vi.mocked(fetchLibrary);
const fetchProfilesMock = vi.mocked(fetchProfiles);

const createModel = (overrides: Partial<LibraryModel> = {}): LibraryModel => ({
  id: "LCA001",
  name: "Hue White A60",
  device_type: "light",
  author_info: { name: "Bram", github: "bramstroker" },
  updated_at: "2025-01-02T03:04:05Z",
  created_at: "2024-01-02T03:04:05Z",
  description: "",
  measure_device: "Shelly Plug S",
  measure_method: "script",
  measure_description: "",
  calculation_strategy: "lut",
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
          author_info: { name: "Someone Else", github: "someone" },
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

  it("indexes profiles by manufacturer/model key", async () => {
    const data = await runQuery();

    expect([...data.powerProfilesByKey.keys()]).toEqual([
      "signify/LCA001",
      "signify/LCT010",
      "ikea/LED1836G9",
    ]);
    expect(data.powerProfilesByKey.get("ikea/LED1836G9")?.name).toBe("TRADFRI bulb");
  });

  it("attaches usage stats from the analytics endpoint", async () => {
    const data = await runQuery();

    expect(data.powerProfilesByKey.get("signify/LCA001")?.usageStats).toEqual({
      installationCount: 40,
      deviceCount: 100,
      percentage: 2.5,
    });
  });

  it("defaults usage stats to zero when a profile has no analytics", async () => {
    const data = await runQuery();

    expect(data.powerProfilesByKey.get("signify/LCT010")?.usageStats).toEqual({
      installationCount: 0,
      deviceCount: 0,
      percentage: 0,
    });
  });

  it("collects unique manufacturers and authors", async () => {
    const data = await runQuery();

    expect(data.manufacturers).toEqual({
      signify: { dirName: "signify", fullName: "Signify", aliases: [] },
      ikea: { dirName: "ikea", fullName: "IKEA", aliases: [] },
    });
    expect(Object.keys(data.authors)).toEqual(["bramstroker", "someone"]);
  });

  it("returns an empty result set when the library is empty", async () => {
    fetchLibraryMock.mockResolvedValue({ manufacturers: [] });

    const data = await runQuery();

    expect(data).toEqual({
      powerProfiles: [],
      powerProfilesByKey: new Map(),
      total: 0,
      authors: {},
      manufacturers: {},
    });
  });

  it("still builds profiles when the analytics call yields nothing", async () => {
    fetchProfilesMock.mockResolvedValue([]);

    const data = await runQuery();

    expect(data.total).toBe(3);
    expect(data.powerProfiles[0].usageStats.deviceCount).toBe(0);
  });
});
