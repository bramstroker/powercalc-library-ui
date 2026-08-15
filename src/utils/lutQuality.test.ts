import { describe, expect, it } from "vitest";

import { getQualityBand, sortByQualityBand } from "./lutQuality";

describe("getQualityBand", () => {
  it.each([
    [100, "Excellent"],
    [95, "Excellent"],
    [94.9, "Good"],
    [85, "Good"],
    [84.9, "Fair"],
    [70, "Fair"],
    [69.9, "Poor"],
    [0, "Poor"],
  ])("puts %s in the %s band", (score, band) => {
    expect(getQualityBand(score)).toBe(band);
  });

  it("reports profiles without a score as not applicable", () => {
    expect(getQualityBand(undefined)).toBe("Not applicable");
    expect(getQualityBand(null)).toBe("Not applicable");
  });
});

describe("sortByQualityBand", () => {
  it("orders count-sorted options back into band order", () => {
    const options = [
      { value: "Excellent", count: 400 },
      { value: "Not applicable", count: 200 },
      { value: "Poor", count: 30 },
      { value: "Good", count: 20 },
    ];

    expect(sortByQualityBand(options).map((option) => option.value)).toEqual([
      "Excellent",
      "Good",
      "Poor",
      "Not applicable",
    ]);
  });
});
