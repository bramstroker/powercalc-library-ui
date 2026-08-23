import { describe, expect, it } from "vitest";

import { contributorTierRange, getContributorTier } from "./contributorTier";

describe("getContributorTier", () => {
  it.each([
    [0, null],
    [1, null],
    [2, null],
    [3, "Watt"],
    [7, "Watt"],
    [8, "Kilowatt"],
    [14, "Kilowatt"],
    [15, "Megawatt"],
    [36, "Megawatt"],
  ])("puts %i profiles in the %s tier", (profileCount, tier) => {
    expect(getContributorTier(profileCount)?.tier ?? null).toBe(tier);
  });

  it("pairs each tier with its medal", () => {
    expect(getContributorTier(3)?.medal).toBe("bronze");
    expect(getContributorTier(8)?.medal).toBe("silver");
    expect(getContributorTier(50)?.medal).toBe("gold");
  });
});

describe("contributorTierRange", () => {
  it("bounds the lower tiers and leaves the top one open", () => {
    expect(contributorTierRange("Watt")).toBe("3–7 profiles");
    expect(contributorTierRange("Kilowatt")).toBe("8–14 profiles");
    expect(contributorTierRange("Megawatt")).toBe("15+ profiles");
  });
});
