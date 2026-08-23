import { describe, expect, it } from "vitest";

import { formatTimestampUtc } from "./dateFormat";

describe("formatTimestampUtc", () => {
  it("uses a stable UTC representation", () => {
    expect(formatTimestampUtc(new Date("2025-01-02T03:04:05Z"))).toBe("Jan 2, 2025, 3:04 AM UTC");
  });
});
