import { describe, expect, it } from "vitest";

import { colorModeLabel, humanizeIdentifier } from "./profilePresentation";

describe("humanizeIdentifier", () => {
  it("title-cases underscore-separated identifiers", () => {
    expect(humanizeIdentifier("smart_switch")).toBe("Smart Switch");
    expect(humanizeIdentifier("multi_switch")).toBe("Multi Switch");
  });

  it("keeps acronyms spelled the way people write them", () => {
    expect(humanizeIdentifier("generic_iot")).toBe("Generic IoT");
    expect(humanizeIdentifier("lut")).toBe("LUT");
  });
});

describe("colorModeLabel", () => {
  it("names the colour modes the way the plots title themselves", () => {
    expect(colorModeLabel("hs")).toBe("Hue and saturation");
    expect(colorModeLabel("color_temp")).toBe("Color temperature");
    expect(colorModeLabel("effect")).toBe("Effects");
    expect(colorModeLabel("brightness")).toBe("Brightness");
  });

  it("falls back to the generic humaniser for anything unmapped", () => {
    expect(colorModeLabel("rgb_ww")).toBe("Rgb Ww");
  });
});
