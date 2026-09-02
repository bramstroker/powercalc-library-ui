import { describe, expect, it } from "vitest";

import type { Manufacturer, PowerProfile } from "../types/PowerProfile";

import {
  manufacturerIntroduction,
  manufacturerLibraryIntroduction,
} from "./manufacturerPresentation";

const manufacturer: Manufacturer = {
  dirName: "example",
  fullName: "Example Devices",
  aliases: [],
  description: "A specialist connected-device manufacturer.",
};

const profile = (deviceType: string) => ({ deviceType }) as PowerProfile;

describe("manufacturerIntroduction", () => {
  it("combines supplied brand information with the actual library coverage", () => {
    const introduction = manufacturerIntroduction(manufacturer, [
      profile("smart_switch"),
      profile("light"),
      profile("light"),
    ]);

    expect(introduction).toContain(manufacturer.description);
    expect(introduction).toContain("Powercalc measurements for products from Example Devices");
    expect(introduction).toContain("lights and smart switches");
  });

  it("keeps supplied copy out of the generated library paragraph", () => {
    const generated = manufacturerLibraryIntroduction(manufacturer, [profile("light")]);

    expect(generated).not.toContain(manufacturer.description);
    expect(generated).toContain("products from Example Devices");
  });
});
