import { describe, expect, it } from "vitest";

import { DEVICE_TYPE_CATEGORY } from "./profileCategories";

describe("device type category copy", () => {
  it("gives device types distinct introductions beyond their profile count", () => {
    const light = DEVICE_TYPE_CATEGORY.description("light", "Light", 42);
    const network = DEVICE_TYPE_CATEGORY.description("network", "Network", 42);

    expect(light).toContain("smart bulbs, fixtures, light strips");
    expect(network).toContain("routers, access points, switches");
    expect(light).not.toBe(network);
    expect(light).toContain("42 community-contributed Powercalc");
  });
});
