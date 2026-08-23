import { describe, expect, it } from "vitest";

import { plural } from "./plural";

describe("plural", () => {
  it("keeps the singular for exactly one", () => {
    expect(plural(1, "profile")).toBe("1 profile");
    expect(plural(1, "manufacturer")).toBe("1 manufacturer");
  });

  it("pluralises everything else, zero included", () => {
    expect(plural(0, "profile")).toBe("0 profiles");
    expect(plural(2, "profile")).toBe("2 profiles");
  });

  it("groups thousands", () => {
    expect(plural(7223, "device")).toBe("7,223 devices");
  });

  it("takes an irregular plural", () => {
    expect(plural(2, "device type")).toBe("2 device types");
    expect(plural(3, "entry", "entries")).toBe("3 entries");
  });
});
