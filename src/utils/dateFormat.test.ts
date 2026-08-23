import { describe, expect, it } from "vitest";

import { formatRelativeDate } from "./dateFormat";

describe("formatRelativeDate", () => {
  const now = new Date("2026-08-23T12:00:00Z");

  it("uses the most useful recent unit", () => {
    expect(formatRelativeDate(new Date("2026-08-21T12:00:00Z"), now)).toBe("2 days ago");
    expect(formatRelativeDate(new Date("2026-08-23T10:00:00Z"), now)).toBe("2 hours ago");
  });

  it("handles future dates", () => {
    expect(formatRelativeDate(new Date("2026-08-24T12:00:00Z"), now)).toBe("tomorrow");
  });
});
