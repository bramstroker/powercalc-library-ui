import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchCountries,
  fetchProfiles,
  fetchSensors,
  fetchSummary,
  fetchTimeseries,
  fetchVersions,
} from "../api/analytics.api";

import {
  analyticsCountriesQuery,
  analyticsProfilesQuery,
  analyticsTimeSeriesQuery,
  analyticsVersionsQuery,
  dailySummaryQuery,
  sensorDimensionsQuery,
} from "./analytics.query";

vi.mock("../api/analytics.api", () => ({
  fetchCountries: vi.fn(),
  fetchProfiles: vi.fn(),
  fetchSensors: vi.fn(),
  fetchSummary: vi.fn(),
  fetchTimeseries: vi.fn(),
  fetchVersions: vi.fn(),
}));

describe("analytics queries", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("uses one namespaced key and freshness policy for the daily summary", () => {
    expect(dailySummaryQuery()).toMatchObject({
      queryKey: ["analytics", "summary"],
      queryFn: fetchSummary,
      staleTime: 24 * 60 * 60 * 1000,
    });
  });

  it("defines stable keys for sensor dimensions and profiles", () => {
    expect(sensorDimensionsQuery()).toMatchObject({
      queryKey: ["analytics", "sensor-dimensions"],
      queryFn: fetchSensors,
    });
    expect(analyticsProfilesQuery()).toMatchObject({
      queryKey: ["analytics", "profiles"],
      queryFn: fetchProfiles,
    });
  });

  it("caches versions and countries independently of time-series dates", () => {
    expect(analyticsVersionsQuery()).toMatchObject({
      queryKey: ["analytics", "versions"],
      queryFn: fetchVersions,
      staleTime: 24 * 60 * 60 * 1000,
    });
    expect(analyticsCountriesQuery()).toMatchObject({
      queryKey: ["analytics", "countries"],
      queryFn: fetchCountries,
      staleTime: 24 * 60 * 60 * 1000,
    });
  });

  it("includes every request parameter in the time-series key", async () => {
    const from = new Date("2026-07-01T00:00:00Z");
    const to = new Date("2026-08-01T00:00:00Z");
    vi.mocked(fetchTimeseries).mockResolvedValue({
      query: { metric: "sensors", bucket: "week", timezone: "UTC", from, to },
      series: [],
    });

    const query = analyticsTimeSeriesQuery("sensors", "week", "UTC", from, to);

    expect(query.queryKey).toEqual([
      "analytics",
      "time-series",
      "sensors",
      "week",
      "UTC",
      "2026-07-01",
      "2026-08-01",
    ]);
    const queryFn = query.queryFn;
    if (!queryFn) throw new Error("Expected a time-series query function");
    await queryFn({} as never);
    expect(fetchTimeseries).toHaveBeenCalledWith("sensors", "week", "UTC", from, to);
  });
});
