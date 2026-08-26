import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_ENDPOINTS } from "../config/api";

import { fetchProfile, fetchSummary, fetchTimeseries } from "./analytics.api";

const jsonResponse = (body: unknown) =>
  ({ ok: true, json: () => Promise.resolve(body) }) as Response;

describe("analytics api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches the summary", async () => {
    const summary = {
      sampled_installations: 1000,
      snapshots: 10,
      hacs_installs: 500,
      github_stars: 1200,
      total_sensors: 42000,
      contributors: 250,
    };
    vi.mocked(fetch).mockResolvedValue(jsonResponse(summary));

    await expect(fetchSummary()).resolves.toEqual(summary);
    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.ANALYTICS_SUMMARY, {
      signal: expect.any(AbortSignal),
    });
  });

  it("url encodes the profile path and echoes back manufacturer and model", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ count: 5, installation_count: 3, percentage: 0.1 }),
    );

    const stats = await fetchProfile("signify", "LCA001/x");

    expect(fetch).toHaveBeenCalledWith(`${API_ENDPOINTS.ANALYTICS_PROFILES}/signify/LCA001%2Fx`, {
      signal: expect.any(AbortSignal),
    });
    expect(stats).toEqual({
      manufacturer: "signify",
      model: "LCA001/x",
      count: 5,
      installation_count: 3,
      percentage: 0.1,
    });
  });

  it("builds the timeseries query string from its arguments", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ query: {}, series: [] }));

    await fetchTimeseries(
      "optin_date",
      "week",
      "Europe/Amsterdam",
      new Date("2024-03-01T00:00:00Z"),
      new Date("2024-04-01T00:00:00Z"),
    );

    const url = new URL(vi.mocked(fetch).mock.calls[0][0] as string);
    expect(url.pathname).toBe("/analytics/timeseries");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      metric: "optin_date",
      bucket: "week",
      timezone: "Europe/Amsterdam",
      from: "2024-03-01",
      to: "2024-04-01",
    });
  });

  it("throws when the summary response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503 } as Response);

    await expect(fetchSummary()).rejects.toThrow();
  });
});
