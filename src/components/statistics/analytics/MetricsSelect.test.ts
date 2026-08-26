import { describe, expect, it } from "vitest";

import { DEFAULT_METRIC, parseMetricKey } from "./MetricsSelect";

describe("parseMetricKey", () => {
  it("accepts supported URL values", () => {
    expect(parseMetricKey("count")).toBe("count");
    expect(parseMetricKey("percentage")).toBe("percentage");
  });

  it("falls back for missing and unknown URL values", () => {
    expect(parseMetricKey(null)).toBe(DEFAULT_METRIC);
    expect(parseMetricKey("unknown_metric")).toBe(DEFAULT_METRIC);
  });
});
