import { describe, expect, it } from "vitest";

import type { PowerProfile } from "../types/PowerProfile";

import { parseProfileSort, sortProfiles } from "./profileSort";

const profile = (name: string, installations: number, createdAt: string) =>
  ({
    name,
    createdAt: new Date(createdAt),
    usageStats: { installationCount: installations },
  }) as PowerProfile;

const alpha = profile("Alpha", 5, "2025-01-01T00:00:00Z");
const beta = profile("Beta", 20, "2025-01-01T00:00:00Z");
const gamma = profile("Gamma", 20, "2024-01-01T00:00:00Z");

describe("profileSort", () => {
  it("falls back to popular for missing and unknown URL values", () => {
    expect(parseProfileSort(null)).toBe("popular");
    expect(parseProfileSort("unexpected")).toBe("popular");
    expect(parseProfileSort("newest")).toBe("newest");
  });

  it("sorts by popularity with a deterministic name tie-break", () => {
    expect(sortProfiles([alpha, gamma, beta], "popular")).toEqual([beta, gamma, alpha]);
  });

  it("sorts equally new profiles by name", () => {
    expect(sortProfiles([gamma, beta, alpha], "newest")).toEqual([alpha, beta, gamma]);
  });

  it("does not mutate the caller's array", () => {
    const profiles = [gamma, alpha, beta];

    sortProfiles(profiles, "name");

    expect(profiles).toEqual([gamma, alpha, beta]);
  });
});
