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
  analyticsProfilesQuery,
  analyticsTimeSeriesQuery,
  dailySummaryQuery,
  installationsAnalyticsQuery,
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

  it("loads installation dashboard data through one shared query", async () => {
    const from = new Date("2026-08-01T00:00:00Z");
    const to = new Date("2026-08-30T00:00:00Z");
    const versionsData = { ha_versions: [], powercalc_versions: [] };
    const countriesData = [{ country_code: "nl", installation_count: 1, percentage: 100 }];
    const optinsData = {
      query: { metric: "optin_date", bucket: "day", timezone: "UTC", from, to },
      series: [],
    };
    const sensorsData = {
      query: { metric: "sensors", bucket: "day", timezone: "UTC", from, to },
      series: [],
    };
    vi.mocked(fetchVersions).mockResolvedValue(versionsData);
    vi.mocked(fetchCountries).mockResolvedValue(countriesData);
    vi.mocked(fetchTimeseries).mockResolvedValueOnce(optinsData).mockResolvedValueOnce(sensorsData);

    const query = installationsAnalyticsQuery(from, to);
    const queryFn = query.queryFn;
    if (!queryFn) throw new Error("Expected an installations query function");

    await expect(queryFn({} as never)).resolves.toEqual({
      versionsData,
      countriesData,
      optinsData,
      sensorsData,
    });
    expect(query.queryKey).toEqual(["analytics", "installations", "2026-08-01", "2026-08-30"]);
  });
});
