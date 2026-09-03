import { describe, expect, it } from "vitest";

import { buildSensorYaml } from "./ProfileSetup";

describe("buildSensorYaml", () => {
  it("builds the library sensor snippet", () => {
    expect(
      buildSensorYaml({
        manufacturerDir: "signify",
        modelId: "LCT010",
        entityId: "light.my_light",
      }),
    ).toBe(
      [
        "powercalc:",
        "  sensors:",
        "    - entity_id: light.my_light",
        "      manufacturer: signify",
        "      model: LCT010",
      ].join("\n"),
    );
  });

  it("appends a sub profile to the model with a slash", () => {
    const yaml = buildSensorYaml({
      manufacturerDir: "lifx",
      modelId: "LIFX Z",
      subProfile: "length_9",
      entityId: "light.my_light",
    });

    expect(yaml).toContain("model: LIFX Z/length_9");
  });

  it("uses the manufacturer directory name, not its display name", () => {
    const yaml = buildSensorYaml({
      manufacturerDir: "tp-link",
      modelId: "L530",
      entityId: "light.x",
    });

    expect(yaml).toContain("manufacturer: tp-link");
  });
});
