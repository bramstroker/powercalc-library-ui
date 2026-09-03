import { describe, expect, it } from "vitest";

import { DEFAULT_METRIC, isMetricKey, parseMetricKey } from "./sensorMetric";

describe("sensor metric parsing", () => {
  it.each(["installation_count", "count", "percentage"])("accepts %s", (metric) => {
    expect(isMetricKey(metric)).toBe(true);
    expect(parseMetricKey(metric)).toBe(metric);
  });

  it.each([null, "", "unknown", "installations"])("defaults invalid metric %s", (metric) => {
    expect(isMetricKey(metric)).toBe(false);
    expect(parseMetricKey(metric)).toBe(DEFAULT_METRIC);
  });
});
