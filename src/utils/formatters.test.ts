import { describe, expect, it } from "vitest";

import { compactNumberFormat, formatCountryName, numberFormat } from "./formatters";

describe("shared formatters", () => {
  it("formats regular and compact numbers consistently", () => {
    expect(numberFormat.format(12345)).toBe("12,345");
    expect(compactNumberFormat.format(1200)).toBe("1.2K");
  });

  it("turns country codes into readable names", () => {
    expect(formatCountryName("nl")).toBe("Netherlands");
  });

  it("preserves malformed country values", () => {
    expect(formatCountryName("not-a-country")).toBe("not-a-country");
  });
});
